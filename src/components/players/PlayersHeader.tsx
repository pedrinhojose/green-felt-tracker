
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface PlayersHeaderProps {
  onAddPlayer: () => void;
  showInactive?: boolean;
  onToggleInactive?: () => void;
  inactiveCount?: number;
}

export function PlayersHeader({ 
  onAddPlayer, 
  showInactive = false, 
  onToggleInactive,
  inactiveCount = 0
}: PlayersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 className="text-2xl font-bold text-white">Jogadores</h2>
      <div className="flex flex-wrap gap-2">
        {inactiveCount > 0 && onToggleInactive && (
          <Button
            variant="outline"
            onClick={onToggleInactive}
            className="gap-2"
          >
            {showInactive ? (
              <>
                <EyeOff className="h-4 w-4" />
                Ocultar inativos ({inactiveCount})
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Mostrar inativos ({inactiveCount})
              </>
            )}
          </Button>
        )}
        <Button
          onClick={onAddPlayer}
          className="bg-poker-gold hover:bg-poker-gold/80 text-black"
        >
          Adicionar Jogador
        </Button>
      </div>
    </div>
  );
}
