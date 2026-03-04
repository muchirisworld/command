import { create } from "zustand";

type Theme = "light" | "dark" | "system";
const ALLOWED_THEMES: Array<Theme> = ["light", "dark", "system"];

interface ThemeState {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	init: () => void;
}

let mediaQueryHandler: ((e: MediaQueryListEvent) => void) | null = null;
let systemThemeHandler: ((e: MediaQueryListEvent) => void) | null = null;

const applyTheme = (theme: Theme) => {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	const prefersDark =
		window?.matchMedia?.("(prefers-color-scheme: dark)").matches;
	const dark = theme === "dark" || (theme === "system" && prefersDark);

	if (dark) root.classList.add("dark");
	else root.classList.remove("dark");
};

const useThemeStore = create<ThemeState>((set, get) => ({
	theme: "system",
	setTheme: (theme: Theme) => {
		set({ theme });
		if (typeof window !== "undefined") {
			try {
				localStorage.setItem("theme", theme);
			} catch (_e) {}
		}

		applyTheme(theme);

		if (window?.matchMedia) {
			const mq = window.matchMedia("(prefers-color-scheme: dark)");

			// Remove existing handler if present
			if (mediaQueryHandler) {
				try {
					mq.removeEventListener?.("change", mediaQueryHandler);
				} catch (_e) {}
				try {
					if (mq.removeListener) {
						(mq.removeListener as (h: () => void) => void)(mediaQueryHandler);
					}
				} catch (_e) {}
			}

			// Create and store new handler
			mediaQueryHandler = () => applyTheme(get().theme);
			try {
				if (mq.addEventListener) {
					mq.addEventListener("change", mediaQueryHandler);
				} else if (mq.addListener) {
					(mq.addListener as (h: () => void) => void)(mediaQueryHandler);
				}
			} catch (_e) {}
		}
	},

	init: () => {
		if (typeof window === "undefined") return;
		let stored: Theme | null = null;
		try {
			const raw = localStorage.getItem("theme");
			if (raw && ALLOWED_THEMES.includes(raw as Theme)) {
				stored = raw as Theme;
			}
		} catch (_e) {
			stored = null;
		}

		const theme: Theme = stored || "system";
		set({ theme });

		applyTheme(theme);

		if (theme === "system" && window?.matchMedia) {
			const mq = window.matchMedia("(prefers-color-scheme: dark)");

			// Remove existing handler if present
			if (systemThemeHandler) {
				try {
					mq.removeEventListener?.("change", systemThemeHandler);
				} catch (_e) {}
				try {
					if (mq.removeListener) {
						(mq.removeListener as (h: () => void) => void)(systemThemeHandler);
					}
				} catch (_e) {}
			}

			// Create and store new handler
			systemThemeHandler = () => applyTheme(get().theme);
			try {
				if (mq.addEventListener) {
					mq.addEventListener("change", systemThemeHandler);
				} else if (mq.addListener) {
					(mq.addListener as (h: () => void) => void)(systemThemeHandler);
				}
			} catch (_e) {}
		}
	},
}));

export default useThemeStore;
