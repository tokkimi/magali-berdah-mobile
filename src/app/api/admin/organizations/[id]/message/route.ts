import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requirePlatformAdmin } from '@/lib/platform-admin';
import { prisma } from '@/lib/prisma';

// Name the association sees when the platform team writes to them.
const SENDER_NAME = 'Easy Asso Manager';

const schema = z.object({
  body: z.string().trim().min(1).max(8000),
});

// Admin sends a message into the association's conversation.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Message invalide.' }, { status: 400 });

  const org = await prisma.organization.findUnique({ where: { id }, select: { id: true } });
  if (!org) return NextResponse.json({ error: 'Organisation introuvable.' }, { status: 404 });

  const message = await prisma.platformMessage.create({
    data: { organizationId: id, fromAdmin: true, authorName: SENDER_NAME, body: parsed.data.body, readByAdmin: new Date() },
  });
  return NextResponse.json({ ok: true, message: JSON.parse(JSON.stringify(message)) });
}

// Admin marks the association's replies as read.
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await params;
  await prisma.platformMessage.updateMany({
    where: { organizationId: id, fromAdmin: false, readByAdmin: null },
    data: { readByAdmin: new Date() },
  });
  return NextResponse.json({ ok: true });
}
