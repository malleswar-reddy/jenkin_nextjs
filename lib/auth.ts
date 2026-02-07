import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as any;
}

export function getTokenFromRequest(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') ?? '';
    const match = cookieHeader.match(/token=([^;]+)/);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}
