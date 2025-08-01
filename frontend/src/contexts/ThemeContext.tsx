
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  updateColors: (newColors: Partial<ThemeColors>) => void;
  resetToDefault: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  applyPreset: (preset: ThemeColors) => void;
}

const defaultColors: ThemeColors = {
  primary: '#2563eb', // blue-600
  secondary: '#64748b', // slate-500
  accent: '#06b6d4', // cyan-500
  background: '#ffffff', // white
  foreground: '#0f172a' // slate-900
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Carregar tema salvo do localStorage
    const savedColors = localStorage.getItem('clinicpro-theme');
    const savedDarkMode = localStorage.getItem('clinicpro-dark-mode');
    
    if (savedColors) {
      setColors(JSON.parse(savedColors));
    }
    
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    // Aplicar tema claro/escuro
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      setColors(prev => ({
        ...prev,
        foreground: '#e6f6ff', // claro no modo escuro
      }));
    } else {
      document.documentElement.classList.remove('dark');
      setColors(prev => ({
        ...prev,
        foreground: '#0f172a', // escuro no modo claro
      }));
    }
    
    localStorage.setItem('clinicpro-dark-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    // Aplicar cores ao CSS
    const root = document.documentElement;
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--accent-color', colors.accent);
    root.style.setProperty('--background-color', colors.background);
    root.style.setProperty('--foreground-color', colors.foreground);
    
    // Salvar no localStorage
    localStorage.setItem('clinicpro-theme', JSON.stringify(colors));
  }, [colors]);

  const updateColors = (newColors: Partial<ThemeColors>) => {
    setColors(prev => ({ ...prev, ...newColors }));
  };

  const resetToDefault = () => {
    setColors(defaultColors);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const applyPreset = (preset: ThemeColors) => {
    setColors(preset);
  };

  return (
    <ThemeContext.Provider value={{ 
      colors, 
      updateColors, 
      resetToDefault, 
      isDarkMode, 
      toggleDarkMode,
      applyPreset 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
