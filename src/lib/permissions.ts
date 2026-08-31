// Granular permission system for Easy Asso.
// Permissions are strings grouped by domain. System roles map to sets of them.

export const PERMISSIONS = {
  // Website builder
  SITE_VIEW: 'site.view',
  SITE_EDIT: 'site.edit', // pages, blocks, header, footer, theme
  SITE_PUBLISH: 'site.publish',
  SITE_DOMAIN: 'site.domain', // manage custom domain
  // CRM
  DONORS_VIEW: 'donors.view',
  DONORS_EDIT: 'donors.edit',
  // Campaigns & donations
  CAMPAIGNS_VIEW: 'campaigns.view',
  CAMPAIGNS_EDIT: 'campaigns.edit',
  DONATIONS_VIEW: 'donations.view',
  DONATIONS_EDIT: 'donations.edit',
  RECEIPTS_MANAGE: 'receipts.manage',
  // Accounting
  ACCOUNTING_VIEW: 'accounting.view',
  ACCOUNTING_EDIT: 'accounting.edit',
  EXPORTS: 'exports.run',
  // Analytics
  STATS_VIEW: 'stats.view',
  // Administration
  TEAM_VIEW: 'team.view',
  TEAM_MANAGE: 'team.manage', // invite/remove members, assign roles
  ROLES_MANAGE: 'roles.manage', // create/edit custom roles
  BILLING_MANAGE: 'billing.manage',
  ORG_SETTINGS: 'org.settings',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

// Human-readable groups for the roles UI ("for dummies")
export const PERMISSION_GROUPS: {
  label: string;
  items: { key: Permission; label: string; help: string }[];
}[] = [
  {
    label: 'Site internet',
    items: [
      { key: PERMISSIONS.SITE_VIEW, label: 'Voir le site', help: 'Accéder à l’éditeur en lecture' },
      { key: PERMISSIONS.SITE_EDIT, label: 'Modifier le site', help: 'Éditer pages, blocs, header et footer' },
      { key: PERMISSIONS.SITE_PUBLISH, label: 'Publier le site', help: 'Mettre en ligne les modifications' },
      { key: PERMISSIONS.SITE_DOMAIN, label: 'Gérer le domaine', help: 'Relier un nom de domaine personnalisé' },
    ],
  },
  {
    label: 'Donateurs (CRM)',
    items: [
      { key: PERMISSIONS.DONORS_VIEW, label: 'Voir les donateurs', help: 'Consulter la base de contacts' },
      { key: PERMISSIONS.DONORS_EDIT, label: 'Gérer les donateurs', help: 'Ajouter / modifier / supprimer' },
    ],
  },
  {
    label: 'Campagnes & dons',
    items: [
      { key: PERMISSIONS.CAMPAIGNS_VIEW, label: 'Voir les campagnes', help: '' },
      { key: PERMISSIONS.CAMPAIGNS_EDIT, label: 'Gérer les campagnes', help: '' },
      { key: PERMISSIONS.DONATIONS_VIEW, label: 'Voir les dons', help: '' },
      { key: PERMISSIONS.DONATIONS_EDIT, label: 'Enregistrer des dons', help: '' },
      { key: PERMISSIONS.RECEIPTS_MANAGE, label: 'Émettre les reçus', help: 'Reçus fiscaux' },
    ],
  },
  {
    label: 'Comptabilité',
    items: [
      { key: PERMISSIONS.ACCOUNTING_VIEW, label: 'Voir la comptabilité', help: '' },
      { key: PERMISSIONS.ACCOUNTING_EDIT, label: 'Gérer dépenses / recettes', help: '' },
      { key: PERMISSIONS.EXPORTS, label: 'Exporter les données', help: 'CSV comptable, donateurs…' },
    ],
  },
  {
    label: 'Pilotage',
    items: [
      { key: PERMISSIONS.STATS_VIEW, label: 'Voir les statistiques', help: '' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { key: PERMISSIONS.TEAM_VIEW, label: 'Voir l’équipe', help: '' },
      { key: PERMISSIONS.TEAM_MANAGE, label: 'Gérer l’équipe', help: 'Inviter et retirer des membres' },
      { key: PERMISSIONS.ROLES_MANAGE, label: 'Gérer les rôles', help: 'Créer des rôles sur mesure' },
      { key: PERMISSIONS.BILLING_MANAGE, label: 'Gérer l’abonnement', help: '' },
      { key: PERMISSIONS.ORG_SETTINGS, label: 'Paramètres de l’association', help: '' },
    ],
  },
];

export type SystemRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'ACCOUNTANT' | 'MEMBER' | 'VIEWER';

const P = PERMISSIONS;

export const SYSTEM_ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  OWNER: ALL_PERMISSIONS,
  ADMIN: ALL_PERMISSIONS.filter((p) => p !== P.BILLING_MANAGE),
  EDITOR: [P.SITE_VIEW, P.SITE_EDIT, P.SITE_PUBLISH, P.CAMPAIGNS_VIEW, P.STATS_VIEW],
  ACCOUNTANT: [
    P.DONORS_VIEW, P.DONATIONS_VIEW, P.DONATIONS_EDIT, P.RECEIPTS_MANAGE,
    P.CAMPAIGNS_VIEW, P.ACCOUNTING_VIEW, P.ACCOUNTING_EDIT, P.EXPORTS, P.STATS_VIEW,
  ],
  MEMBER: [P.SITE_VIEW, P.DONORS_VIEW, P.CAMPAIGNS_VIEW, P.DONATIONS_VIEW, P.STATS_VIEW],
  VIEWER: [P.SITE_VIEW, P.DONORS_VIEW, P.CAMPAIGNS_VIEW, P.DONATIONS_VIEW, P.ACCOUNTING_VIEW, P.STATS_VIEW],
};

export const SYSTEM_ROLE_LABELS: Record<SystemRole, string> = {
  OWNER: 'Propriétaire',
  ADMIN: 'Administrateur',
  EDITOR: 'Éditeur du site',
  ACCOUNTANT: 'Trésorier / Comptable',
  MEMBER: 'Membre',
  VIEWER: 'Lecture seule',
};

export function permissionsForMembership(
  systemRole: SystemRole,
  customRolePermissions?: string[] | null
): Set<string> {
  const base = SYSTEM_ROLE_PERMISSIONS[systemRole] ?? [];
  const custom = customRolePermissions ?? [];
  return new Set<string>([...base, ...custom]);
}

export function can(perms: Set<string>, permission: Permission): boolean {
  return perms.has(permission);
}
