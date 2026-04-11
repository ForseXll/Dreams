import { z } from 'zod';
import { db } from '../db/index';
import { cartItems, items } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const addToCartSchema = z.object({
  itemId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
});

export async function cartRoutes(fastify) {
  fastify.get('/cart', {
    schema: {
      tags: ['Cart'],
      summary: 'Get user cart',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            cartItems: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  userId: { type: 'integer' },
                  itemId: { type: 'integer' },
                  quantity: { type: 'integer' },
                  item: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      title: { type: 'string' },
                      description: { type: 'string' },
                      image: { type: 'string' },
                      price: { type: 'integer' },
                    },
                  },
                },
              },
            },
            total: { type: 'integer' },
            itemCount: { type: 'integer' },
          },
        },
      },
    },
    preHandler: authMiddleware,
  }, async (request) => {
    const cart = await db.query.cartItems.findMany({
      where: eq(cartItems.userId, request.user.userId),
      with: {
        item: true,
      },
    });

    const total = cart.reduce((sum, ci) => sum + (ci.item?.price || 0) * ci.quantity, 0);

    return {
      cartItems: cart,
      total,
      itemCount: cart.length,
    };
  });

  fastify.post('/cart', {
    schema: {
      tags: ['Cart'],
      summary: 'Add item to cart',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['itemId'],
        properties: {
          itemId: { type: 'integer', minimum: 1 },
          quantity: { type: 'integer', minimum: 1, default: 1 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            itemId: { type: 'integer' },
            quantity: { type: 'integer' },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    preHandler: authMiddleware,
  }, async (request, reply) => {
    const data = addToCartSchema.parse(request.body);

    const item = await db.query.items.findFirst({
      where: eq(items.id, data.itemId),
    });

    if (!item) {
      return reply.status(404).send({ error: 'Item not found' });
    }

    const existingCartItem = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.userId, request.user.userId),
        eq(cartItems.itemId, data.itemId)
      ),
    });

    if (existingCartItem) {
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existingCartItem.quantity + data.quantity })
        .where(eq(cartItems.id, existingCartItem.id))
        .returning();

      return updated;
    }

    const [cartItem] = await db
      .insert(cartItems)
      .values({
        itemId: data.itemId,
        quantity: data.quantity,
        userId: request.user.userId,
      })
      .returning();

    return cartItem;
  });

  fastify.put('/cart/:id', {
    schema: {
      tags: ['Cart'],
      summary: 'Update cart item quantity',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'integer', minimum: 1 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            itemId: { type: 'integer' },
            quantity: { type: 'integer' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    preHandler: authMiddleware,
  }, async (request, reply) => {
    const id = parseInt(request.params.id);
    const quantity = parseInt(request.body?.quantity);

    if (isNaN(id) || !quantity || quantity < 1) {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    const existingCartItem = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.id, id),
        eq(cartItems.userId, request.user.userId)
      ),
    });

    if (!existingCartItem) {
      return reply.status(404).send({ error: 'Cart item not found' });
    }

    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();

    return updated;
  });

  fastify.delete('/cart/:id', {
    schema: {
      tags: ['Cart'],
      summary: 'Remove item from cart',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    preHandler: authMiddleware,
  }, async (request, reply) => {
    const id = parseInt(request.params.id);

    if (isNaN(id)) {
      return reply.status(400).send({ error: 'Invalid cart item ID' });
    }

    const existingCartItem = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.id, id),
        eq(cartItems.userId, request.user.userId)
      ),
    });

    if (!existingCartItem) {
      return reply.status(404).send({ error: 'Cart item not found' });
    }

    await db.delete(cartItems).where(eq(cartItems.id, id));

    return { message: 'Item removed from cart' };
  });

  fastify.delete('/cart', {
    schema: {
      tags: ['Cart'],
      summary: 'Clear cart',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: authMiddleware,
  }, async (request) => {
    await db.delete(cartItems).where(eq(cartItems.userId, request.user.userId));

    return { message: 'Cart cleared' };
  });
}
