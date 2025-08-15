import React, { useState, useEffect } from "react";
import { Timer, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTimer } from "@/contexts/TimerContext";
import CircularTimer from "./CircularTimer";

export default function CollapsibleTimer() {
  const { hasOpenedNewWindow, isMasterWindow } = useTimer();
  const [isOpen, setIsOpen] = useState(!hasOpenedNewWindow);

  // Auto-collapse when new window is opened
  useEffect(() => {
    setIsOpen(!hasOpenedNewWindow);
  }, [hasOpenedNewWindow]);

  // If no new window is opened, just show the normal timer
  if (!hasOpenedNewWindow) {
    return <CircularTimer />;
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-poker-dark-green to-poker-dark-green-deep relative overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="h-full">
        {/* Notification Bar */}
        <CollapsibleTrigger asChild>
          <div className="w-full bg-gradient-to-r from-poker-gold/10 via-poker-gold/20 to-poker-gold/10 border-b-2 border-poker-gold/30 cursor-pointer hover:bg-poker-gold/15 transition-all duration-300 backdrop-blur-sm relative">
            <div className="absolute inset-0 bg-poker-gold/5 animate-pulse" />
            <div className="relative flex items-center justify-center p-4 space-x-3">
              <Timer className="h-5 w-5 text-poker-gold animate-pulse" />
              <span className="text-poker-gold font-medium text-lg">
                Timer em Nova Janela
              </span>
              {!isMasterWindow && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-400/30">
                  APENAS VISUALIZAÇÃO
                </span>
              )}
              <ChevronDown 
                className={`h-5 w-5 text-poker-gold transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : 'rotate-0'
                }`} 
              />
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Collapsible Timer Content */}
        <CollapsibleContent className="h-full data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up">
          <div className="h-full relative">
            <CircularTimer />
            
            {/* View Only Overlay when collapsed and expanded */}
            {!isMasterWindow && (
              <div className="absolute top-4 right-4 z-50">
                <div className="px-3 py-2 bg-blue-500/20 text-blue-300 text-sm rounded-lg border border-blue-400/30 backdrop-blur-sm">
                  APENAS VISUALIZAÇÃO
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}