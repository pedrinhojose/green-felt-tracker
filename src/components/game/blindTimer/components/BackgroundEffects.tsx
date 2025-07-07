
import React from "react";

export function BackgroundEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradiente principal com profundidade */}
      <div className="absolute inset-0 bg-gradient-radial from-poker-dark-green/40 via-poker-dark-green to-poker-dark-green-deep"></div>
      
      {/* Círculos concêntricos para profundidade */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-[200px] h-[200px] border border-white/5 rounded-full animate-spin-slow"></div>
        <div className="absolute w-[300px] h-[300px] border border-poker-gold/10 rounded-full animate-spin-reverse-slow"></div>
        <div className="absolute w-[400px] h-[400px] border border-white/3 rounded-full animate-spin-slow"></div>
        <div className="absolute w-[500px] h-[500px] border border-poker-gold/5 rounded-full animate-spin-reverse-slow"></div>
      </div>
      
      {/* Partículas de luz flutuantes */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-poker-gold/30 rounded-full animate-float-1"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/40 rounded-full animate-float-2"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-poker-gold/20 rounded-full animate-float-3"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-float-1"></div>
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-poker-gold/25 rounded-full animate-float-2"></div>
      </div>
      
      {/* Vinheta nas bordas */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/30"></div>
      
      {/* Reflexo sutil no centro */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 bg-gradient-radial from-white/5 via-transparent to-transparent rounded-full blur-xl"></div>
      </div>
    </div>
  );
}
