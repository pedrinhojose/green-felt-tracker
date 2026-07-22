
ALTER TABLE public.game_player_settlements
  ADD COLUMN IF NOT EXISTS offset_amount numeric NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.settle_game_with_offsets(p_game_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_game RECORD;
  v_org_id uuid;
  v_new_date timestamptz;
  v_new_number int;
  v_player jsonb;
  v_player_id uuid;
  v_new_balance numeric;
  v_remaining numeric;
  v_old RECORD;
  v_old_abs numeric;
  v_new_abs numeric;
  v_offset_total numeric;
  v_compensations int := 0;
  v_status_new text;
  v_status_old text;
BEGIN
  SELECT id, organization_id, date, number, players, is_finished
  INTO v_game
  FROM public.games WHERE id = p_game_id;

  IF NOT FOUND OR NOT v_game.is_finished THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'game_not_finished');
  END IF;

  v_org_id := v_game.organization_id;
  v_new_date := v_game.date;
  v_new_number := v_game.number;

  IF v_new_date < '2026-07-20'::timestamptz THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'before_cutoff');
  END IF;

  FOR v_player IN SELECT * FROM jsonb_array_elements(v_game.players)
  LOOP
    v_player_id := NULLIF(v_player->>'playerId', '')::uuid;
    v_new_balance := COALESCE((v_player->>'balance')::numeric, 0);
    IF v_player_id IS NULL OR v_new_balance = 0 THEN CONTINUE; END IF;

    v_remaining := abs(v_new_balance);
    v_offset_total := 0;

    FOR v_old IN
      SELECT g.id AS game_id, g.number AS game_number, g.date AS game_date,
             (gp.value->>'balance')::numeric AS balance
      FROM public.games g
      CROSS JOIN LATERAL jsonb_array_elements(g.players) gp
      WHERE g.organization_id = v_org_id
        AND g.is_finished = true
        AND g.id <> p_game_id
        AND g.date < v_new_date
        AND g.date >= '2026-07-20'::timestamptz
        AND (gp.value->>'playerId')::uuid = v_player_id
        AND (gp.value->>'balance')::numeric <> 0
        AND sign((gp.value->>'balance')::numeric) = -sign(v_new_balance)
        AND NOT EXISTS (
          SELECT 1 FROM public.game_player_settlements s
          WHERE s.game_id = g.id AND s.player_id = v_player_id
            AND s.status IN ('pago', 'premiado_pago')
        )
      ORDER BY g.date ASC, g.number ASC
    LOOP
      EXIT WHEN v_remaining <= 0;
      v_old_abs := abs(v_old.balance);
      IF v_old_abs <= v_remaining THEN
        v_status_old := CASE WHEN v_old.balance < 0 THEN 'pago' ELSE 'premiado_pago' END;
        INSERT INTO public.game_player_settlements
          (organization_id, game_id, player_id, amount, status, payment_method, settled_at, notes)
        VALUES
          (v_org_id, v_old.game_id, v_player_id, v_old.balance, v_status_old,
           'compensacao_automatica', now(),
           'Compensado com partida #' || v_new_number)
        ON CONFLICT (game_id, player_id) DO UPDATE
          SET status = EXCLUDED.status,
              payment_method = EXCLUDED.payment_method,
              settled_at = EXCLUDED.settled_at,
              notes = EXCLUDED.notes,
              amount = EXCLUDED.amount;
        v_remaining := v_remaining - v_old_abs;
        v_offset_total := v_offset_total + v_old_abs;
        v_compensations := v_compensations + 1;
      ELSE
        EXIT;
      END IF;
    END LOOP;

    IF v_offset_total > 0 THEN
      v_new_abs := abs(v_new_balance);
      v_status_new := CASE WHEN v_new_balance < 0 THEN 'pendente' ELSE 'a_receber' END;
      IF v_offset_total >= v_new_abs THEN
        v_status_new := CASE WHEN v_new_balance < 0 THEN 'pago' ELSE 'premiado_pago' END;
      END IF;

      INSERT INTO public.game_player_settlements
        (organization_id, game_id, player_id, amount, status, payment_method, settled_at, notes, offset_amount)
      VALUES
        (v_org_id, p_game_id, v_player_id, v_new_balance, v_status_new,
         CASE WHEN v_offset_total >= v_new_abs THEN 'compensacao_automatica' ELSE NULL END,
         CASE WHEN v_offset_total >= v_new_abs THEN now() ELSE NULL END,
         'Compensação automática de saldo anterior',
         v_offset_total)
      ON CONFLICT (game_id, player_id) DO UPDATE
        SET offset_amount = EXCLUDED.offset_amount,
            status = CASE
              WHEN public.game_player_settlements.status IN ('pago','premiado_pago') THEN public.game_player_settlements.status
              ELSE EXCLUDED.status
            END,
            notes = EXCLUDED.notes,
            amount = EXCLUDED.amount;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'compensations', v_compensations);
END;
$$;

GRANT EXECUTE ON FUNCTION public.settle_game_with_offsets(uuid) TO authenticated;
