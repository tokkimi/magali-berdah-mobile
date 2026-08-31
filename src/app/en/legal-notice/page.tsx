import type { Metadata } from 'next';
import { LegalShell, LegalInfoTable } from '@/components/legal/LegalShell';
import { platformLegal } from '@/lib/platform-legal';

export const metadata: Metadata = {
  title: 'Legal notice and privacy — EasyAsso',
  description: 'Legal notice, hosting details, privacy, personal data and cookies for EasyAsso.',
};

export default function EnglishLegalNoticePage() {
  return (
    <LegalShell
      lang="en"
      title="Legal notice, privacy and cookies"
      intro={`This page identifies ${platformLegal.brand}, its publisher and hosting provider, and explains how personal data and cookies are handled.`}
    >
      <h2>1. Website publisher</h2>
      <p>{platformLegal.brand} is published by {platformLegal.companyName}. The available identification details are listed below.</p>
      <LegalInfoTable lang="en" />

      <h2>2. Publication director</h2>
      <p>The publication director is: {platformLegal.publicationDirector}. This person is responsible for EasyAsso’s own published content, excluding content created by associations in their own websites.</p>

      <h2>3. Hosting provider</h2>
      <p>The website is hosted by {platformLegal.hostName}, {platformLegal.hostAddress}. Website: <a href={platformLegal.hostWebsite}>{platformLegal.hostWebsite}</a>.</p>

      <h2>4. Intellectual property</h2>
      <p>The {platformLegal.brand} brand, interface, service structure, graphics, logos, components, code, databases, templates and own content are protected. Any unauthorized reproduction, extraction, distribution or reuse is prohibited without prior written permission from {platformLegal.companyName}.</p>

      <h2>5. Association-created websites</h2>
      <p>{platformLegal.brand} lets associations create and publish their own websites. Each association is responsible for its own content, legal notices, donation campaigns, contact details, receipts, uploaded files and messages.</p>

      <h2 id="personal-data">6. Personal data processed by EasyAsso</h2>
      <p>{platformLegal.companyName} may process account, contact, association, payment-status, billing, support and technical security data. This includes names, emails, phone numbers, association details, legal details, language preferences, role and permission data, payment status, transfer proof, transaction references when available, support messages, IP addresses and security logs.</p>

      <h2>7. Purposes and legal bases</h2>
      <p>Data is processed to create accounts, provide the website editor and dashboard, manage the free trial and payment status, maintain security, answer support requests, comply with legal and accounting obligations, and improve the service where permitted. Legal bases may include contract performance, legal obligations, legitimate interest or consent where required.</p>

      <h2>8. Data collected by associations</h2>
      <p>When a visitor contacts an association, subscribes to a newsletter or submits a donation pledge on an association website, the data is collected for that association. The association must inform its own visitors and donors according to applicable law. {platformLegal.companyName} acts mainly as the technical provider enabling hosting, display and storage in the association dashboard.</p>

      <h2>9. Recipients and processors</h2>
      <p>Data may be accessed by authorized persons at {platformLegal.companyName} and by technical providers needed for hosting, database, authentication, email, payment, security, logs, support and backups. Third-party services connected by the user are governed by their own terms and privacy policies.</p>

      <h2>10. Retention and rights</h2>
      <p>Data is kept for as long as necessary for the purposes described above. Account data is kept while the account is active, then deleted or archived where appropriate. Billing, accounting, payment proof and dispute data may be kept for the legally required period.</p>
      <p>Individuals may request access, correction, deletion, restriction, objection or portability where applicable by contacting {platformLegal.privacyEmail}. A complaint may also be submitted to the competent data protection authority.</p>

      <h2>11. Cookies and trackers</h2>
      <p>The website may use strictly necessary cookies for sessions, security, language preferences or consent storage. Optional analytics or improvement cookies are used only with consent where required. Users can accept, refuse or change their choices from the cookie interface where available.</p>

      <h2>12. Security, external links and contact</h2>
      <p>{platformLegal.companyName} uses reasonable technical and organizational measures to protect data. Users remain responsible for keeping their credentials confidential. External links may lead to third-party websites for which {platformLegal.companyName} is not responsible.</p>
      <p>Questions about this legal notice, personal data, cookies or content reports can be sent to: {platformLegal.contactEmail}.</p>
    </LegalShell>
  );
}
