import type { Municipality } from '../types/municipality.interface'

export const formatMunicipalityLabel = (
  municipality: Pick<Municipality, 'name' | 'state'>,
) => `${municipality.name} - ${municipality.state.name}`
