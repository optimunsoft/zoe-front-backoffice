import { defineStore } from 'pinia';
import type { Country, GetCountriesRequest } from '~/core/ubication/types/country.interface';
import type {
  GetMunicipalitiesRequest,
  Municipality,
} from '~/core/ubication/types/municipality.interface';
import { useCountryService } from '~/core/ubication/services/country.service';
import { useMunicipalityService } from '~/core/ubication/services/municipality.service';
import { usePhoneService } from '~/core/ubication/services/phone.service';

export const useUbicationStore = defineStore('ubication', () => {
  const countrySvc = useCountryService();
  const municipalitySvc = useMunicipalityService();
  const phoneSvc = usePhoneService();

  const countriesAvailable = ref<Country[]>([]);
  const countries = ref<Country[]>([]);
  const allCountries = ref<Country[]>([]);
  const municipalities = ref<Municipality[]>([]);

  const setCountriesAvailable = (payload: Country[]) => {
    countriesAvailable.value = payload;
  };

  const setCountries = (payload: Country[]) => {
    countries.value = payload;
  };

  const setAllCountries = (payload: Country[]) => {
    allCountries.value = payload;
  };

  const setMunicipalities = (payload: Municipality[]) => {
    municipalities.value = payload;
  };

  const getCountriesAvailable = async () => {
    const { response } = await phoneSvc.getRegistrationCountries();
    setCountriesAvailable(response);
  };

  const getCountries = async (request: GetCountriesRequest) => {
    const { response } = await countrySvc.search(request);
    setCountries(response);
  };

  const getAllCountries = async (force = false) => {
    if (allCountries.value.length > 0 && !force) return;
    const { response } = await phoneSvc.getPrefixCountries();
    setAllCountries(response);
  };

  const getMunicipalities = async (request: GetMunicipalitiesRequest) => {
    const { response } = await municipalitySvc.search(request);
    setMunicipalities(response);
  };

  return {
    countriesAvailable,
    getCountriesAvailable,
    municipalities,
    getMunicipalities,
    countries,
    getCountries,
    allCountries,
    getAllCountries,
  };
});
