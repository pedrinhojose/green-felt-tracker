
import React from "react";
import { Button } from "@/components/ui/button";

interface PlayersHeaderProps {
  onAddPlayer: () => void;
}

export function PlayersHeader({ onAddPlayer }: PlayersHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-white">Jogadores</h2>
      <Button
        onClick={onAddPlayer}
        className="bg-poker-gold hover:bg-poker-gold/80 text-black"
      >
        Adicionar Jogador
      </Button>
    </div>
  );
}
