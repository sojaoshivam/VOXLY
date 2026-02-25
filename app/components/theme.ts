"use client";

export function useTheme() {
    // Exact requested theme tokens for strict dark mode
    const C = {
        bg: "#0e0e0e",
        surface: "#1a1a1a",
        surfaceAlt: "#242424",
        border: "#2e2e2e",
        text: "#f0eeea",
        textMid: "#8b8680",
        textFaint: "#5a5652",
        accent: "#f472b6",
        accentAlt: "#fb923c",
        accentBg: "#1f1118",
        success: "#4ade80",
        error: "#f87171",
        sidebar: "#141414",
    };

    return {
        C,
        mode: "dark" as "light" | "dark",
        toggle: () => { }, // empty function to avoid breaking components that might call it
        isDark: true,
    };
}
