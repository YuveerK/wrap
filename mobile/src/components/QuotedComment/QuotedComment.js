import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

/**
 * @param {Object} props
 * @param {string} props.authorName
 * @param {string} props.body
 */
export function QuotedComment({ authorName, body }) {
  const { colors, semantic } = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.surface,
          borderLeftColor: colors.primary,
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.textMuted }]}>
        Replying to {authorName}
      </Text>
      <Text
        style={[styles.body, { color: semantic.postBodyText }]}
        numberOfLines={6}
      >
        {body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderLeftWidth: 3,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: "italic",
  },
});
