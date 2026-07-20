import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppTheme = 'classic' | 'modern' | 'neon';

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'app-theme';

function applyTheme(theme: AppTheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window === 'undefined') return 'classic';
    const saved = localStorage.getItem(STORAGE_KEY) as AppTheme | null;
    return saved && ['classic', 'modern', 'neon'].includes(saved) ? saved : 'classic';
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (next: AppTheme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    applyTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export const THEME_META: Record<AppTheme, { label: string; description: string; tagline: string }> = {
  classic: {
    label: 'Classic',
    description: 'Feltro verde e dourado APA. O visual original do clube.',
    tagline: 'Mesa de poker tradicional',
  },
  modern: {
    label: 'Modern',
    description: 'Vidro fosco, sombras suaves e cantos generosos. Estética Apple.',
    tagline: 'Minimalismo premium',
  },
  neon: {
    label: 'Neon Vegas',
    description: 'Roxo elétrico e magenta com relevo 3D tipo ficha de cassino.',
    tagline: 'Cassino noturno em Las Vegas',
  },
};
