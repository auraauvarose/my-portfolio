'use client';

import { createContext, useContext, useEffect, useState, useCallback, useSyncExternalStore } from 'react';

const ThemeContext = createContext();

// Custom hook to handle localStorage safely
function useLocalStorage(key, initialValue) {
  // Get stored value
  const storedValue = useSyncExternalStore(
    () => () => {}, // subscribe function (not needed for localStorage)
    () => {
      if (typeof window === 'undefined') return initialValue;
      try {
        const item = window.localStorage.getItem(key);
        return item ? item : initialValue;
      } catch (error) {
        return initialValue;
      }
    },
    () => initialValue // server snapshot
  );

  const [value, setValue] = useState(storedValue);

  // Update localStorage when value changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, value]);

  return [value, setValue];
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useLocalStorage('theme', 'dark');
  const [themeColor, setThemeColor] = useLocalStorage('themeColor', '#d4eb00');
  const [bgTheme, setBgTheme] = useLocalStorage('bgTheme', 'default');
  const [bgAnimation, setBgAnimation] = useLocalStorage('bgAnimation', 'none');
  const [fontChoice, setFontChoice] = useLocalStorage('fontChoice', 'fraunces');
  const [mounted, setMounted] = useState(false);

  // Initialize mounted state
  useEffect(() => {
    const timeoutId = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    const darkMode = isDark === 'dark' || isDark === true;
    
    if (darkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => (prev === 'dark' || prev === true) ? 'light' : 'dark');
  }, [setIsDark]);

  const setTheme = useCallback((dark) => {
    setIsDark(dark ? 'dark' : 'light');
  }, [setIsDark]);

  const isDarkMode = isDark === 'dark' || isDark === true;

  const value = {
    isDark: isDarkMode,
    toggleTheme,
    setTheme,
    themeColor,
    setThemeColor,
    bgTheme,
    setBgTheme,
    bgAnimation,
    setBgAnimation,
    fontChoice,
    setFontChoice,
    mounted,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}