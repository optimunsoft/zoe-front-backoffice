import { toTitleCase } from '~/shared/utils/format'

import type { Municipality } from '~/core/ubication/types/municipality.interface'

export type CompanyLocationSearchOption = {
  key: string
  label: string
  municipalityId: string
  stateId: string
}

const normalizeSearchTerm = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

export const mapMunicipalitySearchToLocationOptions = (
  municipalities: Municipality[],
  term: string,
): CompanyLocationSearchOption[] => {
  const searchKey = normalizeSearchTerm(term)
  const options: CompanyLocationSearchOption[] = []
  const statesAdded = new Set<string>()

  for (const municipality of municipalities) {
    const stateMatches = normalizeSearchTerm(municipality.state.name).includes(searchKey)

    if (stateMatches && !statesAdded.has(municipality.state.id)) {
      options.push({
        key: `state-${municipality.state.id}`,
        label: `${toTitleCase(municipality.state.name)} (departamento)`,
        municipalityId: '',
        stateId: municipality.state.id,
      })
      statesAdded.add(municipality.state.id)
    }

    options.push({
      key: municipality.id,
      label: `${toTitleCase(municipality.name)} - ${toTitleCase(municipality.state.name)}`,
      municipalityId: municipality.id,
      stateId: '',
    })
  }

  return options
}
