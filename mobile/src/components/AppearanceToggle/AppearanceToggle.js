import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

/** @type {Array<{ value: "system" | "light" | "dark", label: string, icon: keyof typeof Ionicons.glyphMap }>} */
const OPTIONS = [
  { value: "system", label: "System", icon: "phone-portrait-outline" },
  { value: "light", label: "Light", icon: "sunny-outline" },
  { value: "dark", label: "Dark", icon: "moon-outline" },
];

export function AppearanceToggle() {
  const { colors, preference, setPreference } = useTheme();

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {OPTIONS.map((option) => {
        const selected = preference === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => setPreference(option.value)}
            style={({ pressed }) => [
              styles.option,
              selected && { backgroundColor: colors.primary },
              pressed && !selected && styles.optionPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${option.label} theme`}
          >
            <Ionicons
              name={option.icon}
              size={18}
              color={selected ? "#FFFFFF" : colors.textMuted}
            />
            <Text
              style={[
                styles.label,
                { color: selected ? "#FFFFFF" : colors.text },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  option: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
  },
  optionPressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});
