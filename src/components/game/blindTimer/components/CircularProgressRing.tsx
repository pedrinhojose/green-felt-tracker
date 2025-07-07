
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
      {/* Container com efeito 3D flutuante */}
      <div 
        className="relative transform-gpu transition-all duration-300 hover:scale-105"
        style={{
          filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))',
          transform: 'perspective(1000px) rotateX(2deg)',
        }}
      >
        <svg 
          width={svgSize} 
          height={svgSize} 
          className="cursor-pointer transform -rotate-90 animate-gentle-float"
          onClick={handleClick}
          style={{ 
            zIndex: 10,
            pointerEvents: 'all'
          }}
        >
          {/* Definir gradientes */}
          <defs>
            <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={getStrokeColor()} stopOpacity="0.8" />
              <stop offset="70%" stopColor={getStrokeColor()} stopOpacity="0.4" />
              <stop offset="100%" stopColor={getStrokeColor()} stopOpacity="0.1" />
            </radialGradient>
            
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={getStrokeColor()} />
              <stop offset="50%" stopColor={getStrokeColor()} stopOpacity="0.9" />
              <stop offset="100%" stopColor={getStrokeColor()} stopOpacity="0.7" />
            </linearGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Sombra projetada no fundo */}
          <circle
            cx={center}
            cy={center + 8}
            r={shadowRadius}
            fill="url(#ringGlow)"
            opacity="0.3"
            className="blur-lg"
          />
          
          {/* Background ring externa (maior) */}
          <circle
            cx={center}
            cy={center}
            r={radius + 5}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth / 2}
            fill="transparent"
          />
          
          {/* Background ring principal */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Background ring interna (menor) */}
          <circle
            cx={center}
            cy={center}
            r={radius - 5}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth={strokeWidth / 3}
            fill="transparent"
          />
          
          {/* Progress ring principal com gradiente */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
            filter="url(#glow)"
          />
          
          {/* Progress ring brilho externo */}
          <circle
            cx={center}
            cy={center}
            r={radius + 2}
            stroke={getStrokeColor()}
            strokeWidth={2}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
            opacity="0.6"
          />
          
          {/* Ponto de progresso animado */}
          {progressPercentage > 0 && (
            <circle
              cx={center + radius * Math.cos((progressPercentage / 100 * 360 - 90) * Math.PI / 180)}
              cy={center + radius * Math.sin((progressPercentage / 100 * 360 - 90) * Math.PI / 180)}
              r="4"
              fill={getStrokeColor()}
              className="animate-pulse"
              style={{
                filter: `drop-shadow(0 0 8px ${getStrokeColor()})`,
              }}
            />
          )}
        </svg>
      </div>
    </div>
  );
}
