import { createContext, useContext, useState, useEffect } from 'react';

const DashboardThemeContext = createContext({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {}
});

export function DashboardThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('dashboard_theme') || 'light';
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('dashboard_theme', next);
      return next;
    });
  };

  const isDark = theme === 'dark';

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <DashboardThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </DashboardThemeContext.Provider>
  );
}

export function useDashboardTheme() {
  return useContext(DashboardThemeContext);
}

