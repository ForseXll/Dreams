import { z } from 'zod';
import { db } from '../db/index';
import { users, userPermissions, permissions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword, signToken, generateResetToken } from '../lib/jwt';
import nodemailer from 'nodemailer';
import { logger } from '../logger/logger-provider';
import { getRequestToken } from '../middleware/auth';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const requestResetSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:7777';

async function getUserPermissions(userId: number) {
  const userPerms = await db
    .select({ permission: permissions.name })
    .from(userPermissions)
    .innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
    .where(eq(userPermissions.userId, userId));
  
  return userPerms.map(p => p.permission);
}

async function assignPermission(userId: number, permissionName: string) {
  const perm = await db.query.permissions.findFirst({
    where: eq(permissions.name, permissionName),
  });
  
  if (perm) {
    await db.insert(userPermissions).values({
      userId,
      permissionId: perm.id,
    });
  }
}

function setAuthCookie(reply, token: string) {
  reply.setCookie('token', token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function authRoutes(fastify) {
  fastify.post('/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register a new user',
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
            token: { type: 'string' },
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
  }, async (request, reply) => {
    const data = registerSchema.parse(request.body);

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (existingUser) {
      return reply.status(400).send({ error: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(data.password);

    const [user] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        password: hashedPassword,
      })
      .returning();

    // Assign default USER permission
    await assignPermission(user.id, 'USER');

    const token = signToken({ userId: user.id, email: user.email });
    setAuthCookie(reply, token);

    return { user: { id: user.id, name: user.name, email: user.email }, token };
  });

  fastify.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login user',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
            token: { type: 'string' },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const data = loginSchema.parse(request.body);

    const user = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const valid = await verifyPassword(data.password, user.password);

    if (!valid) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const token = signToken({ userId: user.id, email: user.email });
    setAuthCookie(reply, token);

    return { user: { id: user.id, name: user.name, email: user.email }, token };
  });

  fastify.post('/request-reset', {
    schema: {
      tags: ['Auth'],
      summary: 'Request password reset',
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request) => {
    const data = requestResetSchema.parse(request.body);

    const user = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (!user) {
      return { message: 'If email exists, reset link will be sent' };
    }

    const resetToken = generateResetToken();
    const resetExpiry = new Date(Date.now() + 3600000);

    await db
      .update(users)
      .set({ resetToken, resetTokenExpiry: resetExpiry })
      .where(eq(users.id, user.id));

    const resetUrl = `${frontendUrl}/reset?token=${resetToken}`;

    try {
      await transporter.sendMail({
        from: '"Dreams Shop" <noreply@dreams.shop>',
        to: user.email,
        subject: 'Password Reset Request',
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
      });
    } catch (error) {
      const authLogger = logger.provider.child('auth');
      authLogger.error({ err: error, email: user.email }, 'Failed to send password reset email');
    }

    return { message: 'If email exists, reset link will be sent' };
  });

  fastify.post('/reset-password', {
    schema: {
      tags: ['Auth'],
      summary: 'Reset password with token',
      body: {
        type: 'object',
        required: ['token', 'password'],
        properties: {
          token: { type: 'string' },
          password: { type: 'string', minLength: 6 },
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
      },
    },
  }, async (request, reply) => {
    const data = resetPasswordSchema.parse(request.body);

    const user = await db.query.users.findFirst({
      where: eq(users.resetToken, data.token),
    });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return reply.status(400).send({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await hashPassword(data.password);

    await db
      .update(users)
      .set({ password: hashedPassword, resetToken: null, resetTokenExpiry: null })
      .where(eq(users.id, user.id));

    return { message: 'Password reset successful' };
  });

  fastify.get('/me', {
    schema: {
      tags: ['Auth'],
      summary: 'Get current user',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            permissions: { type: 'array', items: { type: 'string' } },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const token = getRequestToken(request);

    if (!token) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { verifyToken } = await import('../lib/jwt');
    
    try {
      const payload = verifyToken(token);
      const user = await db.query.users.findFirst({
        where: eq(users.id, payload.userId),
      });

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const perms = await getUserPermissions(user.id);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        permissions: perms,
      };
    } catch {
      return reply.status(401).send({ error: 'Invalid token' });
    }
  });

  fastify.post('/logout', {
    schema: {
      tags: ['Auth'],
      summary: 'Logout current user',
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (_request, reply) => {
    reply.clearCookie('token', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return { message: 'Logged out' };
  });
}
