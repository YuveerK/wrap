import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  formatRelativeTime,
  getAvatarColor,
  getInitials,
} from "@/lib/formatRelativeTime";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

/**
 * @param {Object} props
 * @param {object} props.comment
 * @param {boolean} [props.isReply]
 * @param {() => void} [props.onReply]
 */
export function CommentItem({ comment, isReply = false, onReply }) {
  const { colors } = useTheme();
  const author = comment.author;
  const name =
    [author?.firstName, author?.lastName].filter(Boolean).join(" ") || "Neighbor";
  const seed = String(author?.id ?? name);
  const avatarBg = getAvatarColor(seed);

  return (
    <View style={[styles.row, isReply && styles.reply]}>
      <View style={[styles.avatarRing, { borderColor: `${avatarBg}50` }]}>
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={styles.initials}>
            {getInitials(author?.firstName, author?.lastName)}
          </Text>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {formatRelativeTime(comment.createdAt)}
          </Text>
        </View>
        <Text style={[styles.text, { color: colors.text }]}>{comment.body}</Text>
        {!isReply && onReply ? (
          <Pressable onPress={onReply} hitSlop={8}>
            <Text style={[styles.replyBtn, { color: colors.primary }]}>Reply</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  reply: {
    marginLeft: spacing.lg,
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  body: {
    flex: 1,
    gap: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
  },
  time: {
    fontSize: 12,
    fontWeight: "500",
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  replyBtn: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
});
