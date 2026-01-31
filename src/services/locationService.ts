// Location Service - IP geolocation and IBGE API integration via Edge Function proxy

export interface LocationData {
  city: string;
  state: string;
  stateCode: string;
}

export interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

export interface IBGECity {
  id: number;
  nome: string;
}

const LOCATION_STORAGE_KEY = 'marmita_location';
const STATES_CACHE_KEY = 'ibge_states_cache';
const CITIES_CACHE_PREFIX = 'ibge_cities_';

// Brazilian states list (fallback)
export const brazilianStates: IBGEState[] = [
  { id: 12, sigla: 'AC', nome: 'Acre' },
  { id: 27, sigla: 'AL', nome: 'Alagoas' },
  { id: 16, sigla: 'AP', nome: 'Amapá' },
  { id: 13, sigla: 'AM', nome: 'Amazonas' },
  { id: 29, sigla: 'BA', nome: 'Bahia' },
  { id: 23, sigla: 'CE', nome: 'Ceará' },
  { id: 53, sigla: 'DF', nome: 'Distrito Federal' },
  { id: 32, sigla: 'ES', nome: 'Espírito Santo' },
  { id: 52, sigla: 'GO', nome: 'Goiás' },
  { id: 21, sigla: 'MA', nome: 'Maranhão' },
  { id: 51, sigla: 'MT', nome: 'Mato Grosso' },
  { id: 50, sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { id: 31, sigla: 'MG', nome: 'Minas Gerais' },
  { id: 15, sigla: 'PA', nome: 'Pará' },
  { id: 25, sigla: 'PB', nome: 'Paraíba' },
  { id: 41, sigla: 'PR', nome: 'Paraná' },
  { id: 26, sigla: 'PE', nome: 'Pernambuco' },
  { id: 22, sigla: 'PI', nome: 'Piauí' },
  { id: 33, sigla: 'RJ', nome: 'Rio de Janeiro' },
  { id: 24, sigla: 'RN', nome: 'Rio Grande do Norte' },
  { id: 43, sigla: 'RS', nome: 'Rio Grande do Sul' },
  { id: 11, sigla: 'RO', nome: 'Rondônia' },
  { id: 14, sigla: 'RR', nome: 'Roraima' },
  { id: 42, sigla: 'SC', nome: 'Santa Catarina' },
  { id: 35, sigla: 'SP', nome: 'São Paulo' },
  { id: 28, sigla: 'SE', nome: 'Sergipe' },
  { id: 17, sigla: 'TO', nome: 'Tocantins' }
];

// Detect location by IP
export const detectLocationByIP = async (): Promise<LocationData | null> => {
  try {
    // Try multiple IP geolocation services
    const services = [
      'https://ipapi.co/json/',
      'https://ip-api.com/json/?fields=city,region,regionName'
    ];

    for (const url of services) {
      try {
        const response = await fetch(url, { 
          signal: AbortSignal.timeout(5000) 
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // ipapi.co format
          if (data.city && data.region_code) {
            return {
              city: data.city,
              state: data.region,
              stateCode: data.region_code
            };
          }
          
          // ip-api.com format
          if (data.city && data.region) {
            const state = brazilianStates.find(
              s => s.nome.toLowerCase() === data.regionName?.toLowerCase()
            );
            return {
              city: data.city,
              state: data.regionName || data.region,
              stateCode: state?.sigla || data.region
            };
          }
        }
      } catch {
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error detecting location:', error);
    return null;
  }
};

// Fetch states from IBGE API via Edge Function proxy with cache
export const fetchStates = async (): Promise<IBGEState[]> => {
  try {
    // Check cache first
    const cached = localStorage.getItem(STATES_CACHE_KEY);
    if (cached) {
      console.log('Using cached states');
      return JSON.parse(cached);
    }

    console.log('Fetching states via edge function proxy...');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ibge-proxy?endpoint=estados?orderBy=nome`,
      { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      const states: IBGEState[] = await response.json();
      console.log(`Fetched ${states.length} states successfully`);
      localStorage.setItem(STATES_CACHE_KEY, JSON.stringify(states));
      return states;
    } else {
      console.error('Edge function error:', response.status);
    }
  } catch (error) {
    console.error('Error fetching states:', error);
  }

  console.log('Using fallback states list');
  return brazilianStates;
};

// Fetch cities from IBGE API via Edge Function proxy with cache
// NOTE: IBGE endpoint expects the numeric state id (e.g., 35 for SP).
// We accept either an id or a UF and normalize internally.
export const fetchCitiesByState = async (stateCodeOrId: string): Promise<IBGECity[]> => {
  const normalized = stateCodeOrId.trim();
  const stateId =
    normalized.length === 2
      ? (brazilianStates.find(s => s.sigla === normalized.toUpperCase())?.id ?? normalized)
      : normalized;

  const cacheKey = `${CITIES_CACHE_PREFIX}${stateId}`;

  try {
    // Check cache first
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      console.log(`Using cached cities for state ${stateId}`);
      return JSON.parse(cached);
    }

    console.log(`Fetching cities for state ${stateId} via edge function proxy...`);

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ibge-proxy?endpoint=estados/${stateId}/municipios?orderBy=nome`,
      { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      const cities: IBGECity[] = await response.json();
      console.log(`Fetched ${cities.length} cities for state ${stateId}`);
      localStorage.setItem(cacheKey, JSON.stringify(cities));
      return cities;
    } else {
      const errorText = await response.text();
      console.error(`Edge function error for cities: ${response.status}`, errorText);
    }
  } catch (error) {
    console.error('Error fetching cities:', error);
  }

  console.warn(`No cities found for state ${stateId}, returning empty array`);
  return [];
};

// Save location to localStorage
export const saveLocation = (location: LocationData): void => {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  } catch (error) {
    console.error('Error saving location:', error);
  }
};

// Load location from localStorage
export const loadLocation = (): LocationData | null => {
  try {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading location:', error);
  }
  return null;
};

// Clear location from localStorage
export const clearLocation = (): void => {
  try {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing location:', error);
  }
};

// Check if location is set
export const hasLocation = (): boolean => {
  return loadLocation() !== null;
};
