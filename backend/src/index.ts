import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { authRoutes } from './routes/auth';
import { itemRoutes } from './routes/items';
import { cartRoutes } from './routes/cart';
import { orderRoutes } from './routes/orders';

const fastify = Fastify({
  logger: true,
});

const PORT = parseInt(process.env.PORT || '4000');

async function start() {
  await fastify.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  await fastify.register(cookie);

  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'development-secret-change-in-production',
    cookie: {
      cookieName: 'token',
      signed: false,
    },
  });

  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  fastify.register(authRoutes, { prefix: '/auth' });
  fastify.register(itemRoutes, { prefix: '/api' });
  fastify.register(cartRoutes, { prefix: '/api' });
  fastify.register(orderRoutes, { prefix: '/api' });

  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
