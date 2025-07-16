import React from 'react';
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimerResetButtonProps {
  onReset: () => void;
}

export default function TimerResetButton({ onReset }: TimerResetButtonProps) {
  const isMobile = useIsMobile();

  const handleReset = () => {
    console.log("=== RESET TIMER ===");
    if (confirm("Tem certeza que deseja resetar o timer? Isso irá voltar ao primeiro nível.")) {
      onReset();
    }
  };

  return (
    <Button
      onClick={handleReset}
      variant="ghost"
      size="icon"
      className={`text-white hover:text-red-400 ${isMobile ? 'p-1' : 'p-2'} bg-transparent border border-white/30 rounded hover:border-red-400/50 ${isMobile ? 'h-8 w-8' : ''}`}
      title="Resetar Timer"
    >
      <RotateCcw className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
    </Button>
  );
}