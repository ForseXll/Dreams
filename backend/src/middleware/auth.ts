import { verifyToken } from '../lib/jwt';

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
  } catch (error) {
    return reply.status(401).send({ error: 'Invalid token' });
  }
}

export function requirePermission(...allowedPermissions) {
  return async (request, reply) => {
    return reply.status(403).send({ error: 'Forbidden' });
  };
}
