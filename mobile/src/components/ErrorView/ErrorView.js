import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button/Button";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

/**
 * @param {Object} props
 * @param {string} [props.message]
 * @param {() => void} [props.onRetry]
 */
export function ErrorView({ message = "Something went wrong.", onRetry }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      {onRetry ? <Button title="Try again" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
  },
});
