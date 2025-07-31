
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CircularProgressRingProps {
  progressPercentage: number;
  onProgressClick: (percentage: number) => void;
}

export function CircularProgressRing({ progressPercentage, onProgressClick }: CircularProgressRingProps) {
  const isMobile = useIsMobile();
  
  const radius = isMobile ? 100 : 180;
  const svgSize = isMobile ? 240 : 400;
  const center = svgSize / 2;
  const strokeWidth = isMobile ? 8 : 12;
  const shadowRadius = radius + 15;
  
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;
  
  const getStrokeColor = () => {
    if (progressPercentage >= 85) return '#ef4444';
    if (progressPercentage >= 70) return '#f59e0b';
    return '#DFC661';
  };

  const handleClick = (e: React.MouseEvent<SVGElement>) => {
    console.log("=== CLIQUE NO ANEL - CORREÇÃO IMPLEMENTADA ===");
    
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const clickX = e.clientX - rect.left - centerX;
      const clickY = e.clientY - rect.top - centerY;
      
      const distanceFromCenter = Math.sqrt(clickX * clickX + clickY * clickY);
      const innerRadius = radius - strokeWidth * 2;
      const outerRadius = radius + strokeWidth * 2;
      
      if (distanceFromCenter < innerRadius || distanceFromCenter > outerRadius) {
        return;
      }
      
      let angle = Math.atan2(clickY, clickX) * (180 / Math.PI);
      angle = (angle + 90) % 360;
      if (angle < 0) angle += 360;
      
      const percentage = (angle / 360) * 100;
      onProgressClick(percentage);
      
    } catch (error) {
      console.error("Erro no handleClick:", error);
    }
  };

  return (
    <div className="relative">
      {/* Container simplificado */}
      <div className="relative">
        <svg 
          width={svgSize} 
          height={svgSize} 
          className="cursor-pointer transform -rotate-90"
          onClick={handleClick}
          style={{ 
            zIndex: 10,
            pointerEvents: 'all'
          }}
        >
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(255, 255, 255, 0.2)"
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
            className="transition-all duration-300 ease-out"
          />
        </svg>
      </div>
    </div>
  );
}
