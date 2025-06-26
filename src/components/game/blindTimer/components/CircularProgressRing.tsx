
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CircularProgressRingProps {
  progressPercentage: number;
  onProgressClick: (percentage: number) => void;
}

export function CircularProgressRing({ progressPercentage, onProgressClick }: CircularProgressRingProps) {
  const isMobile = useIsMobile();
  
  // Tamanhos aumentados para deixar o timer mais dentro do círculo
  const radius = isMobile ? 120 : 180;
  const svgSize = isMobile ? 280 : 400;
  const center = svgSize / 2;
  const strokeWidth = isMobile ? 4 : 6;
  
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;
  
  // Determinar a cor do anel baseado no progresso
  const getStrokeColor = () => {
    if (progressPercentage >= 85) return '#ef4444'; // red-500
    if (progressPercentage >= 70) return '#f59e0b'; // yellow-500
    return '#DFC661'; // poker-gold
  };

  const handleClick = (e: React.MouseEvent<SVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;
    
    // Calcular o ângulo do clique
    let angle = Math.atan2(y, x) * 180 / Math.PI;
    angle = (angle + 90) % 360; // Ajustar para começar do topo
    if (angle < 0) angle += 360;
    
    const percentage = (angle / 360) * 100;
    onProgressClick(percentage);
  };

  return (
    <svg 
      width={svgSize} 
      height={svgSize} 
      className="cursor-pointer transform -rotate-90"
      onClick={handleClick}
    >
      {/* Background ring */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      
      {/* Progress ring */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke={getStrokeColor()}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        className="transition-all duration-500 ease-out"
        style={{
          filter: 'drop-shadow(0 0 15px rgba(223, 198, 97, 0.6))',
        }}
      />
    </svg>
  );
}
