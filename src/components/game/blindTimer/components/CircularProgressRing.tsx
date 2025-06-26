
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
    console.log("=== CIRCULAR PROGRESS RING CLICK - VERSÃO CORRIGIDA ===");
    
    // Parar propagação do evento IMEDIATAMENTE
    e.preventDefault();
    e.stopPropagation();
    
    console.log("1. Evento capturado com sucesso");
    console.log("2. Event target:", e.currentTarget);
    console.log("3. Progress percentage atual:", progressPercentage);
    
    try {
      // Obter as coordenadas do SVG
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Coordenadas do clique relativas ao centro do SVG
      const clickX = e.clientX - rect.left - centerX;
      const clickY = e.clientY - rect.top - centerY;
      
      console.log("4. Dados do clique:");
      console.log("   - Rect:", { width: rect.width, height: rect.height, left: rect.left, top: rect.top });
      console.log("   - Centro SVG:", { centerX, centerY });
      console.log("   - Clique absoluto:", { clientX: e.clientX, clientY: e.clientY });
      console.log("   - Clique relativo:", { clickX, clickY });
      
      // Calcular distância do centro para verificar se está dentro da área clicável
      const distanceFromCenter = Math.sqrt(clickX * clickX + clickY * clickY);
      const maxDistance = radius + strokeWidth; // Incluir a largura do stroke
      
      console.log("5. Validação de área:");
      console.log("   - Distância do centro:", distanceFromCenter);
      console.log("   - Raio máximo permitido:", maxDistance);
      console.log("   - Clique dentro da área?", distanceFromCenter <= maxDistance);
      
      if (distanceFromCenter > maxDistance) {
        console.log("6. CLIQUE FORA DA ÁREA - ignorando");
        return;
      }
      
      // Calcular o ângulo do clique (começando do topo, sentido horário)
      let angle = Math.atan2(clickY, clickX) * (180 / Math.PI);
      
      // Ajustar para começar do topo (12h) e ir no sentido horário
      angle = (angle + 90) % 360;
      if (angle < 0) angle += 360;
      
      // Converter ângulo para porcentagem (0-100%)
      const percentage = (angle / 360) * 100;
      
      console.log("6. Cálculos finais:");
      console.log("   - Ângulo bruto:", Math.atan2(clickY, clickX) * (180 / Math.PI));
      console.log("   - Ângulo ajustado:", angle);
      console.log("   - Porcentagem calculada:", percentage);
      
      // Validar porcentagem
      if (percentage < 0 || percentage > 100) {
        console.log("7. ERRO: Porcentagem inválida:", percentage);
        return;
      }
      
      console.log("7. SUCESSO - Chamando onProgressClick com:", percentage);
      onProgressClick(percentage);
      
    } catch (error) {
      console.error("ERRO no handleClick:", error);
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
        pointerEvents: 'all' // Garantir que o SVG receba eventos de mouse
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
        style={{ pointerEvents: 'none' }} // Não interceptar cliques
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
          pointerEvents: 'none' // Não interceptar cliques
        }}
      />
    </svg>
  );
}
