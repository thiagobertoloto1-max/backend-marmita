// Location Gate Page - Initial location selection screen

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Loader2 } from 'lucide-react';
import { detectLocationByIP, LocationData } from '@/services/locationService';
import { useLocation } from '@/contexts/LocationContext';
import CitySelector from '@/components/CitySelector';
import LoadingScreen from '@/components/LoadingScreen';
import { cn } from '@/lib/utils';

type ViewState = 'detecting' | 'confirm' | 'select' | 'loading';

const LocationGatePage: React.FC = () => {
  const navigate = useNavigate();
  const { setLocation } = useLocation();
  const [viewState, setViewState] = useState<ViewState>('detecting');
  const [detectedLocation, setDetectedLocation] = useState<LocationData | null>(null);

  // Detect location on mount
  useEffect(() => {
    const detect = async () => {
      const location = await detectLocationByIP();
      if (location) {
        setDetectedLocation(location);
        setViewState('confirm');
      } else {
        setViewState('select');
      }
    };
    detect();
  }, []);

  const handleConfirmLocation = () => {
    if (detectedLocation) {
      setLocation(detectedLocation);
      setViewState('loading');
    }
  };

  const handleSelectOtherCity = () => {
    setViewState('select');
  };

  const handleCitySelected = (city: string, state: string, stateCode: string) => {
    setLocation({ city, state, stateCode });
    setViewState('loading');
  };

  const handleCancelSelect = () => {
    if (detectedLocation) {
      setViewState('confirm');
    }
  };

  const handleLoadingComplete = () => {
    navigate('/', { replace: true });
  };

  // Detecting location view
  if (viewState === 'detecting') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 animate-fade-in">
          {/* Logo */}
          <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-lg">
            <span className="text-5xl">🍱</span>
          </div>
          
          <div>
            <h1 className="font-display font-bold text-2xl">Divino Sabor</h1>
            <p className="text-muted-foreground mt-1">Marmitex caseiro de verdade</p>
          </div>

          {/* Delivery Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <span className="text-lg">🛵</span>
            <span className="text-sm font-medium text-primary">Delivery Próprio</span>
          </div>

          {/* Loading */}
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Detectando sua localização...</span>
          </div>
        </div>
      </div>
    );
  }

  // Loading screen view
  if (viewState === 'loading') {
    return <LoadingScreen onComplete={handleLoadingComplete} duration={5000} />;
  }

  // City selector view
  if (viewState === 'select') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-lg mb-4">
            <span className="text-4xl">🍱</span>
          </div>
          <h1 className="font-display font-bold text-xl">Divino Sabor</h1>
        </div>

        <CitySelector 
          onSelect={handleCitySelected}
          onCancel={handleCancelSelect}
        />
      </div>
    );
  }

  // Confirm location view
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-lg mb-4">
            <span className="text-5xl">🍱</span>
          </div>
          <h1 className="font-display font-bold text-2xl">Divino Sabor</h1>
          <p className="text-muted-foreground mt-1">Marmitex caseiro de verdade</p>
        </div>

        {/* Delivery Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <span className="text-lg">🛵</span>
            <span className="text-sm font-medium text-primary">Delivery Próprio</span>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sua localização</p>
              <p className="font-display font-bold text-lg">
                {detectedLocation?.city} – {detectedLocation?.stateCode}
              </p>
            </div>
          </div>

          <p className="text-center text-muted-foreground mb-6">
            Você está em <strong className="text-foreground">{detectedLocation?.city}</strong>?
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleConfirmLocation}
              className="w-full py-4 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg"
            >
              Sim, estou aqui
            </button>
            <button
              onClick={handleSelectOtherCity}
              className="w-full py-4 px-6 rounded-xl border-2 border-border font-semibold hover:bg-muted transition-all active:scale-[0.98]"
            >
              Outra cidade
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Precisamos da sua localização para encontrar lojas próximas
        </p>
      </div>
    </div>
  );
};

export default LocationGatePage;
