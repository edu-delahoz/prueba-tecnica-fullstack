import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  ready: boolean;
}

const THEME_STORAGE_KEY = 'finance-manager-theme';

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  ready: false,
});

const isStoredTheme = (value: string | null): value is Theme =>
  value === 'light' || value === 'dark';

const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const applyThemeClass = (theme: Theme) => {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [ready, setReady] = useState(false);

  const persistTheme = useCallback((nextTheme: Theme) => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }, []);

  const handleSetTheme = useCallback(
    (nextTheme: Theme, options?: { persist?: boolean }) => {
      setTheme(nextTheme);
      applyThemeClass(nextTheme);
      if (options?.persist === false) {
        return;
      }
      persistTheme(nextTheme);
    },
    [persistTheme]
  );

  const toggleTheme = useCallback(() => {
    setTheme((previous) => {
      const next = previous === 'dark' ? 'light' : 'dark';
      applyThemeClass(next);
      persistTheme(next);
      return next;
    });
  }, [persistTheme]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isStoredTheme(stored)) {
      handleSetTheme(stored, { persist: false });
    } else {
      const systemTheme = getSystemTheme();
      handleSetTheme(systemTheme, { persist: false });
    }
    setReady(true);
  }, [handleSetTheme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (nextTheme: Theme) => handleSetTheme(nextTheme),
      toggleTheme,
      ready,
    }),
    [theme, handleSetTheme, toggleTheme, ready]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
