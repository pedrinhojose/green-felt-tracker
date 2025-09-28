
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { Season } from "@/lib/db/models";
import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface JackpotCardProps {
  activeSeason: Season;
}

// Usando memo com uma função de comparação explícita para prevenir re-renderizações desnecessárias
export const JackpotCard = memo(function JackpotCard({ activeSeason }: JackpotCardProps) {
  const navigate = useNavigate();
  
  // Usa useMemo para evitar recálculos do valor formatado a cada renderização
  const formattedJackpot = useMemo(() => {
    return formatCurrency(activeSeason?.jackpot || 0);
  }, [activeSeason?.jackpot]);

  const handleClick = () => {
    navigate('/seasons');
  };

  return (
    <Card className="cursor-pointer transition-all hover:scale-105" onClick={handleClick}>
      <CardHeader>
        <CardTitle>Jackpot Atual</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          {/* Ícone visual de dinheiro empilhado */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-12 h-8 bg-green-500 rounded-sm transform rotate-3 absolute"></div>
              <div className="w-12 h-8 bg-green-600 rounded-sm transform -rotate-2 absolute top-1"></div>
              <div className="w-12 h-8 bg-green-700 rounded-sm absolute top-2"></div>
            </div>
          </div>
          
          <div className="text-3xl font-bold text-poker-gold mb-2">
            {activeSeason ? formattedJackpot : 'Sem temporada ativa'}
          </div>
          <p className="text-muted-foreground text-sm">
            {activeSeason 
              ? 'O jackpot será distribuído ao final da temporada'
              : 'Ative uma temporada para iniciar o jackpot'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Comparação personalizada: só re-renderiza se o valor do jackpot realmente mudar
  return prevProps.activeSeason?.jackpot === nextProps.activeSeason?.jackpot;
});
