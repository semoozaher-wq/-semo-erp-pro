import { eq, and, gte, lte, like, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, customers, sales, saleItems, returns, expenses, notifications, draftInvoices, suppliers, customerPayments, supplierPayments } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      email: (user.email || '') as string,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "phone"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastLogin !== undefined) {
      values.lastLogin = user.lastLogin;
      updateSet.lastLogin = user.lastLogin;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastLogin) {
      values.lastLogin = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastLogin = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ منتجات ============

export async function getProductsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.userId, userId));
}

export async function getProductById(productId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return result;
}

export async function updateProduct(productId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(data).where(eq(products.id, productId));
}

export async function deleteProduct(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(products).where(eq(products.id, productId));
}

// ============ عملاء ============

export async function getCustomersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers).where(eq(customers.userId, userId));
}

export async function getCustomerById(customerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCustomer(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(customers).values(data);
}

export async function updateCustomer(customerId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(customers).set(data).where(eq(customers.id, customerId));
}

// ============ موردين ============

export async function getSuppliersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(suppliers).where(eq(suppliers.userId, userId));
}

export async function getSupplierById(supplierId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(suppliers).where(eq(suppliers.id, supplierId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSupplier(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(suppliers).values(data);
}

export async function updateSupplier(supplierId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(suppliers).set(data).where(eq(suppliers.id, supplierId));
}

// ============ مبيعات ============

export async function getSalesByUserId(userId: number, limit?: number) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(sales).where(eq(sales.userId, userId)).orderBy(desc(sales.createdAt));
  if (limit) query = query.limit(limit) as any;
  return query;
}

export async function getSaleById(saleId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sales).where(eq(sales.id, saleId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSale(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(sales).values(data);
}

export async function getSaleItems(saleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(saleItems).where(eq(saleItems.saleId, saleId));
}

export async function createSaleItem(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(saleItems).values(data);
}

// ============ مصاريف ============

export async function getExpensesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses).where(eq(expenses.userId, userId)).orderBy(desc(expenses.createdAt));
}

export async function createExpense(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(expenses).values(data);
}

// ============ إشعارات ============

export async function getNotificationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function createNotification(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(notifications).values(data);
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
}

// ============ مرتجعات ============

export async function getReturnsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(returns).where(eq(returns.userId, userId)).orderBy(desc(returns.createdAt));
}

export async function createReturn(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(returns).values(data);
}

// ============ فواتير مسودة ============

export async function getDraftInvoicesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(draftInvoices).where(eq(draftInvoices.userId, userId)).orderBy(desc(draftInvoices.updatedAt));
}

export async function saveDraftInvoice(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(draftInvoices).values(data);
}

export async function updateDraftInvoice(draftId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(draftInvoices).set(data).where(eq(draftInvoices.id, draftId));
}

// ============ تسديدات العملاء ============

export async function createCustomerPayment(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(customerPayments).values(data);
}

// ============ تسديدات الموردين ============

export async function createSupplierPayment(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(supplierPayments).values(data);
}

// TODO: add feature queries here as your schema grows.
