/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        "bg-2": "var(--bg-2)",
        panel: "var(--panel)",
        "panel-solid": "var(--panel-solid)",
        "panel-soft": "var(--panel-soft)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        "text-default": "var(--text)",
        muted: "var(--muted)",
        subtle: "var(--subtle)",
        accent: "var(--accent)",
        "accent-2": "var(--accent-2)",
        good: "var(--good)",
        "map-border": "var(--map-border)",
        chip: "var(--chip)",
        "chip-text": "var(--chip-text)",
        "list-hover": "var(--list-hover)",
        "list-active": "var(--list-active)",
      },
      boxShadow: {
        custom: "var(--shadow)",
        "mode-button": "0 8px 20px rgba(18, 28, 50, 0.08)",
        "toggle-rail": "0 3px 10px rgba(0, 0, 0, 0.2)",
        "panel-toggle": "0 10px 28px rgba(18, 28, 50, 0.08)",
        "tooltip": "0 16px 40px rgba(18, 28, 50, 0.18)",
        "popup": "0 20px 50px rgba(18, 28, 50, 0.18)",
        "legend": "0 14px 36px rgba(18, 28, 50, 0.16)",
        "leaflet-bar": "0 12px 28px rgba(18, 28, 50, 0.12)",
      },
      borderRadius: {
        xl: "var(--radius-xl)",
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      fontFamily: {
        "dm-sans": "var(--font-dm-sans), system-ui, sans-serif",
        syne: "var(--font-syne), system-ui, sans-serif",
      },
    },
  },
  plugins: [],
}
