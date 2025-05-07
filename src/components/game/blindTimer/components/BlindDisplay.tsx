
import React from "react";
import { BlindLevel } from "@/lib/db/models";

interface BlindDisplayProps {
  currentLevel: BlindLevel;
  isNewBlindAlert: boolean;
}

export function BlindDisplay({ currentLevel, isNewBlindAlert }: BlindDisplayProps) {
  // Efeito de alerta para blinds - aplicamos apenas nos primeiros 3 segundos
  const blindsClass = isNewBlindAlert
    ? 'animate-pulse scale-110 text-poker-gold'
    : 'text-poker-gold';
    
  if (currentLevel.isBreak) {
    return (
      <div className="text-3xl text-poker-gold font-bold">
        Pausa para Descanso
      </div>
    );
  }
  
  return (
    <div className={`text-4xl md:text-5xl font-bold ${blindsClass} transition-all`}>
      SB: {currentLevel.smallBlind} / BB: {currentLevel.bigBlind}
      {currentLevel.ante > 0 && ` / Ante: ${currentLevel.ante}`}
    </div>
  );
}
