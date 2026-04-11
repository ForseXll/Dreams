import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { permissions, userPermissions } from '../db/schema';
import { verifyToken } from '../lib/jwt';

async function getUserPermissions(userId: number) {
  const rows = await db
    .select({ permission: permissions.name })
    .from(userPermissions)
    .innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
    .where(eq(userPermissions.userId, userId));

  return rows.map((row) => row.permission);
}

export function hasAnyPermission(
  currentPermissions: string[] | undefined,
  allowedPermissions: string[]
) {
  if (!currentPermissions || currentPermissions.length === 0) {
    return false;
  }

  return allowedPermissions.some((permission) => currentPermissions.includes(permission));
}

export function getRequestToken(request) {
  const authHeader = request.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  if (request.cookies && request.cookies.token) {
    return request.cookies.token;
  }

  return null;
}

export async function authMiddleware(request, reply) {
  try {
    const token = getRequestToken(request);

    if (!token) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const payload = verifyToken(token);
    request.user = payload;
    request.permissions = await getUserPermissions(payload.userId);
  } catch {
    return reply.status(401).send({ error: 'Invalid token' });
  }
}

export function requirePermission(...allowedPermissions) {
  return async (request, reply) => {
    const currentPermissions = request.permissions || [];

    if (hasAnyPermission(currentPermissions, ['ADMIN', ...allowedPermissions])) {
      return;
    }

    return reply.status(403).send({ error: 'Forbidden' });
  };
}
