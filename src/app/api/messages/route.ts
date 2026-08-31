import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_VIEW);
    const messages = await prisma.contactMessage.findMany({ where: { organizationId: ctx.org.id, archivedAt: null }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(messages);
  } catch (e) { return handleApiError(e); }
}

const updateSchema = z.object({ id: z.string(), action: z.enum(['read', 'unread', 'archive']) });
export async function PATCH(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_VIEW);
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Action invalide.' }, { status: 400 });
    const data = parsed.data.action === 'archive' ? { archivedAt: new Date() } : { readAt: parsed.data.action === 'read' ? new Date() : null };
    await prisma.contactMessage.updateMany({ where: { id: parsed.data.id, organizationId: ctx.org.id }, data });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}
