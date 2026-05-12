import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  datetime,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * جدول المستخدمين - نظام تسجيل الدخول والصلاحيات
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  name: text("name"),
  phone: varchar("phone", { length: 20 }),
  role: mysqlEnum("role", ["admin", "employee"]).default("employee").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastLogin: timestamp("lastLogin"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * جدول المنتجات والمخزون
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  code: varchar("code", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  quantity: int("quantity").default(0).notNull(),
  minQuantity: int("minQuantity").default(10).notNull(),
  purchasePrice: decimal("purchasePrice", { precision: 10, scale: 2 }).notNull(),
  sellingPrice: decimal("sellingPrice", { precision: 10, scale: 2 }).notNull(),
  barcode: varchar("barcode", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * جدول العملاء
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  totalDebt: decimal("totalDebt", { precision: 12, scale: 2 }).default(0).notNull(),
  totalPaid: decimal("totalPaid", { precision: 12, scale: 2 }).default(0).notNull(),
  notes: text("notes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * جدول الموردين
 */
export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  totalDebt: decimal("totalDebt", { precision: 12, scale: 2 }).default(0).notNull(),
  totalPaid: decimal("totalPaid", { precision: 12, scale: 2 }).default(0).notNull(),
  notes: text("notes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * جدول المبيعات (الفواتير)
 */
export const sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  customerId: int("customerId"),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }).notNull().unique(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 }).default(0).notNull(),
  tax: decimal("tax", { precision: 12, scale: 2 }).default(0).notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "check", "credit"]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["paid", "pending", "partial"]).default("paid").notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["completed", "returned", "pending"]).default("completed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * جدول تفاصيل المبيعات (أسطر الفاتورة)
 */
export const saleItems = mysqlTable("saleItems", {
  id: int("id").autoincrement().primaryKey(),
  saleId: int("saleId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default(0).notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * جدول المرتجعات
 */
export const returns = mysqlTable("returns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  saleId: int("saleId").notNull(),
  customerId: int("customerId"),
  returnNumber: varchar("returnNumber", { length: 100 }).notNull().unique(),
  reason: text("reason").notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  refundMethod: mysqlEnum("refundMethod", ["cash", "credit", "replacement"]).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "completed"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * جدول تفاصيل المرتجعات
 */
export const returnItems = mysqlTable("returnItems", {
  id: int("id").autoincrement().primaryKey(),
  returnId: int("returnId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * جدول المصاريف
 */
export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "check", "transfer"]).notNull(),
  reference: varchar("reference", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * جدول تسديدات العملاء
 */
export const customerPayments = mysqlTable("customerPayments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  customerId: int("customerId").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "check", "transfer"]).notNull(),
  reference: varchar("reference", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * جدول تسديدات الموردين
 */
export const supplierPayments = mysqlTable("supplierPayments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  supplierId: int("supplierId").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "check", "transfer"]).notNull(),
  reference: varchar("reference", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * جدول الإشعارات
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["low_stock", "high_sale", "payment_due", "system"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  data: json("data"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * جدول سجل الأنشطة (Audit Log)
 */
export const activityLog = mysqlTable("activityLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 100 }).notNull(),
  entityId: int("entityId"),
  changes: json("changes"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * جدول إعدادات النظام
 */
export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * جدول الفواتير المحفوظة (للحفظ التلقائي)
 */
export const draftInvoices = mysqlTable("draftInvoices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  customerId: int("customerId"),
  items: json("items").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 }).default(0).notNull(),
  tax: decimal("tax", { precision: 12, scale: 2 }).default(0).notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  notes: text("notes"),
  lastSaved: timestamp("lastSaved").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============ العلاقات (Relations) ============

export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  customers: many(customers),
  suppliers: many(suppliers),
  sales: many(sales),
  returns: many(returns),
  expenses: many(expenses),
  notifications: many(notifications),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  saleItems: many(saleItems),
  returnItems: many(returnItems),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  sales: many(sales),
  payments: many(customerPayments),
  returns: many(returns),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  user: one(users, {
    fields: [suppliers.userId],
    references: [users.id],
  }),
  payments: many(supplierPayments),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  user: one(users, {
    fields: [sales.userId],
    references: [users.id],
  }),
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id],
  }),
  items: many(saleItems),
  returns: many(returns),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
}));

export const returnsRelations = relations(returns, ({ one, many }) => ({
  user: one(users, {
    fields: [returns.userId],
    references: [users.id],
  }),
  sale: one(sales, {
    fields: [returns.saleId],
    references: [sales.id],
  }),
  customer: one(customers, {
    fields: [returns.customerId],
    references: [customers.id],
  }),
  items: many(returnItems),
}));

export const returnItemsRelations = relations(returnItems, ({ one }) => ({
  return: one(returns, {
    fields: [returnItems.returnId],
    references: [returns.id],
  }),
  product: one(products, {
    fields: [returnItems.productId],
    references: [products.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

export const customerPaymentsRelations = relations(customerPayments, ({ one }) => ({
  user: one(users, {
    fields: [customerPayments.userId],
    references: [users.id],
  }),
  customer: one(customers, {
    fields: [customerPayments.customerId],
    references: [customers.id],
  }),
}));

export const supplierPaymentsRelations = relations(supplierPayments, ({ one }) => ({
  user: one(users, {
    fields: [supplierPayments.userId],
    references: [users.id],
  }),
  supplier: one(suppliers, {
    fields: [supplierPayments.supplierId],
    references: [suppliers.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}));

export const systemSettingsRelations = relations(systemSettings, ({ one }) => ({
  user: one(users, {
    fields: [systemSettings.userId],
    references: [users.id],
  }),
}));

export const draftInvoicesRelations = relations(draftInvoices, ({ one }) => ({
  user: one(users, {
    fields: [draftInvoices.userId],
    references: [users.id],
  }),
  customer: one(customers, {
    fields: [draftInvoices.customerId],
    references: [customers.id],
  }),
}));

// ============ أنواع TypeScript ============

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

export type SaleItem = typeof saleItems.$inferSelect;
export type InsertSaleItem = typeof saleItems.$inferInsert;

export type Return = typeof returns.$inferSelect;
export type InsertReturn = typeof returns.$inferInsert;

export type ReturnItem = typeof returnItems.$inferSelect;
export type InsertReturnItem = typeof returnItems.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

export type CustomerPayment = typeof customerPayments.$inferSelect;
export type InsertCustomerPayment = typeof customerPayments.$inferInsert;

export type SupplierPayment = typeof supplierPayments.$inferSelect;
export type InsertSupplierPayment = typeof supplierPayments.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;

export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = typeof systemSettings.$inferInsert;

export type DraftInvoice = typeof draftInvoices.$inferSelect;
export type InsertDraftInvoice = typeof draftInvoices.$inferInsert;
