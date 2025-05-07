
import { useState } from "react";
import { BlindLevel } from "@/lib/db/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddBreakDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blindLevels: BlindLevel[];
  onAddBreak: (breakAfterLevelIndex: number, duration: number) => void;
}

export function AddBreakDialog({
  open,
  onOpenChange,
  blindLevels,
  onAddBreak
}: AddBreakDialogProps) {
  const [breakAfterLevel, setBreakAfterLevel] = useState<string>("1");
  const [breakDuration, setBreakDuration] = useState<number>(15);

  const handleAddBreak = () => {
    const selectedLevelIndex = parseInt(breakAfterLevel);
    
    if (!isNaN(selectedLevelIndex)) {
      onAddBreak(selectedLevelIndex, breakDuration);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Intervalo</DialogTitle>
          <DialogDescription>
            Configure o intervalo a ser adicionado na estrutura de blinds.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="level-select" className="text-sm font-medium">
              Adicionar intervalo após o nível:
            </label>
            <Select
              value={breakAfterLevel}
              onValueChange={setBreakAfterLevel}
            >
              <SelectTrigger id="level-select">
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                {blindLevels.filter(level => !level.isBreak).map((level, index) => (
                  <SelectItem key={level.id} value={String(index)}>
                    Nível {level.level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="break-duration" className="text-sm font-medium">
              Duração do intervalo (minutos):
            </label>
            <Input
              id="break-duration"
              type="number"
              min="1"
              value={breakDuration}
              onChange={(e) => setBreakDuration(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            Cancelar
          </Button>
          <Button onClick={handleAddBreak} type="button">
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
