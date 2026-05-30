import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

export function FilteredEmptyState({ categoryLabel, onClear }) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}15` }]}>
        <Ionicons name="funnel-outline" size={28} color={colors.primary} />
      </View>

      <View style={styles.textBlock}>
        <Text style={[styles.heading, { color: colors.text }]}>
          No {categoryLabel} posts
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          There are no posts in this category yet.
        </Text>
      </View>

      <Pressable
        onPress={onClear}
        hitSlop={10}
        style={({ pressed }) => [
          styles.btn,
          { borderColor: colors.border, opacity: pressed ? 0.88 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Clear category filter"
      >
        <Text style={[styles.btnText, { color: colors.text }]}>Clear filter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  iconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    alignItems: "center",
    gap: spacing.sm,
  },
  heading: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.4,
    textAlign: "center",
  },
  sub: {
    fontSize: 14.5,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 260,
  },
  btn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 4,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  btnText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
});
