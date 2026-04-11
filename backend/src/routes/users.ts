import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { SYSTEM_PERMISSION_NAMES } from '../db/permissions';
import { permissions, userPermissions, users } from '../db/schema';
import { authMiddleware, requirePermission } from '../middleware/auth';

async function getUserPermissions(userId: number) {
  const rows = await db
    .select({ permission: permissions.name })
    .from(userPermissions)
    .innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
    .where(eq(userPermissions.userId, userId));

  return rows.map((row) => row.permission);
}

async function syncPermissions(userId: number, nextPermissions: string[]) {
  const availablePermissions = await db.select().from(permissions);
  const permissionMap = availablePermissions.reduce((map, permission) => {
    map[permission.name] = permission.id;
    return map;
  }, {});

  await db.delete(userPermissions).where(eq(userPermissions.userId, userId));

  const rows = nextPermissions
    .filter((permission) => permissionMap[permission])
    .map((permission) => ({
      userId,
      permissionId: permissionMap[permission],
    }));

  if (rows.length) {
    await db.insert(userPermissions).values(rows);
  }
}

export async function userRoutes(fastify) {
  fastify.get('/users', {
    schema: {
      tags: ['Users'],
      summary: 'List users with permissions',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              email: { type: 'string' },
              permissions: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        403: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authMiddleware, requirePermission('PERMISSIONUPDATE')],
  }, async () => {
    const allUsers = await db.select().from(users);
    const usersWithPermissions = await Promise.all(
      allUsers.map(async (user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        permissions: await getUserPermissions(user.id),
      }))
    );

    return usersWithPermissions;
  });

  fastify.put('/users/:id/permissions', {
    schema: {
      tags: ['Users'],
      summary: 'Update user permissions',
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
        required: ['permissions'],
        properties: {
          permissions: {
            type: 'array',
            items: {
              type: 'string',
              enum: SYSTEM_PERMISSION_NAMES,
            },
          },
        },
      },
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
        403: {
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
    preHandler: [authMiddleware, requirePermission('PERMISSIONUPDATE')],
  }, async (request, reply) => {
    const id = parseInt(request.params.id, 10);

    if (Number.isNaN(id)) {
      return reply.status(404).send({ error: 'User not found' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    const requestedPermissions = Array.isArray(request.body?.permissions)
      ? request.body.permissions.filter((permission) => SYSTEM_PERMISSION_NAMES.includes(permission))
      : [];

    await syncPermissions(id, requestedPermissions);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      permissions: await getUserPermissions(user.id),
    };
  });
}
