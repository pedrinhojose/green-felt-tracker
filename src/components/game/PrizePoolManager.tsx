
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils/dateUtils";
import PrizeWinnersDisplay from "./PrizeWinnersDisplay";
import LivePrizePreview from "./LivePrizePreview";
import { Game } from "@/lib/db/models";
import { Player, Season } from "@/lib/db/models";

interface PrizePoolManagerProps {
  totalPrizePool: number;
  onCalculateDinner: (dinnerCost: number) => void;
  onDistributePrizes: () => void;
  initialDinnerCost?: number;
  game: Game;
  players: Player[];
  activeSeason: Season | null;
}

export default function PrizePoolManager({ 
  totalPrizePool,
  onCalculateDinner,
  onDistributePrizes,
  initialDinnerCost = 0,
  game,
  players,
  activeSeason
}: PrizePoolManagerProps) {
  const [dinnerCost, setDinnerCost] = useState<number>(initialDinnerCost);
  const [showWinners, setShowWinners] = useState<boolean>(
    game.players.some(player => player.prize > 0)
  );
  
  const handleSaveDinner = () => {
    onCalculateDinner(dinnerCost);
  };
  
  const handleDistributePrizes = () => {
    onDistributePrizes();
    setShowWinners(true);
  };
  
  return (
    <div className="space-y-4">
      {/* Prize Pool Info and Management */}
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="flex-1">
          <h3 className="text-xl font-medium text-white">Prêmio Total</h3>
          <p className="text-2xl font-bold text-poker-gold">{formatCurrency(totalPrizePool)}</p>
          
          {/* Informações sobre caixinha */}
          {activeSeason?.financialParams.clubFundContribution && activeSeason.financialParams.clubFundContribution > 0 && game.players.some(p => p.participatesInClubFund) && (
            <div className="mt-2 p-3 bg-poker-navy/30 rounded-lg border border-poker-gold/20">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Caixinha por jogador:</span>
                <span className="text-sm font-medium text-poker-blue">
                  {formatCurrency(activeSeason.financialParams.clubFundContribution)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-muted-foreground">Total arrecadado:</span>
                <span className="text-sm font-medium text-poker-blue">
                  {formatCurrency(activeSeason.financialParams.clubFundContribution * game.players.filter(p => p.participatesInClubFund).length)}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex gap-2 mt-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Gerenciar Janta</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gerenciar Janta</DialogTitle>
                  <DialogDescription>
                    Defina o valor total da janta. Este valor será dividido entre os jogadores que participaram.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <Label htmlFor="dinnerCost">Valor Total da Janta (R$)</Label>
                  <Input
                    id="dinnerCost"
                    type="number"
                    min="0"
                    step="any"
                    value={dinnerCost}
                    onChange={(e) => setDinnerCost(Number(e.target.value))}
                  />
                </div>
                
                <DialogFooter>
                  <Button onClick={handleSaveDinner}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button onClick={handleDistributePrizes}>Calcular Prêmios</Button>
          </div>
        </div>
        
        <div className="flex-1">
          <PrizeWinnersDisplay 
            game={game} 
            players={players} 
            showWinners={showWinners} 
          />
        </div>
      </div>
      
      {/* Live Prize Preview - only show if no prizes have been distributed yet */}
      {!showWinners && (
        <LivePrizePreview 
          totalPrizePool={totalPrizePool}
          activeSeason={activeSeason}
        />
      )}
    </div>
  );
}
