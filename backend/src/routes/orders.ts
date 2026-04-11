import { z } from 'zod';
import { db } from '../db/index';
import { orders, orderItems, cartItems } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:7777')
  .split(',')
  .map((origin) => origin.trim())
  .find(Boolean) || 'http://localhost:7777';

const createOrderSchema = z.object({
  stripeToken: z.string(),
});

const completeCheckoutSessionSchema = z.object({
  sessionId: z.string().min(1),
});

function isAbsoluteHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

function getChargeReference(session) {
  if (typeof session.payment_intent === 'string' && session.payment_intent) {
    return session.payment_intent;
  }

  return session.id;
}

function getExpandedProduct(product) {
  if (!product || typeof product !== 'object' || ('deleted' in product && product.deleted)) {
    return null;
  }

  return product;
}

async function getOrderWithItemsById(id) {
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      orderItems: true,
    },
  });
}

async function getOrderWithItemsByCharge(charge) {
  return db.query.orders.findFirst({
    where: eq(orders.charge, charge),
    with: {
      orderItems: true,
    },
  });
}

async function finalizeCheckoutSession({ sessionId, userId }) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const checkoutUserId = Number(session.metadata?.userId || session.client_reference_id || 0);

  if (!checkoutUserId || Number.isNaN(checkoutUserId)) {
    throw new Error('Checkout session is missing user metadata');
  }

  if (checkoutUserId !== userId) {
    throw new Error('Checkout session does not belong to the current user');
  }

  if (session.payment_status !== 'paid') {
    throw new Error('Checkout session has not been paid');
  }

  const charge = getChargeReference(session);
  const existingOrder = await getOrderWithItemsByCharge(charge);

  if (existingOrder) {
    return existingOrder;
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ['data.price.product'],
  });

  if (!lineItems.data.length) {
    throw new Error('Checkout session does not contain any line items');
  }

  const total = typeof session.amount_total === 'number'
    ? session.amount_total
    : lineItems.data.reduce((sum, item) => sum + (item.amount_total || 0), 0);

  const [order] = await db
    .insert(orders)
    .values({
      total,
      userId,
      charge,
    })
    .returning();

  const orderItemsData = lineItems.data.map((lineItem) => {
    const quantity = lineItem.quantity || 1;
    const price = typeof lineItem.amount_subtotal === 'number'
      ? Math.round(lineItem.amount_subtotal / quantity)
      : lineItem.price?.unit_amount || 0;
    const product = getExpandedProduct(lineItem.price?.product);

    return {
      title: lineItem.description || product?.name || 'Item',
      description: product?.description || '',
      image: product?.metadata.image || product?.images?.[0] || '',
      largeImage: product?.metadata.largeImage || product?.metadata.image || product?.images?.[0] || '',
      price,
      quantity,
      userId,
      orderId: order.id,
    };
  });

  await db.insert(orderItems).values(orderItemsData);
  await db.delete(cartItems).where(eq(cartItems.userId, userId));

  return getOrderWithItemsById(order.id);
}

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
  }, async (request) => {
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
            metadata: {
              image: ci.item.image || '',
              itemId: ci.item.id.toString(),
              largeImage: ci.item.largeImage || ci.item.image || '',
            },
            name: ci.item.title,
            description: ci.item.description,
            images: isAbsoluteHttpUrl(ci.item.image) ? [ci.item.image] : [],
          },
          unit_amount: ci.item.price,
        },
        quantity: ci.quantity,
      }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${frontendUrl}/order?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/shop?canceled=true`,
      client_reference_id: request.user.userId.toString(),
      metadata: {
        userId: request.user.userId.toString(),
      },
    });

    return { sessionId: session.id, url: session.url };
  });

  fastify.post('/orders/checkout/complete', {
    schema: {
      tags: ['Orders'],
      summary: 'Finalize Stripe checkout session into an order',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['sessionId'],
        properties: {
          sessionId: { type: 'string' },
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
    try {
      const data = completeCheckoutSessionSchema.parse(request.body);
      const order = await finalizeCheckoutSession({
        sessionId: data.sessionId,
        userId: request.user.userId,
      });

      if (!order) {
        return reply.status(400).send({ error: 'Unable to finalize checkout session' });
      }

      return order;
    } catch (error) {
      return reply.status(400).send({ error: error.message || 'Checkout finalization failed' });
    }
  });
}
