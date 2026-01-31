// City Selector Component - State and City selection with IBGE API

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Loader2, Check } from 'lucide-react';
import { 
  fetchStates, 
  fetchCitiesByState, 
  IBGEState, 
  IBGECity 
} from '@/services/locationService';
import { cn } from '@/lib/utils';

interface CitySelectorProps {
  onSelect: (city: string, state: string, stateCode: string) => void;
  onCancel: () => void;
}

const CitySelector: React.FC<CitySelectorProps> = ({ onSelect, onCancel }) => {
  const [states, setStates] = useState<IBGEState[]>([]);
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [selectedState, setSelectedState] = useState<IBGEState | null>(null);
  const [selectedCity, setSelectedCity] = useState<IBGECity | null>(null);
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Load states on mount
  useEffect(() => {
    const loadStates = async () => {
      setLoadingStates(true);
      const statesData = await fetchStates();
      setStates(statesData);
      setLoadingStates(false);
    };
    loadStates();
  }, []);

  // Load cities when state changes
  useEffect(() => {
    if (selectedState) {
      const loadCities = async () => {
        setLoadingCities(true);
        setCities([]);
        setSelectedCity(null);
        setCitySearch('');
        // IBGE endpoint expects the numeric state id (e.g., 35 for SP)
        const citiesData = await fetchCitiesByState(String(selectedState.id));
        setCities(citiesData);
        setLoadingCities(false);
      };
      loadCities();
    }
  }, [selectedState]);

  // Filter states
  const filteredStates = useMemo(() => {
    if (!stateSearch) return states;
    const search = stateSearch.toLowerCase();
    return states.filter(
      state => 
        state.nome.toLowerCase().includes(search) ||
        state.sigla.toLowerCase().includes(search)
    );
  }, [states, stateSearch]);

  // Filter cities
  const filteredCities = useMemo(() => {
    if (!citySearch) return cities;
    const search = citySearch.toLowerCase();
    return cities.filter(city => city.nome.toLowerCase().includes(search));
  }, [cities, citySearch]);

  const handleStateSelect = (state: IBGEState) => {
    setSelectedState(state);
    setStateSearch('');
    setShowStateDropdown(false);
  };

  const handleCitySelect = (city: IBGECity) => {
    setSelectedCity(city);
    setCitySearch('');
    setShowCityDropdown(false);
  };

  const handleConfirm = () => {
    if (selectedState && selectedCity) {
      onSelect(selectedCity.nome, selectedState.nome, selectedState.sigla);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="font-display font-bold text-xl">Selecione sua cidade</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Escolha o estado e depois a cidade
        </p>
      </div>

      {/* State Selector */}
      <div className="relative">
        <label className="block text-sm font-medium mb-2">Estado</label>
        <button
          onClick={() => setShowStateDropdown(!showStateDropdown)}
          className={cn(
            'w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between',
            showStateDropdown ? 'border-primary' : 'border-border',
            loadingStates && 'opacity-50'
          )}
          disabled={loadingStates}
        >
          {loadingStates ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando estados...
            </span>
          ) : selectedState ? (
            <span className="font-medium">
              {selectedState.sigla} - {selectedState.nome}
            </span>
          ) : (
            <span className="text-muted-foreground">Selecione o estado</span>
          )}
          <ChevronDown className={cn(
            'w-5 h-5 transition-transform',
            showStateDropdown && 'rotate-180'
          )} />
        </button>

        {/* State Dropdown */}
        {showStateDropdown && (
          <div className="absolute z-50 w-full mt-2 bg-card rounded-xl border border-border shadow-xl max-h-64 overflow-hidden">
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                  placeholder="Buscar estado..."
                  className="w-full pl-9 pr-4 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-48">
              {filteredStates.map((state) => (
                <button
                  key={state.id}
                  onClick={() => handleStateSelect(state)}
                  className={cn(
                    'w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center justify-between',
                    selectedState?.id === state.id && 'bg-primary/10 text-primary'
                  )}
                >
                  <span>
                    <strong>{state.sigla}</strong> - {state.nome}
                  </span>
                  {selectedState?.id === state.id && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
              {filteredStates.length === 0 && (
                <p className="px-4 py-3 text-muted-foreground text-sm">
                  Nenhum estado encontrado
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* City Selector */}
      <div className="relative">
        <label className="block text-sm font-medium mb-2">Cidade</label>
        <button
          onClick={() => selectedState && setShowCityDropdown(!showCityDropdown)}
          className={cn(
            'w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between',
            showCityDropdown ? 'border-primary' : 'border-border',
            !selectedState && 'opacity-50 cursor-not-allowed'
          )}
          disabled={!selectedState || loadingCities}
        >
          {loadingCities ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando cidades...
            </span>
          ) : selectedCity ? (
            <span className="font-medium">{selectedCity.nome}</span>
          ) : (
            <span className="text-muted-foreground">
              {selectedState ? 'Selecione a cidade' : 'Selecione o estado primeiro'}
            </span>
          )}
          <ChevronDown className={cn(
            'w-5 h-5 transition-transform',
            showCityDropdown && 'rotate-180'
          )} />
        </button>

        {/* City Dropdown */}
        {showCityDropdown && (
          <div className="absolute z-50 w-full mt-2 bg-card rounded-xl border border-border shadow-xl max-h-64 overflow-hidden">
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Buscar cidade..."
                  className="w-full pl-9 pr-4 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-48">
              {filteredCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                  className={cn(
                    'w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center justify-between',
                    selectedCity?.id === city.id && 'bg-primary/10 text-primary'
                  )}
                >
                  <span>{city.nome}</span>
                  {selectedCity?.id === city.id && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
              {filteredCities.length === 0 && (
                <p className="px-4 py-3 text-muted-foreground text-sm">
                  Nenhuma cidade encontrada
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 py-3 px-4 rounded-xl border-2 border-border font-semibold hover:bg-muted transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedState || !selectedCity}
          className={cn(
            'flex-1 py-3 px-4 rounded-xl font-semibold transition-all',
            selectedState && selectedCity
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
};

export default CitySelector;
