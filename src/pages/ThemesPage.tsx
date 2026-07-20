import { Check, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme, AppTheme, THEME_META } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const themes: AppTheme[] = ['classic', 'modern', 'neon'];

// Inline preview tokens per theme (so preview renders independent of active theme)
const previewStyles: Record<AppTheme, {
  bg: string;
  card: string;
  border: string;
  primary: string;
  primaryText: string;
  title: string;
  body: string;
  cardShadow: string;
  radius: string;
  accent: string;
}> = {
  classic: {
    bg: 'linear-gradient(135deg, hsl(240 17% 9%), hsl(160 40% 8%))',
    card: 'hsl(160 90% 8%)',
    border: '1px solid hsl(214 20% 25% / 0.4)',
    primary: 'linear-gradient(135deg, hsl(45 70% 60%), hsl(43 74% 49%))',
    primaryText: 'hsl(210 40% 98%)',
    title: 'hsl(45 70% 60%)',
    body: 'hsl(0 0% 90%)',
    cardShadow: '0 4px 12px rgba(0,0,0,0.4)',
    radius: '0.75rem',
    accent: 'hsl(45 70% 60%)',
  },
  modern: {
    bg: 'linear-gradient(135deg, #0b0b0f, #14141c)',
    card: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.10)',
    primary: 'linear-gradient(135deg, #a5b4fc, #67e8f9)',
    primaryText: '#0b0b0f',
    title: '#f5f5f7',
    body: 'rgba(245,245,247,0.75)',
    cardShadow: '0 20px 40px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
    radius: '1.25rem',
    accent: '#67e8f9',
  },
  neon: {
    bg: 'linear-gradient(135deg, #0a0014, #1a0033)',
    card: 'linear-gradient(180deg, #1e0838, #12061f)',
    border: '1px solid rgba(217,70,239,0.35)',
    primary: 'linear-gradient(135deg, #d946ef, #7c3aed)',
    primaryText: '#fff8e7',
    title: '#f5d67a',
    body: '#e9d5ff',
    cardShadow: '0 0 0 1px rgba(217,70,239,0.2), 0 8px 24px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 0 rgba(0,0,0,0.4)',
    radius: '0.9rem',
    accent: '#d946ef',
  },
};

function ThemePreview({ theme }: { theme: AppTheme }) {
  const s = previewStyles[theme];
  return (
    <div
      className="rounded-xl p-4 h-48 flex flex-col justify-between overflow-hidden"
      style={{ background: s.bg }}
    >
      <div
        className="p-3 flex-1 flex flex-col gap-2"
        style={{
          background: s.card,
          border: s.border,
          borderRadius: s.radius,
          boxShadow: s.cardShadow,
          backdropFilter: theme === 'modern' ? 'blur(20px)' : undefined,
        }}
      >
        <div className="flex items-center justify-between">
          <span style={{ color: s.title, fontWeight: 600, fontSize: 14 }}>
            APA Poker
          </span>
          <span
            style={{
              background: s.accent,
              width: 8,
              height: 8,
              borderRadius: '50%',
              boxShadow: theme === 'neon' ? `0 0 8px ${s.accent}` : undefined,
            }}
          />
        </div>
        <div style={{ color: s.body, fontSize: 11, opacity: 0.85 }}>
          Ranking, partidas e caixinha do clube
        </div>
        <div className="mt-auto">
          <div
            style={{
              background: s.primary,
              color: s.primaryText,
              padding: '6px 12px',
              borderRadius: '0.5rem',
              fontSize: 12,
              fontWeight: 600,
              display: 'inline-block',
              boxShadow: theme === 'neon' ? `0 0 12px ${s.accent}80` : '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            Iniciar partida
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThemesPage() {
  const { theme: active, setTheme } = useTheme();

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="flex items-center gap-3 mb-2">
        <Palette className="h-6 w-6 text-poker-gold" />
        <h1 className="text-2xl md:text-3xl font-bold text-poker-gold">Temas</h1>
      </div>
      <p className="text-muted-foreground mb-8 text-sm md:text-base">
        Escolha a aparência do app. A mudança é apenas visual e vale para todas as telas.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {themes.map((t) => {
          const meta = THEME_META[t];
          const isActive = active === t;
          return (
            <div
              key={t}
              className={cn(
                'surface-card p-5 flex flex-col gap-4 transition-all',
                isActive && 'ring-2 ring-poker-gold'
              )}
            >
              <ThemePreview theme={t} />
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">{meta.label}</h2>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 text-xs bg-poker-gold/20 text-poker-gold px-2 py-1 rounded-full">
                      <Check className="h-3 w-3" /> Atual
                    </span>
                  )}
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {meta.tagline}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{meta.description}</p>
              </div>
              <Button
                onClick={() => setTheme(t)}
                disabled={isActive}
                variant={isActive ? 'secondary' : 'default'}
                className="w-full"
              >
                {isActive ? 'Tema aplicado' : 'Aplicar tema'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
