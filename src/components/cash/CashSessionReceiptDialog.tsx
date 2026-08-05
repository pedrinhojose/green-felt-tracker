import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { formatCurrency } from '@/lib/utils/dateUtils';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface ReceiptPlayerRow {
  name: string;
  buyin: number;
  cashout: number;
}

interface CashSessionReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
  gameVariant: string;
  startedAt: string;
  endedAt: string | null;
  duration: string;
  totalBuyins: number;
  totalCashouts: number;
  rows: ReceiptPlayerRow[];
  notes?: string | null;
}

function formatDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CashSessionReceiptDialog({
  open,
  onOpenChange,
  tableName,
  gameVariant,
  startedAt,
  endedAt,
  duration,
  totalBuyins,
  totalCashouts,
  rows,
  notes,
}: CashSessionReceiptDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const rake = totalBuyins - totalCashouts;

  const buildText = () => {
    const lines: string[] = [];
    lines.push(`*CASH GAME — ${tableName}*`);
    lines.push(`${gameVariant} · ${duration}`);
    lines.push(`Início: ${formatDateTime(startedAt)}`);
    lines.push(`Fim: ${formatDateTime(endedAt)}`);
    lines.push('');
    lines.push(`Total de entradas: ${formatCurrency(totalBuyins)}`);
    lines.push(`Total de saídas: ${formatCurrency(totalCashouts)}`);
    lines.push(`Rake / Lucro do clube: ${formatCurrency(rake)}`);
    lines.push('');
    lines.push('*Fechamento por jogador*');
    rows.forEach((r) => {
      const result = r.cashout - r.buyin;
      const label = result >= 0 ? 'recebe' : 'paga';
      lines.push(
        `${r.name}: entrou ${formatCurrency(r.buyin)} | saiu ${formatCurrency(
          r.cashout
        )} → ${label} ${formatCurrency(Math.abs(result))}`
      );
    });
    if (notes) {
      lines.push('');
      lines.push(`Obs: ${notes}`);
    }
    return lines.join('\n');
  };

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `cupom-${tableName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({ title: 'Cupom gerado', description: 'A imagem foi baixada com sucesso.' });
    } catch (error) {
      console.error('CashSessionReceiptDialog: erro ao gerar imagem', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar a imagem do cupom.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(buildText())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cupom de fechamento</DialogTitle>
          <DialogDescription>
            Resumo financeiro da sessão. Baixe a imagem ou compartilhe no WhatsApp.
          </DialogDescription>
        </DialogHeader>

        {/* Cupom */}
        <div
          ref={receiptRef}
          className="rounded-lg border border-dashed bg-white p-5 text-[#111] font-mono text-[13px] leading-relaxed"
        >
          <div className="text-center border-b border-dashed pb-3 mb-3">
            <p className="text-base font-bold tracking-wide">APA POKER · CASH GAME</p>
            <p className="font-semibold">{tableName}</p>
            <p className="text-[11px] opacity-70">{gameVariant}</p>
          </div>

          <div className="space-y-1 text-[12px]">
            <div className="flex justify-between">
              <span>Início</span>
              <span>{formatDateTime(startedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Fim</span>
              <span>{formatDateTime(endedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Duração</span>
              <span>{duration}</span>
            </div>
            <div className="flex justify-between">
              <span>Jogadores</span>
              <span>{rows.length}</span>
            </div>
          </div>

          <div className="border-t border-dashed my-3 pt-3 space-y-1 text-[12px]">
            <div className="flex justify-between">
              <span>Total entradas (buy-ins/re-buys)</span>
              <span className="font-bold">{formatCurrency(totalBuyins)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total saídas (cash-outs)</span>
              <span className="font-bold">{formatCurrency(totalCashouts)}</span>
            </div>
            <div className="flex justify-between">
              <span>Rake / Lucro do clube</span>
              <span className="font-bold">{formatCurrency(rake)}</span>
            </div>
          </div>

          <div className="border-t border-dashed pt-3">
            <p className="font-bold mb-2 text-center">FECHAMENTO POR JOGADOR</p>
            <div className="space-y-2">
              {rows.map((r) => {
                const result = r.cashout - r.buyin;
                return (
                  <div key={r.name} className="border-b border-dotted pb-1">
                    <div className="flex justify-between font-semibold">
                      <span>{r.name}</span>
                      <span className={cn(result >= 0 ? 'text-[#0a7a3d]' : 'text-[#b31212]')}>
                        {result >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(result))}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] opacity-70">
                      <span>Entrou: {formatCurrency(r.buyin)}</span>
                      <span>Saiu: {formatCurrency(r.cashout)}</span>
                      <span>{result >= 0 ? 'A receber' : 'A pagar'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {notes && (
            <p className="mt-3 border-t border-dashed pt-2 text-[11px] italic">Obs: {notes}</p>
          )}

          <p className="mt-3 text-center text-[10px] opacity-60">
            Gerado por APA Poker · {formatDateTime(new Date().toISOString())}
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleDownload} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Gerando...' : 'Gerar imagem / Baixar cupom'}
          </Button>
          <Button onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar no WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
