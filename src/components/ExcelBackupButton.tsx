import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

export default function ExcelBackupButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const orgId = localStorage.getItem("currentOrganizationId");
      if (!orgId) {
        toast({ title: "Erro", description: "Nenhuma organização selecionada", variant: "destructive" });
        return;
      }

      // Fetch all data in parallel
      const [
        { data: players },
        { data: seasons },
        { data: games },
        { data: rankings },
        { data: caixinha },
        { data: clubFund },
        { data: eliminations },
        { data: jackpotDist },
      ] = await Promise.all([
        supabase.from("players").select("*").eq("organization_id", orgId),
        supabase.from("seasons").select("*").eq("organization_id", orgId),
        supabase.from("games").select("*").eq("organization_id", orgId),
        supabase.from("rankings").select("*").eq("organization_id", orgId),
        supabase.from("caixinha_transactions").select("*").eq("organization_id", orgId),
        supabase.from("club_fund_transactions").select("*").eq("organization_id", orgId),
        supabase.from("eliminations").select("*").eq("organization_id", orgId),
        supabase.from("season_jackpot_distributions").select("*").eq("organization_id", orgId),
      ]);

      const wb = XLSX.utils.book_new();

      // Players sheet
      if (players?.length) {
        const ws = XLSX.utils.json_to_sheet(
          players.map((p) => ({
            id: p.id,
            nome: p.name,
            cidade: p.city,
            telefone: p.phone,
            data_nascimento: p.birth_date,
            foto_url: p.photo_url,
            ativo: p.is_active,
            user_id: p.user_id,
            organization_id: p.organization_id,
            criado_em: p.created_at,
          }))
        );
        XLSX.utils.book_append_sheet(wb, ws, "Jogadores");
      }

      // Seasons sheet
      if (seasons?.length) {
        const ws = XLSX.utils.json_to_sheet(
          seasons.map((s) => ({
            id: s.id,
            nome: s.name,
            data_inicio: s.start_date,
            data_fim: s.end_date,
            ativo: s.is_active,
            frequencia: s.game_frequency,
            jogos_por_periodo: s.games_per_period,
            jackpot: s.jackpot,
            saldo_caixinha: s.caixinha_balance,
            regras: s.house_rules,
            score_schema: JSON.stringify(s.score_schema),
            weekly_prize_schema: JSON.stringify(s.weekly_prize_schema),
            season_prize_schema: JSON.stringify(s.season_prize_schema),
            financial_params: JSON.stringify(s.financial_params),
            blind_structure: JSON.stringify(s.blind_structure),
            host_schedule: JSON.stringify(s.host_schedule),
            user_id: s.user_id,
            organization_id: s.organization_id,
            criado_em: s.created_at,
          }))
        );
        XLSX.utils.book_append_sheet(wb, ws, "Temporadas");
      }

      // Games sheet - flatten players JSONB
      if (games?.length) {
        const gameRows: any[] = [];
        for (const g of games) {
          const gamePlayers = Array.isArray(g.players) ? g.players : [];
          if (gamePlayers.length === 0) {
            gameRows.push({
              game_id: g.id,
              numero: g.number,
              season_id: g.season_id,
              data: g.date,
              premio_total: g.total_prize_pool,
              custo_jantar: g.dinner_cost,
              finalizada: g.is_finished,
              jogador_id: "",
              jogador_posicao: "",
              buy_in: "",
              rebuys: "",
              addons: "",
              premio: "",
              pontos: "",
              saldo: "",
              eliminado: "",
              jantar: "",
              fundo_clube: "",
              contrib_fundo: "",
              user_id: g.user_id,
              organization_id: g.organization_id,
              criado_em: g.created_at,
            });
          } else {
            for (const p of gamePlayers as any[]) {
              gameRows.push({
                game_id: g.id,
                numero: g.number,
                season_id: g.season_id,
                data: g.date,
                premio_total: g.total_prize_pool,
                custo_jantar: g.dinner_cost,
                finalizada: g.is_finished,
                jogador_id: p.playerId || p.id,
                jogador_posicao: p.position,
                buy_in: p.buyIn,
                rebuys: p.rebuys,
                addons: p.addons,
                premio: p.prize,
                pontos: p.points,
                saldo: p.balance,
                eliminado: p.isEliminated,
                jantar: p.joinedDinner,
                fundo_clube: p.participatesInClubFund,
                contrib_fundo: p.clubFundContribution,
                user_id: g.user_id,
                organization_id: g.organization_id,
                criado_em: g.created_at,
              });
            }
          }
        }
        const ws = XLSX.utils.json_to_sheet(gameRows);
        XLSX.utils.book_append_sheet(wb, ws, "Partidas");
      }

      // Rankings sheet
      if (rankings?.length) {
        const ws = XLSX.utils.json_to_sheet(
          rankings.map((r) => ({
            id: r.id,
            jogador_id: r.player_id,
            jogador_nome: r.player_name,
            season_id: r.season_id,
            pontos_totais: r.total_points,
            jogos: r.games_played,
            melhor_posicao: r.best_position,
            foto_url: r.photo_url,
            user_id: r.user_id,
            organization_id: r.organization_id,
          }))
        );
        XLSX.utils.book_append_sheet(wb, ws, "Rankings");
      }

      // Caixinha transactions
      const allCaixinha = [...(caixinha || []), ...(clubFund || [])];
      if (allCaixinha.length) {
        const ws = XLSX.utils.json_to_sheet(
          allCaixinha.map((t) => ({
            id: t.id,
            tipo: t.type,
            descricao: t.description,
            valor: t.amount,
            season_id: t.season_id,
            data: (t as any).withdrawal_date || (t as any).date || t.created_at,
            user_id: t.user_id,
            organization_id: t.organization_id,
            criado_em: t.created_at,
          }))
        );
        XLSX.utils.book_append_sheet(wb, ws, "Caixinha");
      }

      // Eliminations
      if (eliminations?.length) {
        const ws = XLSX.utils.json_to_sheet(
          eliminations.map((e) => ({
            id: e.id,
            game_id: e.game_id,
            eliminado_id: e.eliminated_player_id,
            eliminador_id: e.eliminator_player_id,
            posicao: e.position,
            horario: e.elimination_time,
            user_id: e.user_id,
            organization_id: e.organization_id,
            criado_em: e.created_at,
          }))
        );
        XLSX.utils.book_append_sheet(wb, ws, "Eliminacoes");
      }

      // Jackpot distributions
      if (jackpotDist?.length) {
        const ws = XLSX.utils.json_to_sheet(
          jackpotDist.map((j) => ({
            id: j.id,
            season_id: j.season_id,
            jogador_id: j.player_id,
            jogador_nome: j.player_name,
            posicao: j.position,
            percentual: j.percentage,
            premio: j.prize_amount,
            jackpot_total: j.total_jackpot,
            distribuido_em: j.distributed_at,
            user_id: j.user_id,
            organization_id: j.organization_id,
            criado_em: j.created_at,
          }))
        );
        XLSX.utils.book_append_sheet(wb, ws, "Jackpot_Distribuicoes");
      }

      // Generate and download
      const today = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `apapoker-backup-completo-${today}.xlsx`);

      toast({
        title: "✅ Backup Excel gerado!",
        description: `Arquivo exportado com sucesso.`,
      });
    } catch (error: any) {
      console.error("Erro ao exportar Excel:", error);
      toast({
        title: "Erro na exportação",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="mr-2 h-4 w-4" />
      )}
      {isExporting ? "Exportando..." : "Backup Excel"}
    </Button>
  );
}
