import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-all duration-300 hover:bg-white/10 active:scale-95 flex items-center justify-center ${className}`}
      aria-label="Mavzuni o'zgartirish"
    >
      {theme === "light" ? (
        <FiMoon size={22} className="text-blue-400" />
      ) : (
        <FiSun size={22} className="text-yellow-400" />
      )}
    </button>
  );
};

export default ThemeToggle;
