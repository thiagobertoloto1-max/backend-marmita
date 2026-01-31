// Store Header Component - Store info below search bar

import React from 'react';
import { Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';
import logoDivinoSabor from '@/assets/logo-divino-sabor.png';

const StoreHeader: React.FC = () => {
  const { location } = useLocation();

  return (
    <div className="bg-card border-b border-border">
      <div className="container px-4 py-4">
        <div className="flex items-center gap-4">
          {/* Store Logo */}
          <img 
            src={logoDivinoSabor} 
            alt="Divino Sabor" 
            className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-md"
          />

          {/* Store Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg truncate">
                Divino Sabor
              </h2>
              <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 bg-success/10 text-success text-xs font-semibold rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Aberto
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Seg a Sex — 11:00 às 14:00</span>
              </div>
              {location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{location.city} – {location.stateCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreHeader;
