
import { useState, useEffect } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

export function AddJackpotDialog() {
  const { activeSeason, updateJackpot } = usePoker();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isAddition, setIsAddition] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [operationCompleted, setOperationCompleted] = useState(false);

  // Reset operationCompleted when dialog is opened
  useEffect(() => {
    if (open) {
      setOperationCompleted(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!activeSeason || isSubmitting || !amount || operationCompleted) return;
    
    try {
      setIsSubmitting(true);
      
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        toast({
          title: "Valor inválido",
          description: "Por favor, insira um valor numérico maior que zero.",
          variant: "destructive",
        });
        return;
      }
      
      const valueToAdd = isAddition ? numericAmount : -numericAmount;
      
      // Execute the update operation
      await updateJackpot(activeSeason.id, valueToAdd);
      
      // Mark operation as completed to prevent duplicate submissions
      setOperationCompleted(true);
      
      toast({
        title: "Jackpot atualizado",
        description: `Valor ${isAddition ? "adicionado" : "removido"} com sucesso.`,
      });
      
      // Delay closing dialogs to avoid UI jank
      setTimeout(() => {
        setConfirmOpen(false);
        
        setTimeout(() => {
          // Reset form state
          setAmount("");
          setIsAddition(true);
          setOpen(false);
        }, 300);
      }, 300);
      
    } catch (error) {
      console.error("Erro ao atualizar jackpot:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o jackpot. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      // Delay resetting submission state to prevent UI jank
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitting && !operationCompleted) {
      setConfirmOpen(true);
    }
  };

  // If no active season, don't render the dialog
  if (!activeSeason) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(newOpen) => {
        // Don't allow closing during submission
        if (isSubmitting) return;
        setOpen(newOpen);
        
        // Reset form when closing
        if (!newOpen) {
          setTimeout(() => {
            setAmount("");
            setIsAddition(true);
          }, 300);
        }
      }}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex gap-2">
            <PlusCircle className="h-4 w-4" />
            Atualizar Jackpot
          </Button>
        </DialogTrigger>
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
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={confirmOpen} 
        onOpenChange={(newOpen) => {
          // Don't allow closing during submission
          if (isSubmitting) return;
          setConfirmOpen(newOpen);
        }}
      >
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
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirm} 
              disabled={isSubmitting || operationCompleted}
              className={isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
            >
              {isSubmitting ? "Processando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
