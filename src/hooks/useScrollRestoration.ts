
import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollRestoration(key?: string) {
  const location = useLocation();
  const storageKey = key || `scroll-${location.pathname}`;

  const saveScrollPosition = useCallback(() => {
    const scrollY = window.scrollY;
    sessionStorage.setItem(storageKey, scrollY.toString());
  }, [storageKey]);

  const restoreScrollPosition = useCallback(() => {
    const savedPosition = sessionStorage.getItem(storageKey);
    if (savedPosition) {
      // Usar requestAnimationFrame para garantir que o DOM esteja renderizado
      requestAnimationFrame(() => {
        window.scrollTo({
          top: parseInt(savedPosition),
          behavior: 'instant'
        });
      });
    }
  }, [storageKey]);

  const clearScrollPosition = useCallback(() => {
    sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  // Salvar posição do scroll quando o componente é desmontado ou rota muda
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    // Salvar posição antes de navegar
    const handleScroll = () => {
      saveScrollPosition();
    };

    // Throttle do scroll para performance
    let scrollTimeout: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      saveScrollPosition();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', throttledHandleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [saveScrollPosition]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition
  };
}
