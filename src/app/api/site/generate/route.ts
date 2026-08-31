import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { buildGeneratedSite, buildMusicSite, pickTemplateId, type GenerateInput } from '@/lib/generate';
import { resolveMediaLink } from '@/lib/oembed';
import { aiEnabled, aiGenerateSite } from '@/lib/ai';
import { causePhotoQuery } from '@/lib/templates';
import { fetchCausePhotos } from '@/lib/unsplash';
import { applyTemplateToSite } from '@/lib/apply-template';
import { legalDocuments } from '@/lib/legal';
import { defaultStyleFor } from '@/lib/blocks';
import { removeGeneratedCopyDuplicates } from '@/lib/copy-quality';
import { enhanceGeneratedEditorialCopy } from '@/lib/editorial-depth';
import { isVielusosSite } from '@/lib/vielusos';

// Rich AI copywriting of a full multi-page site can take a few minutes.
// Requires the Vercel Pro plan (Hobby caps maxDuration at 60s).
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const protectedSite = await prisma.site.findUnique({ where: { organizationId: ctx.org.id }, select: { subdomain: true } });
    if (isVielusosSite(protectedSite)) return NextResponse.json({ error: 'Le site VIELUSOS est verrouillé et ne peut pas être remplacé par le générateur.' }, { status: 403 });
    const b = await req.json();
    const name = (b.name || '').trim() || ctx.org.name;
    const previousProfile = (ctx.org.profile as Record<string, any>) || {};
    const requestedSlogan = typeof b.slogan === 'string' && b.slogan.trim() ? b.slogan.trim() : (previousProfile.slogan || '');
    const generateLegal = b.generateCgv !== false;
    const siteType: 'association' | 'shop' | 'other' | 'music' = ['association', 'shop', 'other', 'music'].includes(b.siteType) ? b.siteType : 'association';
    const hasShop = siteType === 'shop' || !!b.hasShop;

    if (b.name && b.name.trim() && b.name.trim() !== ctx.org.name) {
      await prisma.organization.update({ where: { id: ctx.org.id }, data: { name: b.name.trim() } });
    }

    const input: GenerateInput = {
      name,
      language: b.language === 'en' ? 'en' : 'fr',
      siteType,
      hasShop,
      genre: b.genre || undefined,
      artistStory: b.artistStory || undefined,
      artistSound: b.artistSound || undefined,
      artistLive: b.artistLive || undefined,
      brandStory: b.brandStory || undefined,
      brandPromise: b.brandPromise || undefined,
      brandProof: b.brandProof || undefined,
      shippingInfo: b.shippingInfo || undefined,
      slogan: requestedSlogan || undefined,
      generateCgv: generateLegal,
      year: b.year || undefined,
      mission: b.mission || b.description || undefined,
      functioning: b.functioning || undefined,
      goodToKnow: b.goodToKnow || undefined,
      beneficiaries: b.beneficiaries || undefined,
      actions: b.actions || undefined,
      news: b.news || undefined,
      city: b.city || undefined,
      email: b.email || undefined,
      category: b.category || undefined,
      logoUrl: b.logoUrl || undefined,
      photos: Array.isArray(b.photos) ? b.photos.slice(0, 8) : [],
    };

    // Fetch cause-themed photos from Unsplash (when configured) so images are
    // coherent AND varied; empty array falls back to the curated photo set.
    const causeId = pickTemplateId([input.mission, input.functioning, input.goodToKnow, input.beneficiaries, input.actions].filter(Boolean).join(' '), input.category);
    const themePhotos = await fetchCausePhotos(causePhotoQuery(causeId));

    // Music/artist site: build from the provided links, with real thumbnails.
    let generated: any;
    if (siteType === 'music') {
      const trackLinks = (Array.isArray(b.trackLinks) ? b.trackLinks : []).filter(Boolean).slice(0, 12).map(String);
      const tracks = await Promise.all(trackLinks.map(async (u: string) => {
        const r = await resolveMediaLink(u);
        return { url: u, title: r?.title || '', artist: r?.author || '', thumbnail: r?.thumbnail || '', source: r?.source || '', year: '' };
      }));
      const videoLinks = (Array.isArray(b.videoLinks) ? b.videoLinks : []).filter(Boolean).slice(0, 12).map(String);
      const streaming = b.streamingLinks && typeof b.streamingLinks === 'object' ? b.streamingLinks : {};
      const mediaGenerated = buildMusicSite(input, { tracks, streaming, videos: videoLinks, instagram: String(b.instagram || '') });
      const aiGenerated = await aiGenerateSite(input, themePhotos);
      if (aiGenerated) {
        const aiHome = aiGenerated.pages.find((page: any) => page.isHome);
        const aiBio = aiGenerated.pages.find((page: any) => /bio|about|propos|univers/i.test(`${page.slug} ${page.title}`));
        const mediaHome = mediaGenerated.pages.find((page: any) => page.isHome);
        const mediaBio = mediaGenerated.pages.find((page: any) => page.slug === 'bio');
        if (mediaHome && aiHome) {
          const hero = mediaHome.blocks.filter((block: any) => block.type === 'banner');
          const editorial = (aiHome.blocks || []).filter((block: any) => ['heading', 'text', 'textimage', 'cards'].includes(block.type)).slice(0, 4);
          const media = mediaHome.blocks.filter((block: any) => block.type !== 'banner' && !['heading', 'text', 'textimage', 'cards'].includes(block.type));
          mediaHome.blocks = [...hero, ...editorial, ...media].map((block: any, order: number) => ({ ...block, order }));
        }
        if (mediaBio && aiBio && (aiBio.blocks || []).length >= 2) mediaBio.blocks = aiBio.blocks.map((block: any, order: number) => ({ ...block, order }));
        const reserved = /^(accueil|home|bio|about|sons|music|contact)$/i;
        for (const page of aiGenerated.pages) {
          if (!page.isHome && !reserved.test(page.slug) && !mediaGenerated.pages.some((existing: any) => existing.slug === page.slug)) mediaGenerated.pages.splice(-1, 0, page);
        }
      }
      generated = mediaGenerated;
      console.log('[magic-generator] generation_source', { organizationId: ctx.org.id, source: aiGenerated ? 'music-ai' : 'music-deterministic', tracks: tracks.length });
    } else {
      // Try AI generation first (rich, all pages); fall back to the deterministic
      // builder if no API key or the model call fails.
      const aiConfigured = aiEnabled();
      const aiGenerated = await aiGenerateSite(input, themePhotos);
      console.log('[magic-generator] generation_source', { organizationId: ctx.org.id, source: aiGenerated ? 'ai' : 'deterministic', aiConfigured, themePhotos: themePhotos.length });
      generated = aiGenerated || buildGeneratedSite(input, themePhotos);
    }
    const donation = {
      locale: input.language, title: input.language === 'en' ? 'Support our causes' : 'Soutenir nos causes',
      intro: input.language === 'en' ? 'Your donation directly supports all our work.' : 'Votre don soutient directement l’ensemble de nos actions.',
      cardEnabled: b.donationCardEnabled ?? previousProfile.donationCardEnabled ?? false,
      stripeUrl: b.donationStripeUrl ?? previousProfile.donationStripeUrl ?? '', helloAssoUrl: b.donationHelloAssoUrl ?? previousProfile.donationHelloAssoUrl ?? '',
      helloAssoEnabled: b.donationHelloAssoEnabled ?? previousProfile.donationHelloAssoEnabled ?? !!(b.donationHelloAssoUrl || previousProfile.donationHelloAssoUrl),
      transferEnabled: b.donationTransferEnabled ?? previousProfile.donationTransferEnabled ?? false,
      iban: b.donationIban ?? previousProfile.donationIban ?? '', bic: b.donationBic ?? previousProfile.donationBic ?? '',
      accountHolder: b.donationAccountHolder ?? previousProfile.donationAccountHolder ?? '', bankName: b.donationBankName ?? previousProfile.donationBankName ?? '',
      chequeEnabled: b.donationChequeEnabled ?? previousProfile.donationChequeEnabled ?? false,
      chequePayable: b.donationChequePayable ?? previousProfile.donationChequePayable ?? '', chequeAddress: b.donationChequeAddress ?? previousProfile.donationChequeAddress ?? '',
    };
    const leetchi = {
      locale: input.language,
      title: input.language === 'en' ? 'Our Leetchi money pot' : 'Notre cagnotte Leetchi',
      intro: input.language === 'en' ? 'Follow the campaign progress and contribute securely on Leetchi.' : 'Suivez l’avancement de la collecte et participez en toute sécurité sur Leetchi.',
      url: b.leetchiUrl ?? previousProfile.leetchiUrl ?? '',
      embedUrl: b.leetchiEmbedUrl ?? previousProfile.leetchiEmbedUrl ?? '',
      embedCode: b.leetchiEmbedCode ?? previousProfile.leetchiEmbedCode ?? '',
      collectedEuros: b.leetchiCollectedEuros ?? previousProfile.leetchiCollectedEuros ?? '',
      goalEuros: b.leetchiGoalEuros ?? previousProfile.leetchiGoalEuros ?? '',
      buttonText: input.language === 'en' ? 'Contribute on Leetchi' : 'Participer à la cagnotte',
    };
    const anyDonation = donation.cardEnabled || donation.helloAssoEnabled || donation.transferEnabled || donation.chequeEnabled || ((b.leetchiEnabled ?? previousProfile.leetchiEnabled) && leetchi.url);
    // Only association projects (or projects that explicitly configure a
    // collection method) get a donation page by default.
    const wantDonationPage = siteType === 'association' || !!anyDonation;

    const isDonationText = (value = '') => /\bfaire[-\s]*un[-\s]*don\b|\bdon\b|donat|soutenir|support|donate/i.test(value);
    if (wantDonationPage) {
    let donationPage = generated.pages.find((page: any) => isDonationText(`${page.slug} ${page.title}`));
    if (!donationPage) {
      donationPage = { title: input.language === 'en' ? 'Donate' : 'Faire un don', slug: input.language === 'en' ? 'donate' : 'don', isHome: false, showInNav: true, blocks: [] };
      generated.pages.push(donationPage);
    }
    const donationHref = `/${donationPage.slug}`;
    const fixDonationButton = (button: any) => {
      if (!button) return button;
      const label = String(button.text || '');
      const href = String(button.href || '');
      if (isDonationText(label) || href === '/don' || href === '/donate' || href === '#don') return { ...button, href: donationHref };
      return button;
    };
    generated.header = { ...(generated.header as any), cta: fixDonationButton((generated.header as any)?.cta) };
    generated.footer = {
      ...(generated.footer as any),
      columns: (((generated.footer as any)?.columns || []) as any[]).map((column) => ({
        ...column,
        links: (column.links || []).map((link: any) => isDonationText(`${link.label || ''} ${link.href || ''}`) ? { ...link, href: donationHref } : link),
      })),
    };
    if (donationPage) {
      donationPage.blocks = donationPage.blocks.filter((block: any) => block.type !== 'html' && !(block.type === 'text' && /collez ici|stripe|helloasso|configur/i.test(block.content?.text || '')));
      donationPage.blocks.push({ type: 'donation', order: donationPage.blocks.length, content: donation, style: defaultStyleFor('donation') });
      if ((b.leetchiEnabled ?? previousProfile.leetchiEnabled ?? !!leetchi.url) && leetchi.url) {
        donationPage.blocks.push({ type: 'leetchi', order: donationPage.blocks.length, content: leetchi, style: defaultStyleFor('leetchi') });
      }
      donationPage.blocks.forEach((block: any, order: number) => { block.order = order; });
    }
    for (const page of generated.pages) {
      for (const block of page.blocks || []) {
        if (block.content?.button) block.content.button = fixDonationButton(block.content.button);
      }
    }
    } // end wantDonationPage

    // Shop: add a ready-to-fill Boutique page (empty catalogue block — products
    // are added later from the Boutique tab, never invented at generation).
    if (hasShop && !generated.pages.some((p: any) => p.slug === 'boutique' || p.type === 'shop' || (p.blocks || []).some((bl: any) => bl.type === 'shop'))) {
      generated.pages.push({
        title: 'Boutique', slug: 'boutique', isHome: false, showInNav: true,
        blocks: [
          { type: 'banner', order: 0, content: { title: 'Notre boutique', subtitle: 'Découvrez notre sélection.', overlay: 40, height: 340, image: 'https://picsum.photos/seed/boutique/1600/700' }, style: defaultStyleFor('banner') },
          { type: 'shop', order: 1, content: { title: '', intro: '', search: true, showCategories: true, columns: 4 }, style: defaultStyleFor('shop') },
        ],
      });
    }

    // Every generated site gets a social-links block on the contact page (empty,
    // ready to fill), so the networks are one click away.
    const contactPage = generated.pages.find((p: any) => p.slug === 'contact' || /contact/i.test(p.title));
    if (contactPage && !(contactPage.blocks || []).some((bl: any) => bl.type === 'social')) {
      contactPage.blocks = contactPage.blocks || [];
      contactPage.blocks.push({ type: 'social', order: contactPage.blocks.length, content: { social: { align: 'center' } }, style: defaultStyleFor('social') });
    }

    // Develop the copy with real per-cause context (history, references, stakes)
    // then drop any repeated blocks. This is what gives the site substance when
    // the AI provider is not configured.
    enhanceGeneratedEditorialCopy(generated, input);
    removeGeneratedCopyDuplicates(generated, input.language);

    const profile = previousProfile;
    const generationProfile = {
      ...profile,
      language: input.language,
      siteType,
      genre: siteType === 'music' ? (b.genre || '') : profile.genre,
      artistStory: siteType === 'music' ? (b.artistStory || '') : profile.artistStory,
      artistSound: siteType === 'music' ? (b.artistSound || '') : profile.artistSound,
      artistLive: siteType === 'music' ? (b.artistLive || '') : profile.artistLive,
      brandStory: siteType === 'shop' ? (b.brandStory || '') : profile.brandStory,
      brandPromise: siteType === 'shop' ? (b.brandPromise || '') : profile.brandPromise,
      brandProof: siteType === 'shop' ? (b.brandProof || '') : profile.brandProof,
      shippingInfo: siteType === 'shop' ? (b.shippingInfo || '') : profile.shippingInfo,
      streamingLinks: siteType === 'music' ? (b.streamingLinks || {}) : profile.streamingLinks,
      trackLinks: siteType === 'music' ? (Array.isArray(b.trackLinks) ? b.trackLinks : []) : profile.trackLinks,
      videoLinks: siteType === 'music' ? (Array.isArray(b.videoLinks) ? b.videoLinks : []) : profile.videoLinks,
      instagram: siteType === 'music' ? (b.instagram || '') : profile.instagram,
      hasShop: hasShop || profile.hasShop || false,
      shopEnabled: hasShop || profile.shopEnabled || false,
      isAssociation: siteType === 'association' ? true : (profile.isAssociation ?? siteType !== 'shop'),
      slogan: requestedSlogan,
      generateCgv: generateLegal,
      year: input.year || profile.year || '',
      mission: input.mission || profile.mission || '',
      functioning: input.functioning || profile.functioning || '',
      actions: input.actions || profile.actions || '',
      beneficiaries: input.beneficiaries || profile.beneficiaries || '',
      goodToKnow: input.goodToKnow || profile.goodToKnow || '',
      city: input.city || profile.city || '',
      email: input.email || profile.email || '',
      legalCountry: b.legalCountry || profile.legalCountry || '',
      category: input.category || profile.category || '',
      donationCardEnabled: donation.cardEnabled,
      donationStripeUrl: donation.stripeUrl,
      donationHelloAssoEnabled: donation.helloAssoEnabled,
      donationHelloAssoUrl: donation.helloAssoUrl,
      donationTransferEnabled: donation.transferEnabled,
      donationIban: donation.iban,
      donationBic: donation.bic,
      donationAccountHolder: donation.accountHolder,
      donationBankName: donation.bankName,
      donationChequeEnabled: donation.chequeEnabled,
      donationChequePayable: donation.chequePayable,
      donationChequeAddress: donation.chequeAddress,
      leetchiEnabled: b.leetchiEnabled ?? profile.leetchiEnabled ?? !!leetchi.url,
      leetchiUrl: leetchi.url,
      leetchiEmbedUrl: leetchi.embedUrl,
      leetchiEmbedCode: leetchi.embedCode,
      leetchiCollectedEuros: leetchi.collectedEuros,
      leetchiGoalEuros: leetchi.goalEuros,
    };
    const site = await prisma.site.findUniqueOrThrow({ where: { organizationId: ctx.org.id } });
    await applyTemplateToSite(site.id, generated, name, generationProfile);
    const legal = legalDocuments(generationProfile, name);
    const updatedSite = await prisma.site.update({
      where: { id: site.id },
      data: {
        name,
        published: true,
        footer: {
          ...(generated.footer as any),
          text: requestedSlogan || (input.language === 'en' ? 'Together, we make a difference.' : 'Ensemble, faisons la différence.'),
          allRightsText: input.language === 'en' ? `© ${new Date().getFullYear()} ${name}. All rights reserved.` : `© ${new Date().getFullYear()} ${name}. Tous droits réservés.`,
          showCgv: generateLegal,
          showMentions: generateLegal,
          cgvContent: generateLegal ? legal.cgv : '',
          mentionsContent: generateLegal ? legal.details : '',
        },
      },
    });
    await prisma.organization.update({ where: { id: ctx.org.id }, data: { profile: generationProfile } });
    revalidatePath('/dashboard/editor');
    revalidatePath('/dashboard/generate');
    revalidatePath(`/s/${site.subdomain}`);
    for (const page of generated.pages) revalidatePath(`/s/${site.subdomain}/${page.slug}`);
    return NextResponse.json({ ok: true, siteVersion: updatedSite.updatedAt.toISOString() });
  } catch (e) { return handleApiError(e); }
}
