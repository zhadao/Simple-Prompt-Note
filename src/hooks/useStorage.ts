import { useState, useEffect, useCallback } from 'react';
import { 
  getSettings, 
  saveSettings, 
  getLibrary, 
  saveLibrary,
  type Settings, 
  type LibraryCategory 
} from '../utils/storage';

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await getSettings();
    setSettingsState(data);
    setLoading(false);
  };

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    await saveSettings(newSettings);
    setSettingsState(prev => prev ? { ...prev, ...newSettings } : null);
  }, []);

  return { settings, loading, updateSettings, reload: loadSettings };
}

export function useLibrary() {
  const [library, setLibraryState] = useState<LibraryCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    setLoading(true);
    const data = await getLibrary();
    setLibraryState(data);
    setLoading(false);
  };

  const updateLibrary = useCallback(async (newLibrary: LibraryCategory[]) => {
    await saveLibrary(newLibrary);
    setLibraryState(newLibrary);
  }, []);

  const addItem = useCallback(async (categoryIndex: number, item: { label: string; content: string; preview?: string }) => {
    const newLibrary = [...library];
    if (newLibrary[categoryIndex]) {
      newLibrary[categoryIndex].items.push(item);
      await updateLibrary(newLibrary);
    }
  }, [library, updateLibrary]);

  const removeItem = useCallback(async (categoryIndex: number, itemIndex: number) => {
    const newLibrary = [...library];
    if (newLibrary[categoryIndex]) {
      newLibrary[categoryIndex].items.splice(itemIndex, 1);
      await updateLibrary(newLibrary);
    }
  }, [library, updateLibrary]);

  return { library, loading, updateLibrary, addItem, removeItem, reload: loadLibrary };
}
