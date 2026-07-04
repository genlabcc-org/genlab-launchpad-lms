export interface CountryOption {
  code: string;
  country: string;
  flag: string;
  enabled: boolean;
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: '+91', country: 'India', flag: '🇮🇳', enabled: true },
  // { code: '+1', country: 'United States', flag: '🇺🇸', enabled: false },
  // { code: '+44', country: 'United Kingdom', flag: '🇬🇧', enabled: false },
  // { code: '+971', country: 'UAE', flag: '🇦🇪', enabled: false },
  // { code: '+1', country: 'Canada', flag: '🇨🇦', enabled: false },
];
