
import React from "react";

interface CircularProgressRingProps {
  progressPercentage: number;
  onProgressClick: (percentage: number) => void;
}

export function CircularProgressRing({ progressPercentage, onProgressClick }: CircularProgressRingProps) {
  const radius = 150;  // Anel maior para combinar com o timer grande
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
      width="350" 
      height="350" 
      className="cursor-pointer transform -rotate-90"
      onClick={handleClick}
    >
      {/* Background ring */}
      <circle
        cx="175"
        cy="175"
        r={radius}
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="6"
        fill="transparent"
      />
      
      {/* Progress ring */}
      <circle
        cx="175"
        cy="175"
        r={radius}
        stroke={getStrokeColor()}
        strokeWidth="6"
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
