
import React from "react";
import { Maximize2 } from "lucide-react";

interface FullscreenButtonProps {
  onToggleFullScreen: () => void;
}

export function FullscreenButton({ onToggleFullScreen }: FullscreenButtonProps) {
  return (
    <div 
      className="absolute top-0 right-0 p-2 opacity-50 hover:opacity-100 cursor-pointer transition-opacity"
      onClick={onToggleFullScreen}
      title="Alternar tela cheia"
    >
      <Maximize2 size={18} className="text-white" />
    </div>
  );
}
