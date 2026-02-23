// components/ThemeSwitcher.tsx
"use client";

import { useTheme } from "@/context/ThemeContext";
import { Palette } from "lucide-react";


const themes = ['talent-light', 'talent-dark', 'light', 'dark', 'cupcake'] as const;

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-sm">
        <Palette size={16}/> {theme}
      </label>
      <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow">
        {themes.map((t) => (
          <li key={t}>
            <button 
              className={theme === t ? 'active' : ''}
              onClick={() => setTheme(t)}
            >
              {t.replace('-', ' ')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
