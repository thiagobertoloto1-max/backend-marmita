// Loading Screen Component - Progress bar animation

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

interface LoadingScreenProps {
  onComplete: () => void;
  duration?: number; // in milliseconds
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  onComplete, 
  duration = 5000 
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = 50; // Update every 50ms
    const increment = (100 / duration) * interval;
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 200); // Small delay before transition
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [duration, onComplete]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 animate-pulse-subtle">
            <span className="text-4xl">🍱</span>
          </div>
          <h1 className="font-display font-bold text-2xl">Marmita Express</h1>
        </div>

        {/* Loading Message */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Aguarde, estamos procurando uma loja aberta na sua região…
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <Progress value={progress} className="h-3" />
          <p className="text-center text-sm font-medium text-primary">
            {Math.round(progress)}%
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
