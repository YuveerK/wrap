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

export function PostDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  /** @type {{ postId: number }} */
  const { postId } = route.params;
  const id = Number(postId);
  const queryClient = useQueryClient();
  const { colors, semantic } = useTheme();
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
            likeCount: Math.max(
              0,
              (old.post.likeCount ?? 0) + (liked ? 1 : -1),
            ),
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

  return (
    <Screen edges={["top"]} padded={false} backgroundColor={listBg}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {bannerUri ? (
          <Image source={{ uri: bannerUri }} style={styles.banner} />
        ) : null}

        <View style={styles.authorRow}>
          <View style={[styles.avatarRing, { borderColor: `${avatarBg}50` }]}>
            <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
              <Text style={styles.initials}>
                {getInitials(author?.firstName, author?.lastName)}
              </Text>
            </View>
          </View>
          <View>
            <Text style={[styles.authorName, { color: colors.text }]}>
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
        <Text style={[styles.body, { color: semantic.postBodyText }]}>
          {post.body}
        </Text>

        {post.latitude != null && post.longitude != null ? (
          <Pressable
            onPress={openInMaps}
            style={[styles.locationWrap, { borderColor: colors.border }]}
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
              <Marker coordinate={{ latitude: post.latitude, longitude: post.longitude }} />
            </MapView>
            <View
              style={[styles.locationLabel, { backgroundColor: semantic.cardBackground }]}
            >
              <Ionicons name="location" size={13} color={colors.primary} />
              <Text
                style={[styles.locationText, { color: colors.text }]}
                numberOfLines={1}
              >
                {post.addressText || `${post.latitude.toFixed(5)}, ${post.longitude.toFixed(5)}`}
              </Text>
              <Ionicons name="open-outline" size={13} color={colors.textMuted} />
            </View>
          </Pressable>
        ) : null}

        <PostAttachments attachments={post.attachments} />

        <View
          style={[styles.likeBar, { borderColor: semantic.footerDivider }]}
        >
          <Pressable
            style={styles.likeBtn}
            onPress={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={22}
              color={liked ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.likeLabel,
                { color: liked ? colors.primary : colors.textMuted },
              ]}
            >
              {post.likeCount ?? 0}
            </Text>
          </Pressable>
          <Pressable style={styles.likeBtn} onPress={goToComment}>
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={colors.textMuted}
            />
            <Text style={[styles.likeLabel, { color: colors.textMuted }]}>
              {post.commentCount ?? 0}
            </Text>
          </Pressable>
        </View>

        <View style={styles.commentsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Comments
          </Text>
          <Pressable onPress={goToComment} hitSlop={8}>
            <Text style={[styles.addComment, { color: colors.primary }]}>
              Add comment
            </Text>
          </Pressable>
        </View>

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
          <Pressable onPress={goToComment} style={styles.emptyComments}>
            <Text style={[styles.noComments, { color: colors.textMuted }]}>
              No comments yet. Tap to start the conversation.
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xl,
  },
  banner: {
    width: "100%",
    height: 200,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
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
  },
  authorName: {
    fontSize: 16,
    fontWeight: "700",
  },
  time: {
    fontSize: 13,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  locationWrap: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
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
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  likeBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.xs,
  },
  likeLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
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
  emptyComments: {
    paddingHorizontal: spacing.md,
  },
  noComments: {
    fontSize: 15,
    lineHeight: 22,
  },
});
