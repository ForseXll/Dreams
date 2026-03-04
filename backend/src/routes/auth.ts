import { z } from 'zod';
import { db } from '../db/index';
import { users, userPermissions, permissions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword, signToken, generateResetToken } from '../lib/jwt';
import nodemailer from 'nodemailer';

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

export async function authRoutes(fastify) {
  fastify.post('/register', async (request, reply) => {
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

    return { user: { id: user.id, name: user.name, email: user.email }, token };
  });

  fastify.post('/login', async (request, reply) => {
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

    return { user: { id: user.id, name: user.name, email: user.email }, token };
  });

  fastify.post('/request-reset', async (request, reply) => {
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

    const resetUrl = `${process.env.FRONTEND_URL}/reset?token=${resetToken}`;

    try {
      await transporter.sendMail({
        from: '"Dreams Shop" <noreply@dreams.shop>',
        to: user.email,
        subject: 'Password Reset Request',
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
      });
    } catch (error) {
      console.error('Email send error:', error);
    }

    return { message: 'If email exists, reset link will be sent' };
  });

  fastify.post('/reset-password', async (request, reply) => {
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

  fastify.get('/me', async (request, reply) => {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const token = authHeader.slice(7);
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
}
