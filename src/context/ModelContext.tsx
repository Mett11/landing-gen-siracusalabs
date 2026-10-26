/**
 * Gemini LLM Model Selection Context
 * Manages available models dynamically retrieved from Google API and user preference.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GeminiModelInfo } from '../types/index.js';
import { api } from '../services/api.js';

interface ModelContextType {
  models: GeminiModelInfo[];
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  activeModel: GeminiModelInfo | undefined;
  isLoading: boolean;
  refreshModels: () => Promise<void>;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'siracusa_selected_gemini_model';

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [models, setModels] = useState<GeminiModelInfo[]>([]);
  const [selectedModel, setSelectedModelState] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY) || 'gemini-2.5-flash';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const list = await api.getAvailableModels();
      setModels(list);
      // If current selectedModel is not in the list, keep it or pick the first recommended
      if (list.length > 0) {
        const found = list.find((m) => m.id === selectedModel);
        if (!found) {
          const recommended = list.find((m) => m.isRecommended) || list[0];
          setSelectedModelState(recommended.id);
          localStorage.setItem(LOCAL_STORAGE_KEY, recommended.id);
        }
      }
    } catch (err) {
      console.error('Failed to load Google models:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const setSelectedModel = (id: string) => {
    setSelectedModelState(id);
    localStorage.setItem(LOCAL_STORAGE_KEY, id);
  };

  const activeModel: GeminiModelInfo = models.find((m) => m.id === selectedModel) || {
    id: selectedModel,
    name: `models/${selectedModel}`,
    displayName: selectedModel === 'gemini-2.5-pro' ? 'Gemini 2.5 Pro' : 'Gemini 2.5 Flash',
    description: 'Modello Google Gemini selezionato per la generazione CRO',
    isRecommended: true,
    inputTokenLimit: 1048576,
    outputTokenLimit: 8192,
    category: selectedModel === 'gemini-2.5-pro' ? 'pro' : 'fast',
  };

  return (
    <ModelContext.Provider
      value={{
        models,
        selectedModel,
        setSelectedModel,
        activeModel,
        isLoading,
        refreshModels: fetchModels,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = (): ModelContextType => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
};
