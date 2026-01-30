import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => null,
  toggleTheme: () => null,
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("grepobot-modern-theme");
      return saved || "light";
    } catch (e) {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("grepobot-modern-theme", theme);
    } catch (e) {
      // Ignorer
    }

    const container = document.getElementById("grepobot-modern-container");
    if (container) {
      if (theme === "dark") {
        container.classList.add("dark");
      } else {
        container.classList.remove("dark");
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
