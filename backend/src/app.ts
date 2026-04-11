import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { authRoutes } from './routes/auth';
import { itemRoutes } from './routes/items';
import { cartRoutes } from './routes/cart';
import { orderRoutes } from './routes/orders';
import { uploadRoutes } from './routes/uploads';
import { userRoutes } from './routes/users';
import { createFastifyLoggerOptions, logger as appLogger } from './logger/logger-provider';

export interface CreateAppOptions {
  logger?: boolean;
  enableSwaggerUi?: boolean;
}

export async function createApp(opts: CreateAppOptions = {}) {
  const { logger = true, enableSwaggerUi = true } = opts;

  const fastify = Fastify({ logger: logger ? createFastifyLoggerOptions() : false });
  appLogger.provider.configure(fastify.log);

  const PORT = parseInt(process.env.PORT || '4000');
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
    : ['http://localhost:7777', 'http://127.0.0.1:7777'];

  await fastify.register(cors, {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await fastify.register(cookie);
  await fastify.register(multipart);

  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'development-secret-change-in-production',
    cookie: {
      cookieName: 'token',
      signed: false,
    },
  });

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Dreams API',
        description: 'Backend API for Dreams e-commerce',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Local development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  if (enableSwaggerUi) {
    await fastify.register(swaggerUI, {
      routePrefix: '/docs',
    });
  }

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
  fastify.register(uploadRoutes, { prefix: '/api' });
  fastify.register(userRoutes, { prefix: '/api' });

  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return fastify;
}
