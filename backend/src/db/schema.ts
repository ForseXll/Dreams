import { serial, varchar, text, integer, timestamp, pgSchema } from 'drizzle-orm/pg-core';

const main = pgSchema('main');

export const permissions = main.table('permissions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
});

export const users = main.table('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  resetToken: varchar('reset_token', { length: 255 }),
  resetTokenExpiry: timestamp('reset_token_expiry'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userPermissions = main.table('user_permissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  permissionId: integer('permission_id')
    .references(() => permissions.id, { onDelete: 'cascade' })
    .notNull(),
});

export const items = main.table('items', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  image: varchar('image', { length: 500 }),
  largeImage: varchar('large_image', { length: 500 }),
  price: integer('price').notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orders = main.table('orders', {
  id: serial('id').primaryKey(),
  total: integer('total').notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  charge: varchar('charge', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const cartItems = main.table('cart_items', {
  id: serial('id').primaryKey(),
  quantity: integer('quantity').default(1).notNull(),
  itemId: integer('item_id').references(() => items.id, { onDelete: 'cascade' }),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = main.table('order_items', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  image: varchar('image', { length: 500 }).notNull(),
  largeImage: varchar('large_image', { length: 500 }).notNull(),
  price: integer('price').notNull(),
  quantity: integer('quantity').default(1).notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  orderId: integer('order_id')
    .references(() => orders.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});
