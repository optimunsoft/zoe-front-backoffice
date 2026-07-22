import type { Company, companyMunicipality } from '../types/company.types'
import type { UTableColumn, UTableRow } from '~/core/ui/Tables/utable.types'
import { formatTableEmail } from '~/shared/utils/format'

export type CompanyCatalogItem = {
  id: string
  name: string
  code?: string
}

export type CompanyTableCatalogs = {
  businessNatures?: CompanyCatalogItem[]
  vatRegimes?: CompanyCatalogItem[]
}

const API_KEY_BADGE_COLORS = {
  Activa: 'success',
  Inactiva: 'danger',
} as const

const COMPANY_STATUS_BADGE_COLORS = {
  Activa: 'success',
  Inactiva: 'danger',
} as const

const PRODUCTION_BADGE_COLORS = {
  Producción: 'primary',
  'Pruebas/Demo': 'warning',
} as const

export const companyColumns: UTableColumn[] = [
  { key: 'documentNumber', label: 'Documento', toggleable: false },
  { key: 'businessName', label: 'Razón social', variant: 'emphasis' },
  { key: 'email', label: 'Email' },
  {
    key: 'isActive',
    label: 'Estado',
    type: 'badge',
    align: 'center',
    badgeColorMap: COMPANY_STATUS_BADGE_COLORS,
  },
  { key: 'municipality', label: 'Ciudad' },
  {
    key: 'production',
    label: 'Tipo',
    align: 'center',
    type: 'badge',
    badgeColorMap: PRODUCTION_BADGE_COLORS,
  },
  {
    key: 'hasApiKey',
    label: 'API KEY',
    type: 'badge',
    align: 'center',
    badgeColorMap: API_KEY_BADGE_COLORS,
  },
]

const findCatalogName = (
  items: CompanyCatalogItem[] | undefined,
  id: string,
) => items?.find((item) => String(item.id) === String(id))?.name ?? '-'

const normalizeCatalogLabel = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

/** Abreviatura de tipo de persona: NAT (natural) / JUR (jurídica). */
const findPersonTypeBadge = (
  items: CompanyCatalogItem[] | undefined,
  businessNatureId: string,
): { label: string, color: 'success' | 'warning' | 'neutral' } => {
  const name = items?.find((entry) => String(entry.id) === String(businessNatureId))?.name
  if (!name) return { label: '-', color: 'neutral' }

  const normalized = normalizeCatalogLabel(name)

  if (normalized.includes('persona natural')) {
    return { label: 'NAT', color: 'success' }
  }

  if (normalized.includes('persona juridica')) {
    return { label: 'JUR', color: 'warning' }
  }

  return { label: '-', color: 'neutral' }
}

const resolveMunicipalityDisplay = (municipality?: companyMunicipality | null) => ({
  city: municipality?.name?.trim() || '-',
  state: municipality?.state?.name?.trim() || '-',
})

const getDisplayName = (company: Company) => {
  const names = [
    company.firstName,
    company.middleName,
    company.lastName,
    company.secondLastName,
  ].filter(Boolean)

  return company.businessName || company.tradeName || names.join(' ') || '-'
}

export const mapCompaniesToTableRows = (
  companies: Company[],
  catalogs: CompanyTableCatalogs = {},
): UTableRow[] => {
  return companies.map((company) => {
    const municipality = resolveMunicipalityDisplay(company.municipality)
    const personType = findPersonTypeBadge(catalogs.businessNatures, company.businessNatureId)

    return {
      id: company.id,
      documentType: personType.label,
      documentTypeColor: personType.color,
      documentNumber: company.documentNumber || '-',
      businessName: getDisplayName(company),
      tradeName: company.tradeName || '-',
      email: formatTableEmail(company.email),
      municipality: municipality.city,
      municipalityCity: municipality.city,
      municipalityState: municipality.state,
      vatRegime: findCatalogName(catalogs.vatRegimes, company.vatRegimeId),
      address: company.address || '-',
      accountantName: company.accountantName || '-',
      professionalCard: company.professionalCard || '-',
      users: company.users ?? [],
      isActive: company.isActive ? 'Activa' : 'Inactiva',
      hasApiKey: company.hasApiKey ? 'Activa' : 'Inactiva',
      production: company.production ? 'Producción' : 'Pruebas/Demo',
    }
  })
}
