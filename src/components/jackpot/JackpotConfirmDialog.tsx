
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

interface JackpotConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isAddition: boolean;
  amount: string;
  isSubmitting: boolean;
  operationCompleted: boolean;
}

export function JackpotConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isAddition,
  amount,
  isSubmitting,
  operationCompleted
}: JackpotConfirmDialogProps) {
  return (
    <AlertDialog 
      open={open} 
      onOpenChange={(newOpen) => {
        // Não permitir fechamento durante submissão
        if (isSubmitting) return;
        onOpenChange(newOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmação</AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a {isAddition ? "adicionar" : "remover"} R$ {amount} {isAddition ? "ao" : "do"} jackpot acumulado.
            <br /><br />
            Tem certeza que deseja continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            disabled={isSubmitting || operationCompleted}
          >
            {isSubmitting ? "Processando..." : "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
