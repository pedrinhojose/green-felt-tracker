import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { announceRebuy, isRebuyAnnounceMuted } from "@/lib/audio/announceRebuy";

// Ouve a partida em tempo real e toca "RE BUY" quando o total de rebuys sobe.
// Usado na tela do telão/timer, que não carrega a partida completa.
export function useRebuyAnnouncer(gameId?: string) {
  const totalRef = useRef<number | null>(null);
  useEffect(() => {
    if (!gameId || gameId === "default") return;
    const sum = (players: any) =>
      Array.isArray(players) ? players.reduce((s: number, p: any) => s + (Number(p?.rebuys) || 0), 0) : 0;
    supabase.from("games").select("players").eq("id", gameId).maybeSingle().then(({ data }) => {
      if (data) totalRef.current = sum((data as any).players);
    });
    const channel = supabase
      .channel(`timer-rebuy-${gameId}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` }, (payload) => {
        const total = sum((payload.new as any)?.players);
        if (totalRef.current !== null && total > totalRef.current && !isRebuyAnnounceMuted()) announceRebuy();
        totalRef.current = total;
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [gameId]);
}
