import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  formatRelativeTime,
  getAvatarColor,
  getInitials,
} from "@/lib/formatRelativeTime";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

const BODY_LINES = 6;

/**
 * @param {Object} props
 * @param {object} props.post
 */
export function FeedPostCard({ post }) {
  const { colors, scheme } = useTheme();
  const author = post.author;
  const name = [author?.firstName, author?.lastName].filter(Boolean).join(" ") || "Neighbor";
  const seed = String(author?.id ?? name);
  const avatarBg = getAvatarColor(seed);
  const isPinned = Boolean(post.pinned);
  const isDark = scheme === "dark";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.surface : "#FFFFFF",
          borderColor: isPinned ? colors.primary : colors.border,
          shadowColor: isDark ? "#000" : "#1a1f36",
        },
        isPinned && styles.cardPinned,
      ]}
    >
      {isPinned ? (
        <View style={[styles.pinnedRow, { backgroundColor: `${colors.primary}18` }]}>
          <Ionicons name="pin" size={12} color={colors.primary} />
          <Text style={[styles.pinnedLabel, { color: colors.primary }]}>
            Pinned update
          </Text>
        </View>
      ) : null}

      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarText}>
            {getInitials(author?.firstName, author?.lastName)}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.author, { color: colors.text }]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {formatRelativeTime(post.createdAt)}
          </Text>
        </View>
      </View>

      {post.title ? (
        <Text style={[styles.title, { color: colors.text }]}>{post.title}</Text>
      ) : null}

      <Text
        style={[styles.body, { color: colors.text }]}
        numberOfLines={BODY_LINES}
      >
        {post.body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.sm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardPinned: {
    borderWidth: 1.5,
  },
  pinnedRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: spacing.xs,
  },
  pinnedLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  author: {
    fontSize: 15,
    fontWeight: "700",
  },
  time: {
    fontSize: 13,
  },
  title: {
    ...typography.subtitle,
    fontSize: 17,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
});
