
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { announceRebuy, isRebuyAnnounceMuted } from "@/lib/audio/announceRebuy";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { usePoker } from "@/contexts/PokerContext";
import { Game } from "@/lib/db/models";
import { pokerDB } from "@/lib/db";

export function useGameLoader() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { games } = usePoker();
  
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load game data
  useEffect(() => {
    const loadGame = async () => {
      if (!gameId) return;
      
      try {
        console.log("useGameLoader: Carregando game:", gameId);
        setIsLoading(true);
        
        // First try to find the game in the games array from context
        let foundGame = games.find(g => g.id === gameId);
        console.log("useGameLoader: Game encontrado no contexto:", !!foundGame);
        
        // If not found in context, try to load directly from database
        if (!foundGame) {
          console.log("useGameLoader: Game não encontrado no contexto, buscando no banco...");
          foundGame = await pokerDB.getGame(gameId);
          console.log("useGameLoader: Game encontrado no banco:", !!foundGame);
        }
        
        if (foundGame) {
          setGame(foundGame);
        } else {
          console.error("useGameLoader: Game não encontrado");
          toast({
            title: "Erro",
            description: "Partida não encontrada.",
            variant: "destructive",
          });
          navigate("/games");
        }
      } catch (error) {
        console.error("useGameLoader: Error loading game:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da partida.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGame();
  }, [gameId, games, navigate, toast]);
  
  // Sincronização em tempo real (celular <-> desktop). Só atualiza os dados
  // da partida; o timer vive em outro contexto e não é tocado.
  const rebuyTotalRef = useRef<number | null>(null);
  useEffect(() => {
    if (game) {
      const total = game.players.reduce((s, p) => s + (p.rebuys || 0), 0);
      if (rebuyTotalRef.current !== null && total > rebuyTotalRef.current && !isRebuyAnnounceMuted()) announceRebuy();
      rebuyTotalRef.current = total;
    }
  }, [game]);

  useEffect(() => {
    if (!gameId) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const channel = supabase
      .channel(`game-live-${gameId}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        () => {
          if (timeout) clearTimeout(timeout);
          timeout = setTimeout(async () => {
            try {
              const fresh = await pokerDB.getGame(gameId);
              if (fresh) setGame(fresh);
            } catch (e) {
              console.error("useGameLoader realtime refresh error:", e);
            }
          }, 250);
        }
      )
      .subscribe();
    return () => {
      if (timeout) clearTimeout(timeout);
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  return {
    game,
    setGame,
    isLoading,
  };
}
