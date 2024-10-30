import React, { createContext, useState, useContext } from "react";

const ThemeContext = createContext();

export const themes = {
  light: {
    background: "#f5f5f5",
    card: "white",
    text: "#333",
    textSecondary: "#666",
    primary: "#6B4EFF",
    border: "#eee",
    searchBg: "#f0f0f0",
  },
  dark: {
    background: "#121212",
    card: "#1E1E1E",
    text: "#FFFFFF",
    textSecondary: "#A0A0A0",
    primary: "#8B6FFF",
    border: "#2C2C2C",
    searchBg: "#2C2C2C",
  },
};

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        theme: isDarkMode ? themes.dark : themes.light,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
