'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'appointment-booking-color-mode';

const ColorModeContext = createContext({
  mode: 'light',
  toggleColorMode: () => {},
  setColorMode: () => {},
});

export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        setMode(stored);
        return;
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setMode('dark');
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  const toggleColorMode = useCallback(() => {
    setMode((m) => (m === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({
      mode,
      toggleColorMode,
      setColorMode: setMode,
    }),
    [mode, toggleColorMode],
  );

  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  return useContext(ColorModeContext);
}
