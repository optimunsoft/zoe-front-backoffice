import type { Company } from '../types/company.types'
import type { UTableColumn, UTableRow } from '~/core/ui/Tables/utable.types'

export type CompanyCatalogItem = {
  id: string
  name: string
}

export type CompanyMunicipalityItem = {
  id: string
  city: string
  state: string
}

export type CompanyTableCatalogs = {
  businessNatures?: CompanyCatalogItem[]
  taxResponsibilities?: CompanyCatalogItem[]
  documentTypes?: CompanyCatalogItem[]
  municipalities?: CompanyMunicipalityItem[]
  vatRegimes?: CompanyCatalogItem[]
}

const API_KEY_BADGE_COLORS = {
  Activa: 'success',
  Inactiva: 'danger',
} as const

export const companyColumns: UTableColumn[] = [
  { key: 'businessName', label: 'Razón social', variant: 'emphasis', toggleable: false },
  { key: 'documentNumber', label: 'Documento' },
  { key: 'email', label: 'Email' },
  { key: 'taxResponsibility', label: 'Responsabilidad fiscal' },
  { key: 'businessNature', label: 'Naturaleza' },
  { key: 'municipality', label: 'Ciudad' },
  {
    key: 'hasApiKey',
    label: 'API',
    type: 'badge',
    align: 'center',
    badgeColorMap: API_KEY_BADGE_COLORS,
  },
]

const findCatalogName = (
  items: CompanyCatalogItem[] | undefined,
  id: string,
) => items?.find((item) => item.id === id)?.name ?? '-'

const findMunicipality = (
  items: CompanyMunicipalityItem[] | undefined,
  id: string,
) => {
  const municipality = items?.find((item) => item.id === id)

  return {
    city: municipality?.city ?? '-',
    state: municipality?.state ?? '-',
  }
}

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
    const municipality = findMunicipality(catalogs.municipalities, company.municipalityId)

    return {
      id: company.id,
      businessName: getDisplayName(company),
      tradeName: company.tradeName || '-',
      documentType: findCatalogName(catalogs.documentTypes, company.documentTypeId),
      documentNumber: company.documentNumber || '-',
      email: company.email || '-',
      taxResponsibility: findCatalogName(catalogs.taxResponsibilities, company.taxResponsibilityId),
      businessNature: findCatalogName(catalogs.businessNatures, company.businessNatureId),
      municipality: municipality.city,
      municipalityCity: municipality.city,
      municipalityState: municipality.state,
      vatRegime: findCatalogName(catalogs.vatRegimes, company.vatRegimeId),
      address: company.address || '-',
      hasApiKey: company.hasApiKey ? 'Activa' : 'Inactiva',
    }
  })
}
