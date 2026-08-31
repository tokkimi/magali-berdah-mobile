import { prisma } from './prisma';
import type { BuiltTemplate } from './templates';
import { defaultStyleFor } from './blocks';

type TemplateProfile = Record<string, any>;

function cloneTemplate(template: BuiltTemplate): BuiltTemplate {
  return JSON.parse(JSON.stringify(template));
}

function firstSentence(value = '') {
  return value.split(/(?<=[.!?])\s+/)[0]?.trim() || value.trim();
}

function compactParagraph(parts: string[]) {
  return parts.map((part) => part.trim()).filter(Boolean).join('\n\n');
}

function donationContent(profile: TemplateProfile, language: 'fr' | 'en') {
  const en = language === 'en';
  return {
    locale: language,
    title: en ? 'Support our work' : 'Soutenez notre action',
    intro: en ? 'Your generosity helps us continue our mission.' : 'Votre générosité nous permet de poursuivre nos missions.',
    cardEnabled: !!profile.donationCardEnabled,
    stripeUrl: profile.donationStripeUrl || '',
    helloAssoEnabled: profile.donationHelloAssoEnabled ?? !!profile.donationHelloAssoUrl,
    helloAssoUrl: profile.donationHelloAssoUrl || '',
    transferEnabled: !!profile.donationTransferEnabled,
    iban: profile.donationIban || '',
    bic: profile.donationBic || '',
    accountHolder: profile.donationAccountHolder || '',
    bankName: profile.donationBankName || '',
    chequeEnabled: !!profile.donationChequeEnabled,
    chequePayable: profile.donationChequePayable || '',
    chequeAddress: profile.donationChequeAddress || '',
  };
}

function leetchiContent(profile: TemplateProfile, language: 'fr' | 'en') {
  const en = language === 'en';
  return {
    locale: language,
    title: en ? 'Our Leetchi money pot' : 'Notre cagnotte Leetchi',
    intro: en ? 'Follow the campaign progress and contribute securely on Leetchi.' : 'Suivez l’avancement de la collecte et participez en toute sécurité sur Leetchi.',
    url: profile.leetchiUrl || '',
    embedUrl: profile.leetchiEmbedUrl || '',
    embedCode: profile.leetchiEmbedCode || '',
    collectedEuros: profile.leetchiCollectedEuros || '',
    goalEuros: profile.leetchiGoalEuros || '',
    buttonText: en ? 'Contribute on Leetchi' : 'Participer à la cagnotte',
  };
}

function personalizeTemplate(template: BuiltTemplate, orgName: string, profile: TemplateProfile = {}) {
  const next = cloneTemplate(template);
  const isGeneratedSite = String(next.id || '').includes('generated');
  const siteType = profile.siteType === 'music' || profile.siteType === 'shop' || profile.siteType === 'other'
    ? profile.siteType
    : 'association';
  const isAssociation = siteType === 'association';
  const language = profile.language === 'en' ? 'en' : 'fr';
  const mission = String(profile.mission || '').trim();
  const functioning = String(profile.functioning || '').trim();
  const actions = String(profile.actions || '').trim();
  const beneficiaries = String(profile.beneficiaries || '').trim();
  const goodToKnow = String(profile.goodToKnow || '').trim();
  const city = String(profile.city || '').trim();
  const year = String(profile.year || '').trim();
  const email = String(profile.email || '').trim();
  const phone = String(profile.phone || '').trim();
  const address = String(profile.legalAddress || profile.city || '').trim();
  const slogan = String(profile.slogan || '').trim();

  const missionText = compactParagraph([
    year ? `${orgName} existe depuis ${year}${city ? ` à ${city}` : ''}.` : '',
    mission,
    beneficiaries ? `${isAssociation ? 'L’association accompagne principalement' : 'Nous nous adressons principalement'} : ${beneficiaries}.` : '',
    functioning,
  ]);
  const actionText = compactParagraph([
    actions,
    goodToKnow,
    mission ? firstSentence(mission) : '',
  ]);
  const contactText = compactParagraph([
    email ? `Email : ${email}` : '',
    phone ? `Téléphone : ${phone}` : '',
    address ? `Adresse : ${address}` : '',
  ]) || (isAssociation ? 'Ajoutez ici les coordonnées publiques de votre association.' : 'Ajoutez ici vos coordonnées publiques.');

  next.header = { ...next.header, logoText: orgName };
  next.footer = {
    ...next.footer,
    logoText: orgName,
    text: slogan || (isAssociation ? firstSentence(mission) : next.footer.text),
    allRightsText: language === 'en'
      ? `© ${new Date().getFullYear()} ${orgName}. All rights reserved.`
      : `© ${new Date().getFullYear()} ${orgName}. Tous droits réservés.`,
  };

  for (const page of next.pages) {
    for (const block of page.blocks || []) {
      if (isGeneratedSite && !['social'].includes(block.type)) continue;

      if (block.type === 'banner') {
        if (page.isHome) {
          block.content.title = orgName;
          if (mission) block.content.subtitle = firstSentence(mission);
        }
        continue;
      }

      if (isAssociation && block.type === 'textimage') {
        const title = String(block.content.title || '').toLowerCase();
        if ((title.includes('mission') || title.includes('association')) && missionText) block.content.text = missionText;
        else if (actionText) block.content.text = actionText;
        continue;
      }

      if (isAssociation && block.type === 'text') {
        const current = String(block.content.text || '');
        if (/collez ici|helloasso|formulaire de don/i.test(current)) {
          block.content.text = 'Choisissez un montant, renseignez vos coordonnées, puis finalisez votre don selon les moyens proposés par l’association.';
        } else if (page.slug === 'notre-action' && actionText) {
          block.content.text = actionText;
        } else if (page.slug === 'contact') {
          block.content.text = contactText;
        } else if (missionText && /mission|association engagée|votre texte ici/i.test(current)) {
          block.content.text = missionText;
        }
        continue;
      }

      if (isAssociation && block.type === 'cards' && Array.isArray(block.content.items)) {
        if (actions || beneficiaries || goodToKnow) {
          block.content.items = block.content.items.map((item: any, index: number) => ({
            ...item,
            text: [actions, beneficiaries, goodToKnow][index] || item.text,
          }));
        }
        continue;
      }

      if (block.type === 'social') {
        block.content.social = {
          ...(block.content.social || {}),
          facebook: profile.facebook || '',
          instagram: profile.instagram || '',
          linkedin: profile.linkedin || '',
          youtube: profile.youtube || '',
          tiktok: profile.tiktok || '',
          twitter: profile.twitter || '',
        };
      }
    }

    if (page.slug === 'don') {
      page.blocks = (page.blocks || []).filter((block: any) => block.type !== 'html');
      if (!page.blocks.some((block: any) => block.type === 'donation')) {
        page.blocks.push({ type: 'donation', order: page.blocks.length, content: donationContent(profile, language), style: defaultStyleFor('donation') });
      }
      if ((profile.leetchiEnabled ?? !!profile.leetchiUrl) && profile.leetchiUrl && !page.blocks.some((block: any) => block.type === 'leetchi')) {
        page.blocks.push({ type: 'leetchi', order: page.blocks.length, content: leetchiContent(profile, language), style: defaultStyleFor('leetchi') });
      }
    }

    if (page.slug === 'contact' && !page.blocks.some((block: any) => block.type === 'contact')) {
      page.blocks.push({
        type: 'contact',
        order: page.blocks.length,
        content: {
          locale: language,
          title: language === 'en' ? 'Contact us' : 'Contactez-nous',
          intro: language === 'en' ? 'Have a question, a proposal or want to get involved? Send us a message.' : 'Une question, une proposition ou envie de nous rejoindre ? Écrivez-nous.',
          email,
          phone,
          address,
          buttonText: language === 'en' ? 'Send message' : 'Envoyer le message',
          successText: language === 'en' ? 'Thank you, your message has been sent.' : 'Merci, votre message a bien été envoyé.',
        },
        style: defaultStyleFor('contact'),
      });
    }

    page.blocks.forEach((block: any, order: number) => { block.order = order; });
  }

  return next;
}

// Replaces a site's pages/blocks and theme/header/footer with a template.
// Generation is a clean replacement. Nothing from the previous site's
// header, footer, pages or blocks is reused.
export async function applyTemplateToSite(siteId: string, template: BuiltTemplate, orgName: string, profile: TemplateProfile = {}) {
  const currentSite = await prisma.site.findUnique({ where: { id: siteId }, select: { header: true, footer: true } });
  const currentHeader = (currentSite?.header as any) || {};
  const currentFooter = (currentSite?.footer as any) || {};
  const personalized = personalizeTemplate(template, orgName, profile);
  const header = {
    ...personalized.header,
    logoText: orgName,
    logoUrl: personalized.header.logoUrl || currentHeader.logoUrl || undefined,
  };
  const footer = {
    ...personalized.footer,
    logoText: orgName,
    logoUrl: personalized.footer.logoUrl || currentFooter.logoUrl || undefined,
    allRightsText: personalized.footer.allRightsText,
  };

  await prisma.$transaction(async (tx) => {
    await tx.page.deleteMany({ where: { siteId } });
    await tx.site.update({ where: { id: siteId }, data: { theme: personalized.theme as any, header: header as any, footer: footer as any } });
    for (let p = 0; p < personalized.pages.length; p++) {
      const page = personalized.pages[p];
      await tx.page.create({
        data: {
          siteId, title: page.title, slug: page.slug, order: p,
          isHome: page.isHome, showInNav: page.showInNav,
          blocks: { create: page.blocks.map((b: any) => ({ type: b.type, order: b.order, content: b.content, style: b.style })) },
        },
      });
    }
  });
}
