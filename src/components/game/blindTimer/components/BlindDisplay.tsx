
import React from "react";
import { BlindLevel } from "@/lib/db/models";
import { useIsMobile } from "@/hooks/use-mobile";

interface BlindDisplayProps {
  currentLevel: BlindLevel;
  isNewBlindAlert: boolean;
}

export function BlindDisplay({ currentLevel, isNewBlindAlert }: BlindDisplayProps) {
  const isMobile = useIsMobile();
  
  // Efeito de alerta para blinds - aplicamos apenas nos primeiros 3 segundos
  const blindsClass = isNewBlindAlert
    ? 'animate-pulse scale-110 text-poker-gold'
    : 'text-poker-gold';
    
  if (currentLevel.isBreak) {
    return (
      <div className="text-3xl text-poker-gold font-bold" 
        style={{ textShadow: "0px 2px 4px rgba(0,0,0,0.5)" }}>
        Pausa para Descanso
      </div>
    );
  }
  
  return (
    <div 
      className={`text-5xl md:text-6xl font-bold ${blindsClass} transition-all`}
      style={{ 
        textShadow: "0px 2px 4px rgba(0,0,0,0.5)", 
        color: "#FFD700" // Amarelo forte (gold) para destacar
      }}
    >
      {isMobile ? (
        <div className="flex flex-col space-y-1">
          <div>SB: {currentLevel.smallBlind}</div>
          <div>BB: {currentLevel.bigBlind}</div>
          {currentLevel.ante > 0 && <div className="text-2xl">Ante: {currentLevel.ante}</div>}
        </div>
      ) : (
        <>
          SB: {currentLevel.smallBlind} / BB: {currentLevel.bigBlind}
          {currentLevel.ante > 0 && ` / Ante: ${currentLevel.ante}`}
        </>
      )}
    </div>
  );
}
