
import { useState } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, MinusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddJackpotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddJackpotDialog({ open, onOpenChange }: AddJackpotDialogProps) {
  const { activeSeason, updateJackpot } = usePoker();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isAddition, setIsAddition] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!activeSeason) return;
    
    try {
      setIsProcessing(true);
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) return;
      
      const valueToAdd = isAddition ? numericAmount : -numericAmount;
      
      await updateJackpot(activeSeason.id, valueToAdd);
      
      toast({
        title: "Jackpot atualizado",
        description: `Valor ${isAddition ? "adicionado" : "removido"} com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao atualizar jackpot:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o jackpot.",
        variant: "destructive",
      });
    } finally {
      // Limpar estados e fechar diálogos
      setConfirmOpen(false);
      setAmount("");
      setIsAddition(true);
      setIsProcessing(false);
      
      // Importante: fechar o diálogo principal por último
      setTimeout(() => {
        onOpenChange(false);
      }, 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmOpen(true);
  };
  
  const handleDialogClose = () => {
    // Só permitir fechar se não estiver processando
    if (!isProcessing) {
      onOpenChange(false);
    }
  };

  if (!activeSeason) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Atualizar Jackpot</DialogTitle>
            <DialogDescription>
              Adicione ou remova valores do jackpot atual.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={isAddition ? "default" : "outline"} 
                  onClick={() => setIsAddition(true)}
                  className="w-1/2"
                  disabled={isProcessing}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
                <Button
                  type="button"
                  variant={!isAddition ? "default" : "outline"}
                  onClick={() => setIsAddition(false)}
                  className="w-1/2"
                  disabled={isProcessing}
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
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="col-span-3"
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? "Processando..." : isAddition ? "Adicionar ao Jackpot" : "Remover do Jackpot"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a {isAddition ? "adicionar" : "remover"} manualmente R$ {amount} {isAddition ? "ao" : "do"} jackpot acumulado. 
              Esta ação é usada para ajustes manuais no jackpot.
              <br /><br />
              Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isProcessing}>
              {isProcessing ? "Processando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
