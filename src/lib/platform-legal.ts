export const platformLegal = {
  brand: 'EasyAsso',
  companyName: 'Une Digitale',
  serviceName: 'EasyAsso',
  updatedAt: '18 août 2026',
  priceEuro: process.env.NEXT_PUBLIC_PRICE_EUR || '250',
  trialDays: '3',
  legalForm: process.env.NEXT_PUBLIC_LEGAL_FORM || 'À compléter',
  registrationNumber: process.env.NEXT_PUBLIC_LEGAL_REGISTRATION_NUMBER || 'À compléter',
  vatNumber: process.env.NEXT_PUBLIC_LEGAL_VAT_NUMBER || 'À compléter si applicable',
  registeredAddress: process.env.NEXT_PUBLIC_LEGAL_REGISTERED_ADDRESS || 'À compléter',
  publicationDirector: process.env.NEXT_PUBLIC_LEGAL_PUBLICATION_DIRECTOR || 'À compléter',
  contactEmail: process.env.NEXT_PUBLIC_LEGAL_CONTACT_EMAIL || 'À compléter',
  privacyEmail: process.env.NEXT_PUBLIC_LEGAL_PRIVACY_EMAIL || process.env.NEXT_PUBLIC_LEGAL_CONTACT_EMAIL || 'À compléter',
  mediator: process.env.NEXT_PUBLIC_LEGAL_MEDIATOR || 'À compléter avec le médiateur de la consommation choisi, si applicable',
  hostName: 'Vercel Inc.',
  hostAddress: '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
  hostWebsite: 'https://vercel.com',
};

export const platformLegalMissingFields = [
  ['Forme juridique', platformLegal.legalForm],
  ['Numéro d’immatriculation', platformLegal.registrationNumber],
  ['Adresse du siège', platformLegal.registeredAddress],
  ['Email juridique', platformLegal.contactEmail],
  ['Directeur ou directrice de publication', platformLegal.publicationDirector],
  ['Médiateur', platformLegal.mediator],
].filter(([, value]) => value.toLowerCase().includes('compléter'));
