
import React from "react";
import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  progressPercentage: number;
  onProgressClick: (percentage: number) => void;
}

export function ProgressBar({ progressPercentage, onProgressClick }: ProgressBarProps) {
  // Determinar a cor da barra de progresso
  const getProgressColor = () => {
    if (progressPercentage >= 85) return 'bg-red-500';
    if (progressPercentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Handler para clique na barra de progresso
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log("Progress bar clicked");
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = (clickPosition / rect.width) * 100;
    console.log(`Setting progress to ${percentage.toFixed(2)}%`);
    onProgressClick(percentage);
  };
  
  return (
    <div 
      className="w-full bg-gray-700 rounded-full h-6 mt-4 cursor-pointer relative"
      onClick={handleProgressClick}
      data-testid="progress-bar"
    >
      <Progress 
        value={progressPercentage} 
        className="h-6 rounded-full bg-gray-700" 
        barClassName={getProgressColor()}
      />
    </div>
  );
}
