import { useColorScheme } from "react-native";
import { useThemeStore } from "@/store/theme";
import { darkColors, lightColors } from "./colors";
import { getSemanticColors } from "./semantic";

export { spacing } from "./spacing";
export { typography } from "./typography";
export { getSemanticColors } from "./semantic";

/**
 * @param {"system" | "light" | "dark"} preference
 * @param {"light" | "dark" | null | undefined} systemScheme
 * @returns {"light" | "dark"}
 */
export function resolveScheme(preference, systemScheme) {
  if (preference === "light" || preference === "dark") {
    return preference;
  }
  return systemScheme === "dark" ? "dark" : "light";
}

export function useTheme() {
  const systemScheme = useColorScheme();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const scheme = resolveScheme(preference, systemScheme);
  const colors = scheme === "dark" ? darkColors : lightColors;
  const semantic = getSemanticColors(scheme);

  return {
    colors,
    scheme,
    semantic,
    preference,
    setPreference,
    isDark: scheme === "dark",
  };
}
