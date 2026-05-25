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
import {
  formatRelativeTime,
  getAvatarColor,
  getInitials,
} from "@/lib/formatRelativeTime";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

const BODY_MAX_LINES = 5;
const CARD_RADIUS = 22;
const H_PAD = spacing.md + 4;

/**
 * @param {Object} props
 * @param {object} props.post
 * @param {() => void} [props.onPress]
 * @param {() => void} [props.onLike]
 * @param {() => void} [props.onComment]
 */
export function FeedPostCard({ post, onPress, onLike, onComment }) {
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
  const bannerUri = resolveMediaUrl(post.bannerUrl);

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

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <View style={[styles.shadow, { shadowColor, backgroundColor: cardBg }]}>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          {isPinned ? (
            <View
              style={[
                styles.pinnedStrip,
                { backgroundColor: `${colors.primary}12` },
              ]}
            >
              <Ionicons name="pin" size={11} color={colors.primary} />
              <Text style={[styles.pinnedLabel, { color: colors.primary }]}>
                Pinned post
              </Text>
            </View>
          ) : null}

          {bannerUri ? (
            <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
              <Image source={{ uri: bannerUri }} style={styles.banner} />
            </Pressable>
          ) : null}

          <Pressable
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            style={styles.tappable}
          >
            <View style={styles.authorRow}>
              <View
                style={[styles.avatarRing, { borderColor: `${avatarBg}50` }]}
              >
                <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                  <Text style={styles.initials}>
                    {getInitials(author?.firstName, author?.lastName)}
                  </Text>
                </View>
              </View>
              <View style={styles.authorMeta}>
                <Text
                  style={[styles.authorName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {name}
                </Text>
                <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                  {formatRelativeTime(post.createdAt)}
                </Text>
              </View>
            </View>

            <View style={styles.content}>
              {post.title ? (
                <Text style={[styles.title, { color: colors.text }]}>
                  {post.title}
                </Text>
              ) : null}
              <Text
                style={[styles.body, { color: semantic.postBodyText }]}
                numberOfLines={BODY_MAX_LINES}
              >
                {post.body}
              </Text>
            </View>
          </Pressable>

          <View
            style={[styles.footer, { borderTopColor: semantic.footerDivider }]}
          >
            <Pressable style={styles.footerBtn} hitSlop={10} onPress={onLike}>
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
            <Pressable style={styles.footerBtn} hitSlop={10} onPress={onComment}>
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
          </View>
        </View>
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
    paddingVertical: 9,
  },
  pinnedLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  banner: {
    width: "100%",
    height: 160,
  },
  tappable: {},
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: H_PAD,
    paddingTop: spacing.md + 2,
    paddingBottom: 12,
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
    gap: 2,
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
  content: {
    paddingHorizontal: H_PAD,
    paddingBottom: spacing.md,
    gap: 7,
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
  footer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingHorizontal: H_PAD - 6,
    paddingVertical: 10,
  },
  footerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 6,
    borderRadius: 10,
    marginRight: 6,
  },
  footerCount: {
    fontSize: 13,
    fontWeight: "600",
  },
  footerSpacer: {
    flex: 1,
  },
});
