import { verifyToken } from '../lib/jwt';

export async function authMiddleware(request, reply) {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const token = authHeader.slice(7);
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
