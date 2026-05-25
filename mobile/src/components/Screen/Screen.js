import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

/**
 * @param {Object} props
 * @param {import('react').ReactNode} props.children
 * @param {import('react-native-safe-area-context').Edge[]} [props.edges]
 * @param {boolean} [props.padded] — inner content padding (off for full-width ScrollView)
 * @param {string} [props.backgroundColor] — override default background
 */
export function Screen({
  children,
  edges = ["top", "bottom"],
  padded = true,
  backgroundColor,
}) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: backgroundColor ?? colors.background }]}
      edges={edges}
    >
      {padded ? <View style={styles.content}>{children}</View> : children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
});
