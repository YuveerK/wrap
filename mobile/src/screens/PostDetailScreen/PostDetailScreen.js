import {
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as postsApi from "@/api/posts";
import { CommentItem } from "@/components/CommentItem/CommentItem";
import { ErrorView } from "@/components/ErrorView/ErrorView";
import { Loading } from "@/components/Loading/Loading";
import { PostAttachments } from "@/components/PostAttachments/PostAttachments";
import { Screen } from "@/components/Screen/Screen";
import {
  formatRelativeTime,
  getAvatarColor,
  getInitials,
} from "@/lib/formatRelativeTime";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { SCREENS } from "@/navigation/params";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

const H_PAD = spacing.md;

export function PostDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  /** @type {{ postId: number }} */
  const { postId } = route.params;
  const id = Number(postId);
  const queryClient = useQueryClient();
  const { colors, semantic } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const listBg = semantic.feedListBackground;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["post", id],
    queryFn: () => postsApi.getPost(id),
    enabled: Number.isFinite(id),
  });

  const post = data?.post;

  const likeMutation = useMutation({
    mutationFn: () => postsApi.toggleLike(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", id] });
      const previous = queryClient.getQueryData(["post", id]);
      queryClient.setQueryData(["post", id], (old) => {
        if (!old?.post) return old;
        const liked = !old.post.likedByMe;
        return {
          ...old,
          post: {
            ...old.post,
            likedByMe: liked,
            likeCount: Math.max(0, (old.post.likeCount ?? 0) + (liked ? 1 : -1)),
          },
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["post", id], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const openInMaps = () => {
    const lat = post?.latitude;
    const lng = post?.longitude;
    const label = encodeURIComponent(post?.addressText ?? "");
    const url = Platform.select({
      ios: `maps://app?ll=${lat},${lng}&q=${label}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
    });
    Linking.openURL(url);
  };

  const goToComment = () => {
    navigation.navigate(SCREENS.PostComment, { postId: id });
  };

  const goToReply = (comment) => {
    const authorName =
      [comment.author?.firstName, comment.author?.lastName]
        .filter(Boolean)
        .join(" ") || "Neighbor";
    navigation.navigate(SCREENS.PostComment, {
      postId: id,
      parentId: comment.id,
      quoteAuthorName: authorName,
      quoteBody: comment.body,
    });
  };

  if (isLoading && !post) {
    return (
      <Screen edges={["bottom"]} backgroundColor={listBg}>
        <Loading />
      </Screen>
    );
  }

  if (error && !post) {
    return (
      <Screen edges={["bottom"]} backgroundColor={listBg}>
        <ErrorView
          message={error instanceof Error ? error.message : "Failed to load post"}
          onRetry={() => refetch()}
        />
      </Screen>
    );
  }

  if (!post) {
    return (
      <Screen edges={["bottom"]} backgroundColor={listBg}>
        <ErrorView message="Post not found" />
      </Screen>
    );
  }

  const author = post.author;
  const name =
    [author?.firstName, author?.lastName].filter(Boolean).join(" ") || "Neighbor";
  const seed = String(author?.id ?? name);
  const avatarBg = getAvatarColor(seed);
  const bannerUri = resolveMediaUrl(post.bannerUrl);
  const liked = Boolean(post.likedByMe);
  const isPinned = Boolean(post.pinned);
  const category = post.category ?? post.kind;

  return (
    <Screen edges={[]} padded={false} backgroundColor={listBg}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarHeight + spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Full-bleed banner */}
        {bannerUri ? (
          <Image source={{ uri: bannerUri }} style={styles.banner} />
        ) : null}

        {/* Pinned strip — correct §2.2 tint, consistent with card */}
        {isPinned ? (
          <View style={[styles.pinnedStrip, { backgroundColor: `${colors.primary}12` }]}>
            <Ionicons name="pin" size={11} color={colors.primary} />
            <Text style={[styles.pinnedLabel, { color: colors.primary }]}>
              PINNED BY COMMITTEE
            </Text>
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
            <Text style={[styles.authorName, { color: colors.text }]}>{name}</Text>
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

        {/* Post content */}
        <View style={styles.content}>
          {post.title ? (
            <Text style={[styles.title, { color: colors.text }]}>{post.title}</Text>
          ) : null}
          <Text style={[styles.body, { color: semantic.postBodyText }]}>
            {post.body}
          </Text>
        </View>

        {/* Image/file attachments */}
        <PostAttachments attachments={post.attachments} />

        {/* Location map */}
        {post.latitude != null && post.longitude != null ? (
          <Pressable
            onPress={openInMaps}
            style={[styles.locationWrap, { borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Open location in Maps"
          >
            <MapView
              style={styles.locationMap}
              region={{
                latitude: post.latitude,
                longitude: post.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              pointerEvents="none"
            >
              <Marker
                coordinate={{ latitude: post.latitude, longitude: post.longitude }}
              />
            </MapView>
            <View
              style={[styles.locationLabel, { backgroundColor: semantic.cardBackground }]}
            >
              <Ionicons name="location" size={13} color={colors.primary} />
              <Text
                style={[styles.locationText, { color: colors.text }]}
                numberOfLines={1}
              >
                {post.addressText ||
                  `${post.latitude.toFixed(5)}, ${post.longitude.toFixed(5)}`}
              </Text>
              <Ionicons name="open-outline" size={13} color={colors.textMuted} />
            </View>
          </Pressable>
        ) : null}

        {/* Actions — single top+bottom hairline, airy padding */}
        <View
          style={[
            styles.actionsRow,
            {
              borderTopColor: semantic.footerDivider,
              borderBottomColor: semantic.footerDivider,
            },
          ]}
        >
          <Pressable
            hitSlop={10}
            onPress={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
            style={[styles.actionBtn, { opacity: likeMutation.isPending ? 0.5 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel={liked ? "Unlike this post" : "Like this post"}
            accessibilityState={{ selected: liked }}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={22}
              color={liked ? colors.primary : colors.textMuted}
            />
            {(post.likeCount ?? 0) > 0 ? (
              <Text
                style={[
                  styles.actionCount,
                  { color: liked ? colors.primary : colors.textMuted },
                ]}
              >
                {post.likeCount}
              </Text>
            ) : null}
          </Pressable>

          <Pressable
            hitSlop={10}
            onPress={goToComment}
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel={`${post.commentCount ?? 0} comments, add a comment`}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.textMuted} />
            {(post.commentCount ?? 0) > 0 ? (
              <Text style={[styles.actionCount, { color: colors.textMuted }]}>
                {post.commentCount}
              </Text>
            ) : null}
          </Pressable>
        </View>

        {/* Comments */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Comments
            </Text>
            <Pressable onPress={goToComment} hitSlop={10}>
              <Text style={[styles.addComment, { color: colors.primary }]}>
                Add comment
              </Text>
            </Pressable>
          </View>

          <View style={styles.commentsList}>
            {post.comments?.length ? (
              post.comments.map((c) => (
                <View key={c.id}>
                  <CommentItem comment={c} onReply={() => goToReply(c)} />
                  {c.replies?.map((r) => (
                    <CommentItem key={r.id} comment={r} isReply />
                  ))}
                </View>
              ))
            ) : (
              <Pressable
                onPress={goToComment}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Add the first comment"
                style={styles.emptyComments}
              >
                <Text style={[styles.noComments, { color: colors.textMuted }]}>
                  No comments yet. Tap to start the conversation.
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    // paddingBottom set dynamically via tabBarHeight
  },
  banner: {
    width: "100%",
    height: 220,
  },
  pinnedStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: H_PAD,
    paddingVertical: 7,
  },
  pinnedLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
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
    gap: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  body: {
    fontSize: 15,
    fontWeight: "400",
    letterSpacing: 0.1,
    lineHeight: 23,
  },
  locationWrap: {
    marginHorizontal: H_PAD,
    marginTop: spacing.md,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
  },
  locationMap: {
    height: 160,
  },
  locationLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md - 4,
    paddingVertical: spacing.sm,
  },
  locationText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "500",
  },
  actionsRow: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: H_PAD,
    paddingVertical: spacing.sm + 2,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  commentsSection: {
    paddingTop: spacing.md,
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: H_PAD,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  addComment: {
    fontSize: 15,
    fontWeight: "600",
  },
  commentsList: {
    paddingHorizontal: H_PAD,
  },
  emptyComments: {
    paddingVertical: spacing.sm,
  },
  noComments: {
    fontSize: 15,
    lineHeight: 22,
  },
});
