import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {() => void} [props.onPress]
 * @param {boolean} [props.disabled]
 * @param {"primary" | "secondary"} [props.variant]
 */
export function Button({
  title,
  onPress,
  disabled = false,
  variant = "primary",
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        variant === "primary"
          ? { backgroundColor: colors.primary }
          : { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: variant === "primary" ? "#FFFFFF" : colors.text,
          },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
});
