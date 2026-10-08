import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle({ showLabel = true, className = "" }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Theme"
      className={`relative inline-flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 border cursor-pointer ${
        isDark
          ? "border-white/10 bg-white/5 text-amber-300 hover:bg-white/10 hover:border-amber-400/40"
          : "border-[#D9DEE5] bg-white text-[#1F2937] shadow-xs hover:bg-[#EEF0F3] hover:border-indigo-400/60"
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Sun size={17} className="text-amber-400 transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon size={17} className="text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
        )}
      </div>

      {showLabel && (
        <span className="font-semibold tracking-normal">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
