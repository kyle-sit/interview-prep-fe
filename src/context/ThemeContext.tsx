import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
    theme: Theme;
    toggleTheme: () => void;
};

/**
 * Undefined default is a sentinel for "no provider above me" — useTheme()
 * turns it into a real error instead of handing back a plausible-looking
 * fallback that silently does nothing.
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "theme";

/** A saved choice wins; otherwise follow the OS setting. */
function getInitialTheme(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Function form, not getInitialTheme(): this reads localStorage once on
    // mount rather than on every render due to react lazy state initialization.
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    // Updater form means this never depends on `theme`, so it stays stable
    // across renders.
    const toggleTheme = useCallback(() => {
        setTheme((current) => (current === "light" ? "dark" : "light"));
    }, []);

    // Without this, every provider render builds a new object and re-renders
    // every consumer even when the theme has not changed.
    const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

    return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
    return ctx;
}
