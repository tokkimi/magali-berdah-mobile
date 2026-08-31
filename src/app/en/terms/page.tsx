import type { Metadata } from 'next';
import { LegalShell, LegalInfoTable } from '@/components/legal/LegalShell';
import { platformLegal } from '@/lib/platform-legal';

export const metadata: Metadata = {
  title: 'Terms and conditions — EasyAsso',
  description: 'Terms and conditions for the EasyAsso service operated by Une Digitale.',
};

export default function EnglishTermsPage() {
  return (
    <LegalShell
      lang="en"
      title="Terms and conditions"
      intro={`${platformLegal.serviceName} is an online service for associations, operated by ${platformLegal.companyName}. These terms explain how the free trial, payment, website creation, publishing and management features work.`}
    >
      <h2>1. Service provider</h2>
      <p>The service is operated by {platformLegal.companyName}. The currently available legal details are listed below.</p>
      <LegalInfoTable lang="en" />

      <h2>2. Purpose</h2>
      <p>These terms govern account creation, the free trial, orders, payments and use of {platformLegal.serviceName}. By creating an account, using the trial, validating an order or paying for the service, the user accepts these terms.</p>

      <h2>3. Service description</h2>
      <p>{platformLegal.serviceName} allows associations to create, publish and manage a website without technical skills. The service includes a guided website generator, visual page and block editing, editable headers and footers, donation blocks, donor CRM, messages, campaigns, receipts, accounting exports, statistics and custom domain support where available.</p>
      <p>Automatically generated content, including pages, legal notices and terms, is provided as drafting assistance. The association remains responsible for reviewing, completing and validating all published content.</p>

      <h2>4. Account and free trial</h2>
      <p>Creating an account starts a {platformLegal.trialDays}-day free trial when this offer is available. No card is requested during registration. After the trial, access to publishing or administration may be limited until payment is confirmed.</p>

      <h2>5. Price and payment</h2>
      <p>The public price is €{platformLegal.priceEuro} as a one-time payment, unless a specific offer is displayed at checkout. External costs remain the user’s responsibility, including domain registration, third-party payment fees or optional services connected by the user.</p>
      <p>Payment may be offered by secure card payment, manual bank transfer or any other method shown in the user account. For manual bank transfer, activation may be completed manually after funds are received and the proof of transfer is checked.</p>

      <h2>6. Order validation</h2>
      <p>Account creation itself does not trigger payment. Payment is made later from the user area, after the price, essential service characteristics and these terms have been made available. A button clearly associated with an obligation to pay creates a firm order.</p>

      <h2>7. Website publishing and domains</h2>
      <p>The association may publish its website on an EasyAsso address and, where available, connect its own domain. A customer domain is only used publicly after technical verification. DNS or registrar actions may be required from the user.</p>

      <h2>8. User responsibilities</h2>
      <p>The user must provide accurate information, publish lawful content, hold the rights to uploaded logos, images, videos and text, check legal/accounting/fiscal information, protect login credentials and use the service in accordance with the association’s purpose.</p>

      <h2>9. Donations and receipts</h2>
      <p>{platformLegal.serviceName} provides tools to present, record and follow donations. The association remains solely responsible for its campaigns, eligibility to receive donations, accounting, tax treatment, receipts and information provided to donors.</p>

      <h2>10. Withdrawal, refunds and support</h2>
      <p>If the user qualifies as a consumer under applicable law, they may have a statutory withdrawal right unless an exception applies. Any refund or withdrawal request should be sent to {platformLegal.companyName} using the contact details in the legal notice.</p>
      <p>The service may evolve, be maintained or temporarily interrupted for security, technical or third-party reasons.</p>

      <h2>11. Intellectual property and data</h2>
      <p>{platformLegal.serviceName}, its interface, brand, structure, code and own content belong to {platformLegal.companyName} or its rights holders. The user keeps ownership of their own content and authorizes {platformLegal.companyName} to host and display it only to operate the service.</p>

      <h2>12. Liability, suspension and disputes</h2>
      <p>{platformLegal.companyName} uses reasonable efforts to provide a reliable and secure service, but is not liable for misuse, user-provided errors, third-party services, domain configuration issues, unlawful content or force majeure. Access may be suspended in case of non-payment, security risk, abuse or breach of these terms.</p>
      <p>Complaints may be sent to {platformLegal.contactEmail}. Where consumer mediation applies, the mediator details are: {platformLegal.mediator}. These terms are governed by the law applicable to {platformLegal.companyName}, subject to mandatory consumer protection rules.</p>
    </LegalShell>
  );
}
