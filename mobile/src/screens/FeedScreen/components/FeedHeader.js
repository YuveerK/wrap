import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

/**
 * @param {Object} props
 * @param {string} [props.communityName]
 * @param {number} [props.postCount]
 * @param {number} [props.memberCount]
 */
export function FeedHeader({ communityName, postCount = 0, memberCount = 0 }) {
  const { colors, scheme } = useTheme();
  const heroBg = scheme === "dark" ? colors.surface : "#FFF7ED";

  return (
    <View style={styles.wrap}>
      <View style={[styles.hero, { backgroundColor: heroBg }]}>
        <View style={[styles.heroIcon, { backgroundColor: colors.primary }]}>
          <Ionicons name="people" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.heroText}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            Your neighborhood
          </Text>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {communityName ?? "Community"}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <StatPill
          icon="newspaper-outline"
          label={`${postCount} ${postCount === 1 ? "post" : "posts"}`}
          colors={colors}
        />
        <StatPill
          icon="people-outline"
          label={`${memberCount} ${memberCount === 1 ? "member" : "members"}`}
          colors={colors}
        />
      </View>
    </View>
  );
}

/** @param {Object} props */
function StatPill({ icon, label, colors }) {
  return (
    <View style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <Text style={[styles.pillText, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 20,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
