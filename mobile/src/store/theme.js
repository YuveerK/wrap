import { create } from "zustand";
import { loadThemePreference, saveThemePreference } from "@/lib/themeStorage";

/** @typedef {"system" | "light" | "dark"} ThemePreference */

/**
 * @typedef {Object} ThemeState
 * @property {ThemePreference} preference
 * @property {boolean} isHydrated
 * @param {ThemePreference} preference
 * @property {(preference: ThemePreference) => void} setPreference
 * @property {() => Promise<void>} hydrate
 */

/** @type {import('zustand').UseBoundStore<import('zustand').StoreApi<ThemeState>>} */
export const useThemeStore = create((set) => ({
  preference: "system",
  isHydrated: false,
  setPreference: (preference) => {
    set({ preference });
    void saveThemePreference(preference);
  },
  hydrate: async () => {
    const preference = await loadThemePreference();
    set({ preference, isHydrated: true });
  },
}));
