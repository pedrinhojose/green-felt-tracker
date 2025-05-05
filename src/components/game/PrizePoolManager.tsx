
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils/dateUtils";

interface PrizePoolManagerProps {
  totalPrizePool: number;
  onCalculateDinner: (dinnerCost: number) => void;
  onDistributePrizes: () => void;
  initialDinnerCost?: number;
}

export default function PrizePoolManager({ 
  totalPrizePool,
  onCalculateDinner,
  onDistributePrizes,
  initialDinnerCost = 0
}: PrizePoolManagerProps) {
  const [dinnerCost, setDinnerCost] = useState<number>(initialDinnerCost);
  
  const handleSaveDinner = () => {
    onCalculateDinner(dinnerCost);
  };
  
  return (
    <div className="flex-1">
      <div>
        <h3 className="text-xl font-medium text-white">Prêmio Total</h3>
        <p className="text-2xl font-bold text-poker-gold">{formatCurrency(totalPrizePool)}</p>
      </div>
      
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
        
        <Button onClick={onDistributePrizes}>Calcular Prêmios</Button>
      </div>
    </div>
  );
}
