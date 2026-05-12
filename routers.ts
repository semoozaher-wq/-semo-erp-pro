import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as bcrypt from "bcryptjs";
import { getDb, getUserByOpenId, getProductsByUserId, getCustomersByUserId, getSalesByUserId, getExpensesByUserId, getNotificationsByUserId, createProduct, updateProduct, deleteProduct, createCustomer, updateCustomer, getSuppliersByUserId, createSupplier, updateSupplier, createExpense, createNotification, getDraftInvoicesByUserId, saveDraftInvoice, updateDraftInvoice, getSaleById, getSaleItems, createSale, createSaleItem, getReturnsByUserId, createReturn, createCustomerPayment, createSupplierPayment, getCustomerById, getSupplierById, markNotificationAsRead } from "./db";
import { users, InsertUser } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// ============ إجراءات محمية للمسؤولين فقط ============
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  // ============ المصادقة والمستخدمين ============
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    // تسجيل دخول بـ Email/Password
    loginWithEmail: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        const result = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        const user = result.length > 0 ? result[0] : null;

        if (!user || !user.password) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(input.password, user.password);
        if (!passwordMatch) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
        }

        return { success: true, user };
      }),

    // تسجيل حساب جديد
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        // التحقق من عدم وجود بريد إلكتروني مسجل
        const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (existing.length > 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);
        const newUser: InsertUser = {
          openId: `email_${input.email}_${Date.now()}`,
          email: input.email,
          password: hashedPassword,
          name: input.name,
          phone: input.phone,
          role: 'employee',
          isActive: true,
        };

        await db.insert(users).values(newUser);
        return { success: true, message: 'Account created successfully' };
      }),

    // تحديث كلمة المرور
    changePassword: protectedProcedure
      .input(z.object({
        oldPassword: z.string(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        const user = ctx.user;
        if (!user.password) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'User has no password set' });
        }

        const passwordMatch = await bcrypt.compare(input.oldPassword, user.password);
        if (!passwordMatch) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Old password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(input.newPassword, 10);
        await db.update(users).set({ password: hashedPassword }).where(eq(users.id, user.id));

        return { success: true, message: 'Password changed successfully' };
      }),
  }),

  // ============ المنتجات ============
  products: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getProductsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        code: z.string(),
        name: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
        quantity: z.number().default(0),
        minQuantity: z.number().default(10),
        purchasePrice: z.string(),
        sellingPrice: z.string(),
        barcode: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createProduct({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.any(),
      }))
      .mutation(async ({ input }) => {
        return updateProduct(input.id, input.data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteProduct(input.id);
      }),
  }),

  // ============ العملاء ============
  customers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getCustomersByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().optional(),
        phone: z.string(),
        address: z.string().optional(),
        city: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createCustomer({
          userId: ctx.user.id,
          ...input,
          totalDebt: 0,
          totalPaid: 0,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.any(),
      }))
      .mutation(async ({ input }) => {
        return updateCustomer(input.id, input.data);
      }),
  }),

  // ============ الموردين ============
  suppliers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getSuppliersByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().optional(),
        phone: z.string(),
        address: z.string().optional(),
        city: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createSupplier({
          userId: ctx.user.id,
          ...input,
          totalDebt: 0,
          totalPaid: 0,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.any(),
      }))
      .mutation(async ({ input }) => {
        return updateSupplier(input.id, input.data);
      }),
  }),

  // ============ المبيعات ============
  sales: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getSalesByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getSaleById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        customerId: z.number().optional(),
        invoiceNumber: z.string(),
        subtotal: z.string(),
        discount: z.string().default('0'),
        tax: z.string().default('0'),
        total: z.string(),
        paymentMethod: z.enum(['cash', 'card', 'check', 'credit']),
        paymentStatus: z.enum(['paid', 'pending', 'partial']).default('paid'),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          unitPrice: z.string(),
          discount: z.string().default('0'),
          total: z.string(),
        })),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        const sale = await createSale({
          userId: ctx.user.id,
          customerId: input.customerId,
          invoiceNumber: input.invoiceNumber,
          subtotal: input.subtotal,
          discount: input.discount,
          tax: input.tax,
          total: input.total,
          paymentMethod: input.paymentMethod,
          paymentStatus: input.paymentStatus,
          notes: input.notes,
        });

        // إضافة عناصر المبيعة
        for (const item of input.items) {
          await createSaleItem({
            saleId: (sale as any).insertId,
            ...item,
          });
        }

        // إنشاء إشعار بمبيعة كبيرة
        const totalAmount = parseFloat(input.total);
        if (totalAmount > 1000) {
          await createNotification({
            userId: ctx.user.id,
            type: 'high_sale',
            title: 'مبيعة كبيرة',
            message: `تم تسجيل مبيعة بقيمة ${totalAmount} ريال`,
            data: { saleId: (sale as any).insertId, amount: totalAmount },
          });
        }

        return sale;
      }),
  }),

  // ============ المصاريف ============
  expenses: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getExpensesByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        category: z.string(),
        description: z.string().optional(),
        amount: z.string(),
        paymentMethod: z.enum(['cash', 'card', 'check', 'transfer']),
        reference: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createExpense({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),

  // ============ الإشعارات ============
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getNotificationsByUserId(ctx.user.id);
    }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return markNotificationAsRead(input.id);
      }),
  }),

  // ============ المرتجعات ============
  returns: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getReturnsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        saleId: z.number(),
        customerId: z.number().optional(),
        returnNumber: z.string(),
        reason: z.string(),
        totalAmount: z.string(),
        refundMethod: z.enum(['cash', 'credit', 'replacement']),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          unitPrice: z.string(),
          total: z.string(),
        })),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        const returnRecord = await createReturn({
          userId: ctx.user.id,
          saleId: input.saleId,
          customerId: input.customerId,
          returnNumber: input.returnNumber,
          reason: input.reason,
          totalAmount: input.totalAmount,
          refundMethod: input.refundMethod,
          notes: input.notes,
        });

        return returnRecord;
      }),
  }),

  // ============ فواتير مسودة (للحفظ التلقائي) ============
  draftInvoices: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getDraftInvoicesByUserId(ctx.user.id);
    }),

    save: protectedProcedure
      .input(z.object({
        customerId: z.number().optional(),
        items: z.array(z.any()),
        subtotal: z.string(),
        discount: z.string().default('0'),
        tax: z.string().default('0'),
        total: z.string(),
        paymentMethod: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return saveDraftInvoice({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.any(),
      }))
      .mutation(async ({ input }) => {
        return updateDraftInvoice(input.id, input.data);
      }),
  }),

  // ============ تسديدات العملاء ============
  customerPayments: router({
    create: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        amount: z.string(),
        paymentMethod: z.enum(['cash', 'card', 'check', 'transfer']),
        reference: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createCustomerPayment({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),

  // ============ تسديدات الموردين ============
  supplierPayments: router({
    create: protectedProcedure
      .input(z.object({
        supplierId: z.number(),
        amount: z.string(),
        paymentMethod: z.enum(['cash', 'card', 'check', 'transfer']),
        reference: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createSupplierPayment({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
