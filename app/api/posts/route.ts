import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const json = await request.json();
  // Accepts { title, content?, authorId?, published? }
  if (!json.title) {
    return NextResponse.json({ error: 'Missing title' }, { status: 400 });
  }

  // Try to get authorId from token cookie first
  let authorId = undefined as string | undefined;
  try {
    const cookieHeader = request.headers.get('cookie') ?? '';
    const match = cookieHeader.match(/token=([^;]+)/);
    const token = match ? match[1] : null;
    if (token) {
      const payload: any = verifyToken(token);
      if (payload?.id) authorId = payload.id;
    }
  } catch (e) {
    // ignore token errors
  }

  if (!authorId) authorId = json.authorId;

  if (!authorId) {
    // Fallback: use the first user in the DB if available (demo convenience)
    const firstUser = await prisma.user.findFirst();
    if (firstUser) authorId = firstUser.id;
  }

  if (!authorId) {
    return NextResponse.json({ error: 'Missing authorId and no fallback user found' }, { status: 400 });
  }

  const data = {
    title: json.title,
    content: json.content ?? null,
    published: json.published ?? false,
    authorId,
  };

  const post = await prisma.post.create({ data });
  return NextResponse.json(post);
}
