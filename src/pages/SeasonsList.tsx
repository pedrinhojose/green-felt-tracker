
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight, Trophy } from "lucide-react";
import { formatDate } from "@/lib/utils/dateUtils";
import { Season } from "@/lib/db/models";
import { pokerDB } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";

export default function SeasonsList() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSeasons = async () => {
      try {
        setLoading(true);
        const allSeasons = await pokerDB.getSeasons();
        // Sort seasons: active first, then by creation date (newest first)
        const sortedSeasons = [...allSeasons].sort((a, b) => {
          // Active seasons first
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          // Then sort by creation date (newest first)
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
        
        setSeasons(sortedSeasons);
      } catch (error) {
        console.error("Error loading seasons:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as temporadas.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSeasons();
  }, [toast]);
  
  const getSeasonStatus = (season: Season) => {
    if (season.isActive) return "active";
    if (season.endDate) return "finished";
    return "inactive";
  };
  
  const getStatusBadge = (status: "active" | "finished" | "inactive") => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">Ativa</span>;
      case "finished":
        return <span className="px-2 py-1 text-xs bg-gray-600 text-white rounded-full">Encerrada</span>;
      case "inactive":
        return <span className="px-2 py-1 text-xs bg-yellow-600 text-white rounded-full">Inativa</span>;
    }
  };
  
  const handleViewSeason = (seasonId: string, isActive: boolean) => {
    if (isActive) {
      // If active, go to the report page
      navigate("/report");
    } else {
      // If inactive or finished, go to the season details page
      navigate(`/seasons/${seasonId}`);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Temporadas</h2>
          <p className="text-muted-foreground">
            Temporadas ativas e encerradas
          </p>
        </div>
        
        <div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/season")}
          >
            Nova Temporada
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <p>Carregando temporadas...</p>
        </div>
      ) : seasons.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {seasons.map((season) => {
            const status = getSeasonStatus(season);
            
            return (
              <Card 
                key={season.id} 
                className={`hover:bg-poker-green/10 cursor-pointer transition-all duration-200 ${
                  status === "active" ? "border-2 border-poker-gold" : ""
                }`}
                onClick={() => handleViewSeason(season.id, season.isActive)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <span>{season.name}</span>
                    {getStatusBadge(status)}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Início: {formatDate(season.startDate)}</span>
                    </div>
                    
                    {season.endDate && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Fim: {formatDate(season.endDate)}</span>
                      </div>
                    )}
                    
                    {status === "finished" && (
                      <div className="flex items-center text-sm text-poker-gold">
                        <Trophy className="h-4 w-4 mr-2" />
                        <span>Jackpot encerrado</span>
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewSeason(season.id, season.isActive);
                        }}
                      >
                        Ver detalhes
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Nenhuma temporada encontrada</p>
          <Button 
            onClick={() => navigate("/season")}
            className="bg-poker-gold hover:bg-poker-gold/80 text-black"
          >
            Criar Primeira Temporada
          </Button>
        </div>
      )}
    </div>
  );
}
