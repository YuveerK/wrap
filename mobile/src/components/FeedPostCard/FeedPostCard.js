import { useCallback, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RoleBadge } from "@/components/RoleBadge/RoleBadge";
import {
  formatRelativeTime,
  getAvatarColor,
  getInitials,
} from "@/lib/formatRelativeTime";
import { hexAlpha } from "@/lib/issues";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

const CARD_RADIUS = 22;
const H_PAD = spacing.md + 4;

/**
 * @param {Object} props
 * @param {object} props.post
 * @param {() => void} [props.onPress]
 * @param {() => void} [props.onLike]
 * @param {() => void} [props.onComment]
 * @param {() => void} [props.onSupport]
 */
export function FeedPostCard({ post, onPress, onLike, onComment, onSupport }) {
  const { colors, semantic, isDark } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const author = post.author;
  const name =
    [author?.firstName, author?.lastName].filter(Boolean).join(" ") ||
    "Neighbor";
  const seed = String(author?.id ?? name);
  const avatarBg = getAvatarColor(seed);
  const isPinned = Boolean(post.pinned);
  const liked = Boolean(post.likedByMe);
  const supported = Boolean(post.supportedByMe);
  const bannerUri = resolveMediaUrl(post.bannerUrl);
  const category = post.category ?? post.kind;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.982,
      useNativeDriver: true,
      tension: 400,
      friction: 20,
    }).start();
  }, [scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 400,
      friction: 20,
    }).start();
  }, [scale]);

  const cardBg = semantic.cardBackground;
  const shadowColor = isDark ? "#000000" : "#0D1520";
  const supportBg = hexAlpha(colors.primary, 0.12);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      {/* Layer 1 — shadow caster */}
      <View style={[styles.shadow, { shadowColor, backgroundColor: cardBg }]}>
        {/* Layer 2 — content clipper */}
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={[styles.card, { backgroundColor: cardBg }]}
          accessibilityRole="button"
        >
          {isPinned ? (
            <View style={[styles.pinnedStrip, { backgroundColor: colors.primary }]}>
              <Ionicons name="pin" size={11} color="#FFFFFF" />
              <Text style={styles.pinnedLabel}>PINNED BY COMMITTEE</Text>
            </View>
          ) : null}

          {/* Author row */}
          <View style={styles.authorRow}>
            <View style={[styles.avatarRing, { borderColor: `${avatarBg}50` }]}>
              <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                <Text style={styles.initials}>
                  {getInitials(author?.firstName, author?.lastName)}
                </Text>
              </View>
            </View>
            <View style={styles.authorMeta}>
              <View style={styles.nameRow}>
                <Text
                  style={[styles.authorName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {name}
                </Text>
                {author?.role ? <RoleBadge role={author.role} /> : null}
              </View>
              <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                {formatRelativeTime(post.createdAt)}
              </Text>
            </View>
            {category ? (
              <Text style={[styles.categoryEyebrow, { color: colors.textMuted }]}>
                {String(category).toUpperCase()}
              </Text>
            ) : null}
          </View>

          {/* Title + body */}
          <View style={styles.content}>
            {post.title ? (
              <Text
                style={[styles.title, { color: colors.text }]}
                numberOfLines={2}
              >
                {post.title}
              </Text>
            ) : null}
            <Text
              style={[styles.body, { color: semantic.postBodyText }]}
              numberOfLines={3}
            >
              {post.body}
            </Text>
          </View>

          {/* Optional full-bleed banner image */}
          {bannerUri ? (
            <Image source={{ uri: bannerUri }} style={styles.banner} />
          ) : null}

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: semantic.footerDivider }]}>
            {/* Support */}
            <Pressable
              style={[styles.footerBtn, { backgroundColor: supportBg }]}
              hitSlop={10}
              onPress={onSupport}
              accessibilityRole="button"
              accessibilityLabel="Support this post"
            >
              <Ionicons
                name="arrow-up"
                size={15}
                color={colors.primary}
              />
              {(post.supportCount ?? 0) > 0 ? (
                <Text style={[styles.footerCount, { color: colors.primary }]}>
                  {post.supportCount}
                </Text>
              ) : null}
            </Pressable>

            {/* Like */}
            <Pressable
              style={styles.footerBtnOutline}
              hitSlop={10}
              onPress={onLike}
              accessibilityRole="button"
              accessibilityLabel={liked ? "Unlike" : "Like"}
            >
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={19}
                color={liked ? colors.primary : colors.textMuted}
              />
              {(post.likeCount ?? 0) > 0 ? (
                <Text
                  style={[
                    styles.footerCount,
                    { color: liked ? colors.primary : colors.textMuted },
                  ]}
                >
                  {post.likeCount}
                </Text>
              ) : null}
            </Pressable>

            {/* Comment */}
            <Pressable
              style={styles.footerBtnOutline}
              hitSlop={10}
              onPress={onComment}
              accessibilityRole="button"
              accessibilityLabel="Comment"
            >
              <Ionicons
                name="chatbubble-outline"
                size={17}
                color={colors.textMuted}
              />
              {(post.commentCount ?? 0) > 0 ? (
                <Text style={[styles.footerCount, { color: colors.textMuted }]}>
                  {post.commentCount}
                </Text>
              ) : null}
            </Pressable>

            <View style={styles.footerSpacer} />

            {/* More */}
            <Pressable hitSlop={10} accessibilityRole="button" accessibilityLabel="More options">
              <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
            </Pressable>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: CARD_RADIUS,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 20,
      },
      android: { elevation: 3 },
    }),
  },
  card: {
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
  },
  pinnedStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: H_PAD,
    paddingVertical: 7,
  },
  pinnedLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: H_PAD,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  avatarRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  authorMeta: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  authorName: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  timestamp: {
    fontSize: 12.5,
    fontWeight: "500",
  },
  categoryEyebrow: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  content: {
    paddingHorizontal: H_PAD,
    paddingBottom: spacing.sm,
    gap: 8,
    marginTop: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: 26,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    letterSpacing: 0.1,
  },
  banner: {
    width: "100%",
    height: 160,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 0.5,
    paddingHorizontal: H_PAD - 4,
    paddingVertical: spacing.sm + 2,
    gap: 6,
  },
  footerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  footerBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 6,
    borderRadius: 10,
  },
  footerCount: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  footerSpacer: {
    flex: 1,
  },
});
