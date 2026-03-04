import { z } from 'zod';
import { db } from '../db/index';
import { items } from '../db/schema';
import { eq, desc, like, sql } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const createItemSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  image: z.string().optional(),
  largeImage: z.string().optional(),
  price: z.number().int().positive(),
});

const updateItemSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  largeImage: z.string().optional(),
  price: z.number().int().positive().optional(),
});

export async function itemRoutes(fastify) {
  fastify.get('/items', async (request, reply) => {
    const skip = parseInt(request.query?.skip) || 0;
    const take = parseInt(request.query?.take) || 10;
    const search = request.query?.search;

    const where = search ? like(items.title, `%${search}%`) : undefined;

    const [itemsList, count] = await Promise.all([
      db
        .select()
        .from(items)
        .where(where)
        .orderBy(desc(items.id))
        .limit(take)
        .offset(skip),
      db.select({ count: sql`count(*)::int` }).from(items).where(where),
    ]);

    return {
      items: itemsList,
      total: count[0]?.count || 0,
      skip,
      take,
    };
  });

  fastify.get('/items/:id', async (request, reply) => {
    const id = parseInt(request.params.id);

    if (isNaN(id)) {
      return reply.status(400).send({ error: 'Invalid item ID' });
    }

    const item = await db.query.items.findFirst({
      where: eq(items.id, id),
    });

    if (!item) {
      return reply.status(404).send({ error: 'Item not found' });
    }

    return item;
  });

  fastify.post('/items', { preHandler: authMiddleware }, async (request, reply) => {
    const data = createItemSchema.parse(request.body);

    const [item] = await db
      .insert(items)
      .values({
        title: data.title,
        description: data.description,
        image: data.image,
        largeImage: data.largeImage,
        price: data.price,
        userId: request.user.userId,
      })
      .returning();

    return item;
  });

  fastify.put('/items/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const id = parseInt(request.params.id);

    if (isNaN(id)) {
      return reply.status(400).send({ error: 'Invalid item ID' });
    }

    const data = updateItemSchema.parse(request.body);

    const existingItem = await db.query.items.findFirst({
      where: eq(items.id, id),
    });

    if (!existingItem) {
      return reply.status(404).send({ error: 'Item not found' });
    }

    if (existingItem.userId !== request.user.userId) {
      return reply.status(403).send({ error: 'Not authorized to update this item' });
    }

    const [item] = await db
      .update(items)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(items.id, id))
      .returning();

    return item;
  });

  fastify.delete('/items/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const id = parseInt(request.params.id);

    if (isNaN(id)) {
      return reply.status(400).send({ error: 'Invalid item ID' });
    }

    const existingItem = await db.query.items.findFirst({
      where: eq(items.id, id),
    });

    if (!existingItem) {
      return reply.status(404).send({ error: 'Item not found' });
    }

    if (existingItem.userId !== request.user.userId) {
      return reply.status(403).send({ error: 'Not authorized to delete this item' });
    }

    await db.delete(items).where(eq(items.id, id));

    return { message: 'Item deleted successfully' };
  });
}
