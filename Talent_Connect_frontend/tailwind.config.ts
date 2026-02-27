// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  // Optional: if you need to override auto-detected content paths
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}", // adjust to your project structure
  ],

  // Optional: plugins (but again, prefer @plugin in CSS for daisyUI etc.)
  plugins: [
    // require('daisyui'), // if you want to use daisyUI as a plugin (not recommended in v5)
  ],

  // daisyUI config would go here if using old style (but not recommended in v5)
} satisfies Config;
