
import React from "react";
import { BlindLevel } from "@/lib/db/models";

interface BlindDisplayProps {
  currentLevel: BlindLevel;
  isNewBlindAlert: boolean;
}

export function BlindDisplay({ currentLevel, isNewBlindAlert }: BlindDisplayProps) {
  // Efeito de alerta para blinds - aplicamos apenas nos primeiros 3 segundos
  // Adicionando text-shadow para criar efeito 3D nos blinds
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
      SB: {currentLevel.smallBlind} / BB: {currentLevel.bigBlind}
      {currentLevel.ante > 0 && ` / Ante: ${currentLevel.ante}`}
    </div>
  );
}
