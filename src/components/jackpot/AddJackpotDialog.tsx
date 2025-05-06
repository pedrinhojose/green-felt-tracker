
import { useState } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { JackpotAmountForm } from "./JackpotAmountForm";
import { JackpotConfirmDialog } from "./JackpotConfirmDialog";

export function AddJackpotDialog() {
  const { activeSeason, updateJackpot } = usePoker();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isAddition, setIsAddition] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [operationCompleted, setOperationCompleted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitting && !operationCompleted) {
      setConfirmOpen(true);
    }
  };
  
  const handleConfirm = async () => {
    if (!activeSeason || isSubmitting || !amount) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setOperationCompleted(true);
      
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
      
      await updateJackpot(activeSeason.id, valueToAdd);
      
      toast({
        title: "Jackpot atualizado",
        description: `Valor ${isAddition ? "adicionado" : "removido"} com sucesso.`,
      });
      
      // Fechar diálogos e limpar formulário
      setConfirmOpen(false);
      setOpen(false);
      setAmount("");
      setIsAddition(true);
      
    } catch (error) {
      console.error("Erro ao atualizar jackpot:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o jackpot. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDialogChange = (newOpen: boolean) => {
    if (isSubmitting) return;
    
    setOpen(newOpen);
    
    if (!newOpen) {
      // Resetar formulário ao fechar
      setAmount("");
      setIsAddition(true);
      setOperationCompleted(false);
    }
  };
  
  if (!activeSeason) return null;
  
  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogChange}>
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
          
          <JackpotAmountForm 
            onSubmit={handleSubmit}
            amount={amount}
            setAmount={setAmount}
            isAddition={isAddition}
            setIsAddition={setIsAddition}
            isSubmitting={isSubmitting}
            operationCompleted={operationCompleted}
          />
        </DialogContent>
      </Dialog>

      <JackpotConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirm}
        isAddition={isAddition}
        amount={amount}
        isSubmitting={isSubmitting}
        operationCompleted={operationCompleted}
      />
    </>
  );
}
