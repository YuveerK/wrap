import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

export function FeedHeader({ communityName, postCount = 0, memberCount = 0 }) {
  const { colors, semantic, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <View style={[styles.iconBadge, { backgroundColor: colors.primary }]}>
          <Ionicons name="home" size={20} color="#FFF" />
        </View>
        <View style={styles.brandText}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            Your neighborhood
          </Text>
          <Text
            style={[styles.communityName, { color: colors.text }]}
            numberOfLines={1}
          >
            {communityName ?? "Community"}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.statsRow,
          { borderTopColor: semantic.footerDivider },
        ]}
      >
        <View style={styles.stat}>
          <Ionicons
            name="document-text-outline"
            size={14}
            color={colors.textMuted}
          />
          <Text style={[styles.statNum, { color: colors.text }]}>
            {postCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {postCount === 1 ? "post" : "posts"}
          </Text>
        </View>
        <View
          style={[
            styles.statDivider,
            { backgroundColor: isDark ? "#3A4560" : "#DDE2ED" },
          ]}
        />
        <View style={styles.stat}>
          <Ionicons name="people-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.statNum, { color: colors.text }]}>
            {memberCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {memberCount === 1 ? "member" : "members"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md + 4,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconBadge: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  communityName: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statNum: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  statLabel: {
    fontSize: 13.5,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 14,
    borderRadius: 1,
  },
});
