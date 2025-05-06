
import { useState, useEffect, useRef, useCallback } from "react";
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
  const operationCompletedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  // Limpeza de timeouts quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Reset operationCompleted quando dialog é aberto
  useEffect(() => {
    if (open) {
      operationCompletedRef.current = false;
    }
  }, [open]);

  const handleConfirm = useCallback(async () => {
    if (!activeSeason || isSubmitting || !amount || operationCompletedRef.current) return;
    
    try {
      setIsSubmitting(true);
      
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        toast({
          title: "Valor inválido",
          description: "Por favor, insira um valor numérico maior que zero.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      const valueToAdd = isAddition ? numericAmount : -numericAmount;
      
      // Execute a operação de atualização
      await updateJackpot(activeSeason.id, valueToAdd);
      
      // Marcar operação como concluída
      operationCompletedRef.current = true;
      
      toast({
        title: "Jackpot atualizado",
        description: `Valor ${isAddition ? "adicionado" : "removido"} com sucesso.`,
      });
      
      // Fechar diálogos com atrasos para evitar problemas de UI
      timeoutRef.current = window.setTimeout(() => {
        setConfirmOpen(false);
        
        timeoutRef.current = window.setTimeout(() => {
          // Resetar estado do formulário
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
      // Atraso para resetar o estado de submissão para evitar problemas de UI
      timeoutRef.current = window.setTimeout(() => {
        setIsSubmitting(false);
      }, 800);
    }
  }, [activeSeason, amount, isAddition, isSubmitting, toast, updateJackpot]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitting && !operationCompletedRef.current) {
      setConfirmOpen(true);
    }
  }, [isSubmitting]);

  // Se não houver temporada ativa, não renderizar o diálogo
  if (!activeSeason) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(newOpen) => {
        // Não permitir fechamento durante submissão
        if (isSubmitting) return;
        setOpen(newOpen);
        
        // Resetar formulário ao fechar
        if (!newOpen) {
          timeoutRef.current = window.setTimeout(() => {
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
          
          <JackpotAmountForm 
            onSubmit={handleSubmit}
            amount={amount}
            setAmount={setAmount}
            isAddition={isAddition}
            setIsAddition={setIsAddition}
            isSubmitting={isSubmitting}
            operationCompleted={operationCompletedRef.current}
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
        operationCompleted={operationCompletedRef.current}
      />
    </>
  );
}
