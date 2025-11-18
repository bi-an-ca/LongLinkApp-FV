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
  darkMode: boolean;
  toggleDarkMode: () => void;
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
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

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

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const applyTheme = (themeColors: ThemeColors) => {
    document.documentElement.style.setProperty('--color-accent', themeColors.accent);
    document.documentElement.style.setProperty('--color-background', themeColors.background);
    document.documentElement.style.setProperty('--color-blush', themeColors.blush);
  };

  const updateTheme = async (newColors: Partial<ThemeColors>) => {
    if (!profile) {
      console.error('Cannot update theme: profile is null');
      toast.error('Please sign in to save theme changes');
      return;
    }

    try {
      const updatedColors = { ...colors, ...newColors };
      
      // Validate color format (should already be normalized, but double-check)
      const colorRegex = /^#([A-Fa-f0-9]{6})$/;
      if (!colorRegex.test(updatedColors.accent) || !colorRegex.test(updatedColors.background) || !colorRegex.test(updatedColors.blush)) {
        toast.error('Invalid color format. Please use hex colors (e.g., #F7838D)');
        return;
      }

      // Apply theme optimistically
      setColors(updatedColors);
      applyTheme(updatedColors);
      
      // Save to database
      const { error, data } = await supabase
        .from('profiles')
        .update({
          theme_accent_color: updatedColors.accent,
          theme_background_color: updatedColors.background,
          theme_blush_color: updatedColors.blush,
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating theme:', error);
        // Revert optimistic update on error
        const originalColors = {
          accent: profile.theme_accent_color || '#F7838D',
          background: profile.theme_background_color || '#FFECF2',
          blush: profile.theme_blush_color || '#FAC2C6',
        };
        setColors(originalColors);
        applyTheme(originalColors);
        toast.error('Failed to save theme changes. Please try again.');
        throw error;
      } else {
        toast.success('Theme saved successfully!');
      }
    } catch (error: any) {
      // If error was already handled above (database error), it will have been thrown
      // This catch is for any other unexpected errors
      if (error && error.message && !error.message.includes('Failed to save theme')) {
        console.error('Unexpected error in updateTheme:', error);
        toast.error('Failed to save theme changes');
      }
      // Re-throw to allow caller to handle if needed
      throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{ colors, updateTheme, loading, darkMode, toggleDarkMode }}>
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

