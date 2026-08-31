import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requirePermission } from '@/lib/session';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  body: z.string().trim().min(1).max(8000),
});

// The association replies to the EasyAsso team.
export async function POST(req: Request) {
  const ctx = await requirePermission(PERMISSIONS.SITE_VIEW);
  const org = ctx.organization!;
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Message invalide.' }, { status: 400 });

  const message = await prisma.platformMessage.create({
    data: { organizationId: org.id, fromAdmin: false, authorName: org.name, body: parsed.data.body, readByOrg: new Date() },
  });
  return NextResponse.json({ ok: true, message: JSON.parse(JSON.stringify(message)) });
}

// The association marks the EasyAsso team's messages as read.
export async function PATCH() {
  const ctx = await requirePermission(PERMISSIONS.SITE_VIEW);
  await prisma.platformMessage.updateMany({
    where: { organizationId: ctx.organization!.id, fromAdmin: true, readByOrg: null },
    data: { readByOrg: new Date() },
  });
  return NextResponse.json({ ok: true });
}
