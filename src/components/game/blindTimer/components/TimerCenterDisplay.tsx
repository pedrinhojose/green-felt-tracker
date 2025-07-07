
import React from "react";
import { BlindLevel } from "@/lib/db/models";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimerCenterDisplayProps {
  timeRemainingInLevel: number;
  currentLevel: BlindLevel | undefined;
  showAlert: boolean;
  isNewBlindAlert: boolean;
}

export function TimerCenterDisplay({ 
  timeRemainingInLevel, 
  currentLevel,
  showAlert,
  isNewBlindAlert 
}: TimerCenterDisplayProps) {
  const isMobile = useIsMobile();
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (showAlert || isNewBlindAlert) return 'text-red-400';
    if (timeRemainingInLevel <= 60) return 'text-yellow-400';
    return 'text-white';
  };

  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ pointerEvents: 'none' }}
    >
      {/* Container flutuante simples */}
      <div 
        className="relative transform-gpu animate-gentle-levitate"
        style={{
          filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) drop-shadow(0 12px 25px rgba(0, 0, 0, 0.4))',
          transform: 'perspective(1000px) rotateX(-1deg)',
          pointerEvents: 'auto'
        }}
      >
        {/* Timer principal com efeito 3D - sem container de fundo */}
        <div 
          className={`${isMobile ? 'text-[60px]' : 'text-[120px]'} font-bold ${getTimeColor()} transition-all duration-300 font-mono leading-none text-center relative ${isMobile ? 'mb-2' : 'mb-6'}`}
          style={{
            textShadow: '0 0 30px currentColor, 0 4px 8px rgba(0,0,0,0.8), 0 8px 16px rgba(0,0,0,0.6)',
            filter: 'drop-shadow(0 0 20px currentColor)',
          }}
        >
          {formatTime(timeRemainingInLevel)}
          
          {/* Reflexo do texto */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 bg-clip-text text-transparent"
            style={{ 
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {formatTime(timeRemainingInLevel)}
          </div>
        </div>
        
        {/* Label "Tempo" com efeito de profundidade - sem container */}
        <div 
          className={`text-poker-gold ${isMobile ? 'text-lg' : 'text-3xl'} font-normal text-center relative`}
          style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 15px rgba(223, 198, 97, 0.5)',
          }}
        >
          Tempo
          
          {/* Brilho sutil */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-transparent to-poker-gold/20 bg-clip-text text-transparent"
            style={{ 
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Tempo
          </div>
        </div>
        
        {/* Partículas de luz ao redor - mantidas para efeito etéreo */}
        <div className="absolute -inset-4">
          <div className="absolute top-0 left-0 w-1 h-1 bg-poker-gold/60 rounded-full animate-twinkle-1"></div>
          <div className="absolute top-1/4 right-0 w-0.5 h-0.5 bg-white/70 rounded-full animate-twinkle-2"></div>
          <div className="absolute bottom-0 left-1/4 w-1.5 h-1.5 bg-poker-gold/40 rounded-full animate-twinkle-3"></div>
          <div className="absolute bottom-1/4 right-1/4 w-0.5 h-0.5 bg-white/50 rounded-full animate-twinkle-1"></div>
        </div>
      </div>
    </div>
  );
}
