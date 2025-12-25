import { useEffect, useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface AutosaveOptions<T> {
  key: string;
  data: T;
  debounceMs?: number;
  onRestore?: (data: T) => void;
}

export function useAutosave<T>({ key, data, debounceMs = 2000, onRestore }: AutosaveOptions<T>) {
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  // Sauvegarder les données
  const save = useCallback(() => {
    try {
      const saveData = {
        data,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(saveData));
      setLastSaved(new Date());
      setHasDraft(true);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du brouillon:", error);
    }
  }, [key, data]);

  // Sauvegarde avec debounce
  useEffect(() => {
    // Ignorer le premier rendu pour éviter de sauvegarder les données initiales
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      save();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, save, debounceMs]);

  // Vérifier s'il y a un brouillon au chargement
  const checkForDraft = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const { data: savedData } = JSON.parse(saved);
        setHasDraft(true);
        return savedData;
      }
    } catch (error) {
      console.error("Erreur lors de la lecture du brouillon:", error);
    }
    return null;
  }, [key]);

  // Restaurer le brouillon
  const restoreDraft = useCallback(() => {
    const savedData = checkForDraft();
    if (savedData && onRestore) {
      onRestore(savedData);
      toast.success("Brouillon restauré");
    }
  }, [checkForDraft, onRestore]);

  // Supprimer le brouillon
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setHasDraft(false);
      setLastSaved(null);
    } catch (error) {
      console.error("Erreur lors de la suppression du brouillon:", error);
    }
  }, [key]);

  // Vérifier au montage s'il y a un brouillon
  useEffect(() => {
    const draft = checkForDraft();
    if (draft) {
      setHasDraft(true);
    }
  }, [checkForDraft]);

  return {
    hasDraft,
    lastSaved,
    save,
    restoreDraft,
    clearDraft,
    checkForDraft,
  };
}
