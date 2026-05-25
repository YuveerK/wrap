import { Pressable, StyleSheet, Text, View } from "react-native";
import { categoryLabels, statusColors, statusLabels } from "@/lib/issues";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

/**
 * @param {Object} props
 * @param {object} props.issue
 * @param {() => void} props.onPress
 */
export function IssueCard({ issue, onPress }) {
  const { colors } = useTheme();
  const statusColor = statusColors[issue.status] ?? colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.row}>
        <Text style={[styles.category, { color: colors.textMuted }]}>
          {categoryLabels[issue.category] ?? issue.category}
        </Text>
        <View style={[styles.badge, { backgroundColor: statusColor }]}>
          <Text style={styles.badgeText}>
            {statusLabels[issue.status] ?? issue.status}
          </Text>
        </View>
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {issue.title}
      </Text>
      <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
        {issue.supportCount} supported · {issue.reporter?.firstName}{" "}
        {issue.reporter?.lastName}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.9,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  category: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    fontSize: 13,
  },
});
