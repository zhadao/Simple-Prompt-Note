import { useState, useEffect, useCallback } from 'react';
import { getSettings, saveSettings } from '../utils/storage';

type Theme = 'system' | 'light' | 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 应用主题到 DOM
  const applyTheme = useCallback((currentTheme: Theme) => {
    const root = window.document.documentElement;
    
    let shouldBeDark = false;
    
    if (currentTheme === 'dark') {
      shouldBeDark = true;
    } else if (currentTheme === 'system') {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    setIsDark(shouldBeDark);
    
    if (shouldBeDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // 初始加载主题
  useEffect(() => {
    const loadTheme = async () => {
      const settings = await getSettings();
      setThemeState(settings.theme);
      applyTheme(settings.theme);
      setIsInitialized(true);
    };
    loadTheme();
  }, [applyTheme]);

  // 主题变化时应用
  useEffect(() => {
    if (isInitialized) {
      applyTheme(theme);
    }
  }, [theme, isInitialized, applyTheme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    await saveSettings({ theme: newTheme });
  };

  // 监听系统主题变化
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        const root = window.document.documentElement;
        setIsDark(e.matches);
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  return { theme, setTheme, isDark, isInitialized };
}
