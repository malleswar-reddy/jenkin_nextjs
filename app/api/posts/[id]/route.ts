import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const json = await request.json();
  const update = {} as any;
  if (json.title !== undefined) update.title = json.title;
  if (json.content !== undefined) update.content = json.content;
  if (json.published !== undefined) update.published = json.published;

  const post = await prisma.post.update({ where: { id }, data: update });
  return NextResponse.json(post);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
