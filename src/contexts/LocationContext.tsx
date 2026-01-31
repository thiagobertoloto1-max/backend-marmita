// Location Context - Global location state management

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  LocationData, 
  loadLocation, 
  saveLocation as saveLocationService,
  clearLocation as clearLocationService
} from '@/services/locationService';

interface LocationContextType {
  location: LocationData | null;
  isLocationSet: boolean;
  setLocation: (location: LocationData) => void;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<LocationData | null>(() => loadLocation());

  const isLocationSet = location !== null;

  const setLocation = (newLocation: LocationData) => {
    saveLocationService(newLocation);
    setLocationState(newLocation);
  };

  const clearLocation = () => {
    clearLocationService();
    setLocationState(null);
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        isLocationSet,
        setLocation,
        clearLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
