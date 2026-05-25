import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "@wrap/theme-preference";

/** @typedef {"system" | "light" | "dark"} ThemePreference */

/** @returns {Promise<ThemePreference>} */
export async function loadThemePreference() {
  try {
    const value = await AsyncStorage.getItem(THEME_KEY);
    if (value === "light" || value === "dark" || value === "system") {
      return value;
    }
  } catch {
    // Fall through to default
  }
  return "system";
}

/** @param {ThemePreference} preference */
export async function saveThemePreference(preference) {
  await AsyncStorage.setItem(THEME_KEY, preference);
}
