import { useColorScheme } from "react-native";
import { darkColors, lightColors } from "./colors";

export { spacing } from "./spacing";
export { typography } from "./typography";

export function useTheme() {
  const scheme = useColorScheme();
  const colors = scheme === "dark" ? darkColors : lightColors;
  return { colors, scheme };
}
