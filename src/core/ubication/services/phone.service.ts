import { useCountryService } from '~/core/ubication/services/country.service';
import type {
  GetPhonePrefixCountriesResponse,
  GetRegistrationCountriesResponse,
} from '~/core/ubication/types/phone.interface';

export const usePhoneService = () => {
  const countrySvc = useCountryService();

  const getRegistrationCountries = (): Promise<GetRegistrationCountriesResponse> => {
    return countrySvc.getAvailable();
  };

  const getPrefixCountries = (): Promise<GetPhonePrefixCountriesResponse> => {
    return countrySvc.getAll();
  };

  return {
    getRegistrationCountries,
    getPrefixCountries,
  };
};
