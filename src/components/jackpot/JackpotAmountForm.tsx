
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, MinusCircle } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";

interface JackpotAmountFormProps {
  onSubmit: (e: React.FormEvent) => void;
  amount: string;
  setAmount: (value: string) => void;
  isAddition: boolean;
  setIsAddition: (value: boolean) => void;
  isSubmitting: boolean;
  operationCompleted: boolean;
}

export function JackpotAmountForm({
  onSubmit,
  amount,
  setAmount,
  isAddition,
  setIsAddition,
  isSubmitting,
  operationCompleted
}: JackpotAmountFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant={isAddition ? "default" : "outline"} 
            onClick={() => !isSubmitting && setIsAddition(true)}
            className="w-1/2"
            disabled={isSubmitting}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
          <Button
            type="button"
            variant={!isAddition ? "default" : "outline"}
            onClick={() => !isSubmitting && setIsAddition(false)}
            className="w-1/2"
            disabled={isSubmitting}
          >
            <MinusCircle className="mr-2 h-4 w-4" />
            Remover
          </Button>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => !isSubmitting && setAmount(e.target.value)}
            placeholder="0,00"
            className="col-span-3"
            required
            disabled={isSubmitting}
          />
        </div>
      </div>
      <DialogFooter>
        <Button 
          type="submit" 
          disabled={isSubmitting || !amount || operationCompleted}
          className={isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
        >
          {isSubmitting ? "Processando..." : (isAddition ? "Adicionar ao Jackpot" : "Remover do Jackpot")}
        </Button>
      </DialogFooter>
    </form>
  );
}
