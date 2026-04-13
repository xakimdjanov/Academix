import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    if (theme === "dark") {
      root.classList.add("dark");
      body.classList.add("dark");
      console.log("%c DARK MODE ACTIVE ", "background: #222; color: #bada55; font-size: 1.2rem;");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
      console.log("%c LIGHT MODE ACTIVE ", "background: #eee; color: #111; font-size: 1.2rem;");
    }
    
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
