import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError, assertPageInOrg } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { defaultContentFor, defaultStyleFor, type BlockType } from '@/lib/blocks';

// Create block: { pageId, type }
export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const { pageId, type } = await req.json();
    await assertPageInOrg(pageId, ctx.org.id);
    const count = await prisma.block.count({ where: { pageId } });
    const content: any = defaultContentFor(type as BlockType);
    if (type === 'contact') {
      const profile = (ctx.org.profile as Record<string, string>) || {};
      const english = profile.language === 'en';
      content.locale = english ? 'en' : 'fr';
      if (english) Object.assign(content, { title: 'Contact us', intro: 'Have a question, a proposal or want to get involved? Send us a message.', buttonText: 'Send message', successText: 'Thank you, your message has been sent.' });
      content.email = profile.email || '';
      content.phone = profile.phone || '';
      content.address = profile.legalAddress || profile.city || '';
    }
    if (type === 'donation') {
      const profile = (ctx.org.profile as Record<string, any>) || {};
      Object.assign(content, {
        locale: profile.language === 'en' ? 'en' : 'fr', cardEnabled: !!profile.donationCardEnabled,
        stripeUrl: profile.donationStripeUrl || '', helloAssoUrl: profile.donationHelloAssoUrl || '',
        helloAssoEnabled: profile.donationHelloAssoEnabled ?? !!profile.donationHelloAssoUrl,
        transferEnabled: !!profile.donationTransferEnabled, iban: profile.donationIban || '', bic: profile.donationBic || '',
        accountHolder: profile.donationAccountHolder || '', bankName: profile.donationBankName || '',
        chequeEnabled: !!profile.donationChequeEnabled, chequePayable: profile.donationChequePayable || '', chequeAddress: profile.donationChequeAddress || '',
      });
      if (profile.language === 'en') Object.assign(content, { title: 'Support our work', intro: 'Your generosity helps us continue our mission.' });
    }
    if (type === 'leetchi') {
      const profile = (ctx.org.profile as Record<string, any>) || {};
      const english = profile.language === 'en';
      Object.assign(content, {
        locale: english ? 'en' : 'fr',
        title: english ? 'Our Leetchi money pot' : 'Notre cagnotte Leetchi',
        intro: english ? 'Follow the campaign progress and contribute securely on Leetchi.' : 'Suivez l’avancement de la collecte et participez en toute sécurité sur Leetchi.',
        url: profile.leetchiUrl || '',
        embedUrl: profile.leetchiEmbedUrl || '',
        embedCode: profile.leetchiEmbedCode || '',
        collectedEuros: profile.leetchiCollectedEuros || '',
        goalEuros: profile.leetchiGoalEuros || '',
        buttonText: english ? 'Contribute on Leetchi' : 'Participer à la cagnotte',
      });
    }
    const block = await prisma.block.create({
      data: {
        pageId,
        type,
        order: count,
        content,
        style: defaultStyleFor(type as BlockType) as any,
      },
    });
    return NextResponse.json(block);
  } catch (e) {
    return handleApiError(e);
  }
}

// Reorder blocks: { pageId, ids: string[] }
export async function PATCH(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const { pageId, ids } = await req.json();
    await assertPageInOrg(pageId, ctx.org.id);
    await prisma.$transaction(
      (ids as string[]).map((id, order) =>
        prisma.block.updateMany({ where: { id, pageId }, data: { order } })
      )
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
