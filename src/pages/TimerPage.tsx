
import { useParams } from "react-router-dom";
import { usePoker } from "@/contexts/PokerContext";
import BlindTimer from "@/components/game/blindTimer/BlindTimer";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function TimerPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const { activeSeason } = usePoker();
  const navigate = useNavigate();
  
  // Verificamos se a temporada ativa tem uma estrutura de blinds
  const hasBlindStructure = activeSeason && 
    activeSeason.blindStructure && 
    activeSeason.blindStructure.length > 0;

  if (!hasBlindStructure) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-poker-black p-4">
        <Card className="w-full max-w-3xl bg-poker-dark-green border border-poker-gold/20">
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-white text-lg">Estrutura de blinds não configurada para esta temporada</p>
            <Button 
              onClick={() => navigate("/temporada")} 
              className="bg-poker-gold text-black hover:bg-poker-gold/80"
            >
              Configurar Estrutura de Blinds
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-poker-black p-4 timer-container">
      <div className="w-full max-w-3xl">
        <BlindTimer />
      </div>
    </div>
  );
}
