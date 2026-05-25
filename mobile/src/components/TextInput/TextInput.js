import { StyleSheet, Text, TextInput as RNTextInput, View } from "react-native";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

/**
 * @param {Object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {string} [props.value]
 * @param {(text: string) => void} [props.onChangeText]
 * @param {import('react-native').TextInputProps} [props.inputProps]
 */
export function TextInput({ label, error, value, onChangeText, ...inputProps }) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      ) : null}
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: error ? colors.danger : colors.border,
            backgroundColor: colors.surface,
          },
        ]}
        {...inputProps}
      />
      {error ? (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
  },
  error: {
    fontSize: 13,
  },
});
