import { ApiError } from './api';

const API_URL = 'https://api.vercel.com';

function config() {
  const token = process.env.VERCEL_API_TOKEN;
  const project = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_NAME;
  const team = process.env.VERCEL_TEAM_ID;
  if (!token || !project) {
    throw new ApiError(503, 'La connexion automatique des domaines n’est pas encore activée. Contactez le support EasyAsso.');
  }
  return { token, project, team };
}

async function vercelRequest(path: string, init: RequestInit = {}) {
  const { token, team } = config();
  const url = new URL(`${API_URL}${path}`);
  if (team) url.searchParams.set('teamId', team);
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || 'Le service de domaines n’a pas pu traiter la demande.';
    throw new ApiError(response.status === 409 ? 409 : 502, message);
  }
  return data;
}

export function normalizeCustomerDomain(value: unknown) {
  const domain = String(value || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\.$/, '');
  if (!domain) return '';
  if (domain.length > 253 || !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) {
    throw new ApiError(400, 'Saisissez un nom de domaine valide, par exemple mon-association.fr.');
  }
  const protectedHosts = [
    process.env.NEXT_PUBLIC_ROOT_DOMAIN,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    'easyasso.vercel.app',
  ].filter(Boolean).map((host) => String(host).toLowerCase().split(':')[0]);
  if (protectedHosts.some((host) => domain === host || domain.endsWith(`.${host}`))) {
    throw new ApiError(400, 'Le domaine principal EasyAsso est protégé et ne peut pas être modifié. Saisissez le domaine de votre association.');
  }
  return domain;
}

export async function attachDomainToEasyAsso(domain: string) {
  const { project } = config();
  return vercelRequest(`/v10/projects/${encodeURIComponent(project)}/domains`, {
    method: 'POST',
    body: JSON.stringify({ name: domain }),
  });
}

export async function removeDomainFromEasyAsso(domain: string) {
  const { project } = config();
  return vercelRequest(`/v9/projects/${encodeURIComponent(project)}/domains/${encodeURIComponent(domain)}`, { method: 'DELETE' });
}

export async function domainStatus(domain: string) {
  const { project } = config();
  const data = await vercelRequest(`/v9/projects/${encodeURIComponent(project)}/domains/${encodeURIComponent(domain)}`);
  return { verified: Boolean(data.verified), verification: Array.isArray(data.verification) ? data.verification : [] };
}
