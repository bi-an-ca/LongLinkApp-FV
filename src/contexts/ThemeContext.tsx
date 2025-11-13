import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ThemeColors {
  accent: string;
  background: string;
  blush: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  updateTheme: (colors: Partial<ThemeColors>) => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [colors, setColors] = useState<ThemeColors>({
    accent: '#F7838D',
    background: '#FFECF2',
    blush: '#FAC2C6',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      const profileWithTheme = profile as any;
      const themeColors = {
        accent: profileWithTheme.theme_accent_color || '#F7838D',
        background: profileWithTheme.theme_background_color || '#FFECF2',
        blush: profileWithTheme.theme_blush_color || '#FAC2C6',
      };
      setColors(themeColors);
      applyTheme(themeColors);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [profile]);

  const applyTheme = (themeColors: ThemeColors) => {
    document.documentElement.style.setProperty('--color-accent', themeColors.accent);
    document.documentElement.style.setProperty('--color-background', themeColors.background);
    document.documentElement.style.setProperty('--color-blush', themeColors.blush);
  };

  const updateTheme = async (newColors: Partial<ThemeColors>) => {
    const updatedColors = { ...colors, ...newColors };
    setColors(updatedColors);
    applyTheme(updatedColors);
    
    if (profile) {
      const { error } = await supabase
        .from('profiles')
        .update({
          theme_accent_color: updatedColors.accent,
          theme_background_color: updatedColors.background,
          theme_blush_color: updatedColors.blush,
        })
        .eq('id', profile.id);

      if (error) {
        console.error('Error updating theme:', error);
        toast.error('Failed to save theme');
      } else {
        toast.success('Theme saved!');
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ colors, updateTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

