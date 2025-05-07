
import React from "react";
import { BlindLevel } from "@/lib/db/models";

interface LevelHeaderProps {
  currentLevel: BlindLevel;
}

export function LevelHeader({ currentLevel }: LevelHeaderProps) {
  return (
    <div className="mb-2">
      <h2 className="text-xl text-white font-medium">
        {currentLevel.isBreak ? 'INTERVALO' : `NÍVEL ${currentLevel.level}`}
      </h2>
    </div>
  );
}
