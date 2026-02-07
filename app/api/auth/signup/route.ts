import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, name } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, password: hashed, name } });

  const token = signToken({ id: user.id, email: user.email });
  const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
  res.headers.set('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}`);
  return res;
}
