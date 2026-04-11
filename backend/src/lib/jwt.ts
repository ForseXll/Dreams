import jwt, { type JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';

export interface AuthTokenPayload extends JwtPayload {
  email: string;
  userId: number;
}

export function signToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthTokenPayload {
  const payload = jwt.verify(token, JWT_SECRET);

  if (
    typeof payload === 'string' ||
    typeof payload.userId !== 'number' ||
    typeof payload.email !== 'string'
  ) {
    throw new Error('Invalid token payload');
  }

  return payload as AuthTokenPayload;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateResetToken() {
  return crypto.randomUUID();
}
