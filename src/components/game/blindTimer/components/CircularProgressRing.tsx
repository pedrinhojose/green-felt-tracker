
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CircularProgressRingProps {
  progressPercentage: number;
  onProgressClick: (percentage: number) => void;
}

export function CircularProgressRing({ progressPercentage, onProgressClick }: CircularProgressRingProps) {
  const isMobile = useIsMobile();
  
  const radius = isMobile ? 120 : 180;
  const svgSize = isMobile ? 280 : 400;
  const center = svgSize / 2;
  const strokeWidth = isMobile ? 4 : 6;
  
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;
  
  const getStrokeColor = () => {
    if (progressPercentage >= 85) return '#ef4444'; // red-500
    if (progressPercentage >= 70) return '#f59e0b'; // yellow-500
    return '#DFC661'; // poker-gold
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
      
      console.log("Coordenadas do clique:", { clickX, clickY });
      
      // Verificar se está próximo do anel (área clicável mais permissiva)
      const distanceFromCenter = Math.sqrt(clickX * clickX + clickY * clickY);
      const innerRadius = radius - strokeWidth * 2;
      const outerRadius = radius + strokeWidth * 2;
      
      console.log("Validação de área:", {
        distanceFromCenter,
        innerRadius,
        outerRadius,
        isInClickableArea: distanceFromCenter >= innerRadius && distanceFromCenter <= outerRadius
      });
      
      if (distanceFromCenter < innerRadius || distanceFromCenter > outerRadius) {
        console.log("Clique fora da área do anel");
        return;
      }
      
      // Calcular ângulo e porcentagem
      let angle = Math.atan2(clickY, clickX) * (180 / Math.PI);
      angle = (angle + 90) % 360;
      if (angle < 0) angle += 360;
      
      const percentage = (angle / 360) * 100;
      
      console.log("Resultado:", { angle, percentage });
      console.log("✅ CHAMANDO onProgressClick com:", percentage);
      
      onProgressClick(percentage);
      
    } catch (error) {
      console.error("Erro no handleClick:", error);
    }
  };

  return (
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
          filter: 'drop-shadow(0 0 15px rgba(223, 198, 97, 0.6))'
        }}
      />
    </svg>
  );
}
