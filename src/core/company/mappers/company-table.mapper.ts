import type { Company, companyMunicipality } from '../types/company.types'
import type { UTableColumn, UTableRow } from '~/core/ui/Tables/utable.types'

export type CompanyCatalogItem = {
  id: string
  name: string
  code?: string
}

export type CompanyTableCatalogs = {
  businessNatures?: CompanyCatalogItem[]
  taxResponsibilities?: CompanyCatalogItem[]
  documentTypes?: CompanyCatalogItem[]
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
  { key: 'taxResponsibility', label: 'Responsabilidad fiscal' },
  { key: 'businessNature', label: 'Naturaleza' },
  { key: 'municipality', label: 'Ciudad' },
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

const normalizeDocumentTypeText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const isCitizenshipCard = (name: string, code: string) => {
  const normalized = normalizeDocumentTypeText(name)
  const normalizedCode = normalizeDocumentTypeText(code)

  return (
    (normalized.includes('cedula') && normalized.includes('ciudadania'))
    || (normalized.includes('cedula') && !normalized.includes('extranjera'))
    || normalizedCode === '13'
    || normalizedCode === 'cc'
    || normalized === 'cc'
  )
}

const isNit = (name: string, code: string) => {
  const normalized = normalizeDocumentTypeText(name)
  const normalizedCode = normalizeDocumentTypeText(code)

  return (
    normalized.includes('nit')
    || (normalized.includes('identificacion') && normalized.includes('tributaria'))
    || normalizedCode === '31'
    || normalizedCode === 'nit'
  )
}

const findDocumentTypeLabel = (
  items: CompanyCatalogItem[] | undefined,
  id: string,
) => {
  const item = items?.find((entry) => String(entry.id) === String(id))
  const name = item?.name ?? '-'
  if (name === '-') return '-'

  const code = item?.code ?? ''

  if (isCitizenshipCard(name, code)) return 'Cc'
  if (isNit(name, code)) return 'Nit'

  return name
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

    return {
      id: company.id,
      documentType: findDocumentTypeLabel(catalogs.documentTypes, company.documentTypeId),
      documentNumber: company.documentNumber || '-',
      businessName: getDisplayName(company),
      tradeName: company.tradeName || '-',
      email: company.email || '-',
      taxResponsibility: findCatalogName(catalogs.taxResponsibilities, company.taxResponsibilityId),
      businessNature: findCatalogName(catalogs.businessNatures, company.businessNatureId),
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
    }
  })
}
