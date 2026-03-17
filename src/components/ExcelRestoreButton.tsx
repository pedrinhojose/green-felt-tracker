import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ExcelRestoreButton() {
  const [isImporting, setIsImporting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      const data = await selectedFile.arrayBuffer();
      const wb = XLSX.read(data);
      setFile(selectedFile);
      setSheetNames(wb.SheetNames);
      setShowConfirm(true);
    } catch (error: any) {
      toast({
        title: "Erro ao ler arquivo",
        description: error.message || "Arquivo inválido",
        variant: "destructive",
      });
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImport = async () => {
    if (!file) return;
    setShowConfirm(false);
    setIsImporting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado");

      const userId = session.user.id;
      const orgId = localStorage.getItem("currentOrganizationId");
      if (!orgId) throw new Error("Nenhuma organização selecionada");

      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      let totalRows = 0;

      // Helper to read sheet
      const readSheet = (name: string): any[] => {
        const ws = wb.Sheets[name];
        if (!ws) return [];
        return XLSX.utils.sheet_to_json(ws);
      };

      // 1. Import players
      const playersData = readSheet("Jogadores");
      if (playersData.length) {
        for (const p of playersData) {
          await supabase.from("players").upsert({
            id: p.id,
            name: p.nome,
            city: p.cidade || null,
            phone: p.telefone || null,
            birth_date: p.data_nascimento || null,
            photo_url: p.foto_url || null,
            is_active: p.ativo === true || p.ativo === "true",
            user_id: p.user_id || userId,
            organization_id: p.organization_id || orgId,
            created_at: p.criado_em || new Date().toISOString(),
          }, { onConflict: "id" });
        }
        totalRows += playersData.length;
      }

      // 2. Import seasons
      const seasonsData = readSheet("Temporadas");
      if (seasonsData.length) {
        for (const s of seasonsData) {
          const parseJson = (val: any) => {
            if (!val) return [];
            if (typeof val === "string") {
              try { return JSON.parse(val); } catch { return []; }
            }
            return val;
          };

          await supabase.from("seasons").upsert({
            id: s.id,
            name: s.nome,
            start_date: s.data_inicio,
            end_date: s.data_fim || null,
            is_active: s.ativo === true || s.ativo === "true",
            game_frequency: s.frequencia || "weekly",
            games_per_period: s.jogos_por_periodo || 1,
            jackpot: s.jackpot || 0,
            caixinha_balance: s.saldo_caixinha || 0,
            house_rules: s.regras || "",
            score_schema: parseJson(s.score_schema),
            weekly_prize_schema: parseJson(s.weekly_prize_schema),
            season_prize_schema: parseJson(s.season_prize_schema),
            financial_params: parseJson(s.financial_params),
            blind_structure: parseJson(s.blind_structure),
            host_schedule: parseJson(s.host_schedule),
            user_id: s.user_id || userId,
            organization_id: s.organization_id || orgId,
            created_at: s.criado_em || new Date().toISOString(),
          }, { onConflict: "id" });
        }
        totalRows += seasonsData.length;
      }

      // 3. Import games (re-group flattened rows)
      const gamesData = readSheet("Partidas");
      if (gamesData.length) {
        const gamesMap = new Map<string, { game: any; players: any[] }>();

        for (const row of gamesData) {
          const gameId = row.game_id;
          if (!gamesMap.has(gameId)) {
            gamesMap.set(gameId, {
              game: row,
              players: [],
            });
          }
          if (row.jogador_id) {
            gamesMap.get(gameId)!.players.push({
              id: row.jogador_id,
              playerId: row.jogador_id,
              position: row.jogador_posicao === "" ? null : Number(row.jogador_posicao),
              buyIn: row.buy_in === true || row.buy_in === "true",
              rebuys: Number(row.rebuys) || 0,
              addons: Number(row.addons) || 0,
              prize: Number(row.premio) || 0,
              points: Number(row.pontos) || 0,
              balance: Number(row.saldo) || 0,
              isEliminated: row.eliminado === true || row.eliminado === "true",
              joinedDinner: row.jantar === true || row.jantar === "true",
              participatesInClubFund: row.fundo_clube === true || row.fundo_clube === "true",
              clubFundContribution: Number(row.contrib_fundo) || 0,
            });
          }
        }

        for (const [gameId, { game, players }] of gamesMap) {
          await supabase.from("games").upsert({
            id: gameId,
            number: Number(game.numero),
            season_id: game.season_id,
            date: game.data,
            total_prize_pool: Number(game.premio_total) || 0,
            dinner_cost: game.custo_jantar ? Number(game.custo_jantar) : null,
            is_finished: game.finalizada === true || game.finalizada === "true",
            players: players,
            user_id: game.user_id || userId,
            organization_id: game.organization_id || orgId,
            created_at: game.criado_em || new Date().toISOString(),
          }, { onConflict: "id" });
        }
        totalRows += gamesMap.size;
      }

      // 4. Import rankings
      const rankingsData = readSheet("Rankings");
      if (rankingsData.length) {
        for (const r of rankingsData) {
          await supabase.from("rankings").upsert({
            id: r.id,
            player_id: r.jogador_id,
            player_name: r.jogador_nome,
            season_id: r.season_id,
            total_points: Number(r.pontos_totais) || 0,
            games_played: Number(r.jogos) || 0,
            best_position: Number(r.melhor_posicao) || 0,
            photo_url: r.foto_url || null,
            user_id: r.user_id || userId,
            organization_id: r.organization_id || orgId,
          }, { onConflict: "id" });
        }
        totalRows += rankingsData.length;
      }

      // 5. Import caixinha transactions
      const caixinhaData = readSheet("Caixinha");
      if (caixinhaData.length) {
        for (const t of caixinhaData) {
          await supabase.from("caixinha_transactions").upsert({
            id: t.id,
            type: t.tipo || "withdrawal",
            description: t.descricao,
            amount: Number(t.valor),
            season_id: t.season_id,
            withdrawal_date: t.data || new Date().toISOString(),
            user_id: t.user_id || userId,
            created_by: t.user_id || userId,
            organization_id: t.organization_id || orgId,
            created_at: t.criado_em || new Date().toISOString(),
          }, { onConflict: "id" });
        }
        totalRows += caixinhaData.length;
      }

      // 6. Import eliminations
      const elimData = readSheet("Eliminacoes");
      if (elimData.length) {
        for (const e of elimData) {
          await supabase.from("eliminations").upsert({
            id: e.id,
            game_id: e.game_id,
            eliminated_player_id: e.eliminado_id,
            eliminator_player_id: e.eliminador_id || null,
            position: Number(e.posicao),
            elimination_time: e.horario || new Date().toISOString(),
            user_id: e.user_id || userId,
            organization_id: e.organization_id || orgId,
            created_at: e.criado_em || new Date().toISOString(),
          }, { onConflict: "id" });
        }
        totalRows += elimData.length;
      }

      // 7. Import jackpot distributions
      const jackpotData = readSheet("Jackpot_Distribuicoes");
      if (jackpotData.length) {
        for (const j of jackpotData) {
          await supabase.from("season_jackpot_distributions").upsert({
            id: j.id,
            season_id: j.season_id,
            player_id: j.jogador_id,
            player_name: j.jogador_nome,
            position: Number(j.posicao),
            percentage: Number(j.percentual),
            prize_amount: Number(j.premio),
            total_jackpot: Number(j.jackpot_total),
            distributed_at: j.distribuido_em || new Date().toISOString(),
            user_id: j.user_id || userId,
            organization_id: j.organization_id || orgId,
            created_at: j.criado_em || new Date().toISOString(),
          }, { onConflict: "id" });
        }
        totalRows += jackpotData.length;
      }

      toast({
        title: "✅ Importação concluída!",
        description: `${totalRows} registros importados com sucesso.`,
      });

      // Reload after a short delay
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      console.error("Erro ao importar Excel:", error);
      toast({
        title: "Erro na importação",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setFile(null);
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".xlsx,.xls"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        variant="outline"
        className="w-full border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/10"
      >
        {isImporting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileUp className="mr-2 h-4 w-4" />
        )}
        {isImporting ? "Importando..." : "Importar Excel"}
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Importação</AlertDialogTitle>
            <AlertDialogDescription>
              O arquivo contém as seguintes abas:
              <br />
              <strong>{sheetNames.join(", ")}</strong>
              <br /><br />
              Os dados existentes com os mesmos IDs serão sobrescritos. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport}>
              Sim, importar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
