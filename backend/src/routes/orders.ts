import { z } from 'zod';
import { db } from '../db/index';
import { orders, orderItems, cartItems } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:7777';

const createOrderSchema = z.object({
  stripeToken: z.string(),
});

export async function orderRoutes(fastify) {
  fastify.get('/orders', {
    schema: {
      tags: ['Orders'],
      summary: 'Get user orders',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              total: { type: 'integer' },
              charge: { type: 'string' },
              userId: { type: 'integer' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              orderItems: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    image: { type: 'string' },
                    largeImage: { type: 'string' },
                    price: { type: 'integer' },
                    quantity: { type: 'integer' },
                    orderId: { type: 'integer' },
                    userId: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    preHandler: authMiddleware,
  }, async (request, reply) => {
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, request.user.userId),
      with: {
        orderItems: true,
      },
      orderBy: [desc(orders.createdAt)],
    });

    return userOrders;
  });

  fastify.get('/orders/:id', {
    schema: {
      tags: ['Orders'],
      summary: 'Get order by ID',
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
            id: { type: 'integer' },
            total: { type: 'integer' },
            charge: { type: 'string' },
            userId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            orderItems: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  image: { type: 'string' },
                  largeImage: { type: 'string' },
                  price: { type: 'integer' },
                  quantity: { type: 'integer' },
                  orderId: { type: 'integer' },
                  userId: { type: 'integer' },
                },
              },
            },
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
      return reply.status(400).send({ error: 'Invalid order ID' });
    }

    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, id), eq(orders.userId, request.user.userId)),
      with: {
        orderItems: true,
      },
    });

    if (!order) {
      return reply.status(404).send({ error: 'Order not found' });
    }

    return order;
  });

  fastify.post('/orders', {
    schema: {
      tags: ['Orders'],
      summary: 'Create order (legacy)',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['stripeToken'],
        properties: {
          stripeToken: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            total: { type: 'integer' },
            charge: { type: 'string' },
            userId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            orderItems: {
              type: 'array',
              items: { type: 'object' },
            },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    preHandler: authMiddleware,
  }, async (request, reply) => {
    const data = createOrderSchema.parse(request.body);

    const userCart = await db.query.cartItems.findMany({
      where: eq(cartItems.userId, request.user.userId),
      with: {
        item: true,
      },
    });

    if (userCart.length === 0) {
      return reply.status(400).send({ error: 'Cart is empty' });
    }

    const total = userCart.reduce((sum, ci) => sum + (ci.item?.price || 0) * ci.quantity, 0);

    try {
      const charge = await stripe.charges.create({
        amount: total,
        currency: 'usd',
        source: data.stripeToken,
        description: `Order for user ${request.user.userId}`,
      });

      const [order] = await db
        .insert(orders)
        .values({
          total,
          userId: request.user.userId,
          charge: charge.id,
        })
        .returning();

      const orderItemsData = userCart
        .filter((ci) => ci.item)
        .map((ci) => ({
          title: ci.item.title,
          description: ci.item.description,
          image: ci.item.image || '',
          largeImage: ci.item.largeImage || '',
          price: ci.item.price,
          quantity: ci.quantity,
          userId: request.user.userId,
          orderId: order.id,
        }));

      await db.insert(orderItems).values(orderItemsData);

      await db.delete(cartItems).where(eq(cartItems.userId, request.user.userId));

      const fullOrder = await db.query.orders.findFirst({
        where: eq(orders.id, order.id),
        with: {
          orderItems: true,
        },
      });

      return fullOrder;
    } catch (error) {
      return reply.status(400).send({ error: error.message || 'Payment failed' });
    }
  });

  fastify.post('/orders/create-checkout-session', {
    schema: {
      tags: ['Orders'],
      summary: 'Create Stripe checkout session',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            sessionId: { type: 'string' },
            url: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    preHandler: authMiddleware,
  }, async (request, reply) => {
    const userCart = await db.query.cartItems.findMany({
      where: eq(cartItems.userId, request.user.userId),
      with: {
        item: true,
      },
    });

    if (userCart.length === 0) {
      return reply.status(400).send({ error: 'Cart is empty' });
    }

    const lineItems = userCart
      .filter((ci) => ci.item)
      .map((ci) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: ci.item.title,
            description: ci.item.description,
            images: ci.item.image ? [ci.item.image] : [],
          },
          unit_amount: ci.item.price,
        },
        quantity: ci.quantity,
      }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${frontendUrl}/order?success=true`,
      cancel_url: `${frontendUrl}/cart?canceled=true`,
      metadata: {
        userId: request.user.userId.toString(),
      },
    });

    return { sessionId: session.id, url: session.url };
  });
}
