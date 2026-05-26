import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import * as postsApi from "@/api/posts";
import { FeedPostCard } from "@/components/FeedPostCard/FeedPostCard";
import { FeedSkeleton } from "@/components/FeedSkeleton/FeedSkeleton";
import { ErrorView } from "@/components/ErrorView/ErrorView";
import { Screen } from "@/components/Screen/Screen";
import { SCREENS } from "@/navigation/params";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";
import { FeedEmptyState } from "./components/FeedEmptyState";
import { FeedHeader } from "./components/FeedHeader";

const CATEGORY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Notices", value: "Notices" },
  { label: "Safety", value: "Safety" },
  { label: "Events", value: "Events" },
  { label: "Lost & Found", value: "Lost & Found" },
  { label: "Recs", value: "Recommendations" },
];

export function FeedScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { colors, semantic, isDark } = useTheme();
  const listBg = semantic.feedListBackground;

  const [selectedCategory, setSelectedCategory] = useState("all");

  const postsQuery = useQuery({
    queryKey: ["posts"],
    queryFn: postsApi.listPosts,
  });

  const { data, isLoading, error, refetch, isRefetching, isFetching } = postsQuery;
  const allPosts = data?.posts ?? [];

  const posts = useMemo(() => {
    if (selectedCategory === "all") return allPosts;
    return allPosts.filter(
      (p) =>
        (p.category ?? p.kind ?? "").toLowerCase() ===
        selectedCategory.toLowerCase(),
    );
  }, [allPosts, selectedCategory]);

  const pinnedCount = useMemo(
    () => allPosts.filter((p) => p.pinned).length,
    [allPosts],
  );

  const goToCompose = useCallback(() => {
    navigation.navigate(SCREENS.CreatePost);
  }, [navigation]);

  const goToPost = useCallback(
    (postId) => {
      navigation.navigate(SCREENS.PostDetail, { postId });
    },
    [navigation],
  );

  const goToComment = useCallback(
    (postId) => {
      navigation.navigate(SCREENS.PostComment, { postId });
    },
    [navigation],
  );

  const likeMutation = useMutation({
    mutationFn: (postId) => postsApi.toggleLike(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previous = queryClient.getQueryData(["posts"]);
      queryClient.setQueryData(["posts"], (old) => {
        if (!old?.posts) return old;
        return {
          ...old,
          posts: old.posts.map((p) => {
            if (p.id !== postId) return p;
            const liked = !p.likedByMe;
            return {
              ...p,
              likedByMe: liked,
              likeCount: Math.max(0, (p.likeCount ?? 0) + (liked ? 1 : -1)),
            };
          }),
        };
      });
      return { previous };
    },
    onError: (_err, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["posts"], context.previous);
      }
    },
    onSettled: (_data, _err, postId) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  const shadowColor = isDark ? "#000000" : "#0D1520";
  const cardBg = semantic.cardBackground;
  const showSkeleton = isLoading && allPosts.length === 0;
  const showError = error && allPosts.length === 0 && !showSkeleton;

  if (showError) {
    return (
      <Screen edges={["top"]} padded={false} backgroundColor={listBg}>
        <ErrorView
          message={error instanceof Error ? error.message : "Failed to load feed"}
          onRetry={() => refetch()}
        />
      </Screen>
    );
  }

  const ListHeader = (
    <>
      <FeedHeader />

      {/* Category chip row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {CATEGORY_OPTIONS.map((opt) => {
          const active = selectedCategory === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setSelectedCategory(opt.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? "#FFF" : colors.text },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Section row */}
      {allPosts.length > 0 || showSkeleton ? (
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {pinnedCount > 0 ? "Updates" : "Latest"}
          </Text>
          {isFetching && !isRefetching ? (
            <Text style={[styles.syncing, { color: colors.textMuted }]}>
              Updating…
            </Text>
          ) : null}
        </View>
      ) : null}
    </>
  );

  return (
    <Screen edges={["top"]} padded={false} backgroundColor={listBg}>
      <View style={styles.screen}>
        {showSkeleton ? (
          <>
            {ListHeader}
            <FeedSkeleton />
          </>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: 80 },
              posts.length === 0 && styles.listEmpty,
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching && !isLoading}
                onRefresh={refetch}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={<FeedEmptyState onCompose={goToCompose} />}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <FeedPostCard
                post={item}
                onPress={() => goToPost(item.id)}
                onLike={() => likeMutation.mutate(item.id)}
                onComment={() => goToComment(item.id)}
              />
            )}
          />
        )}

        {!showSkeleton ? (
          <Pressable
            onPress={goToCompose}
            style={({ pressed }) => [
              styles.fab,
              {
                backgroundColor: colors.primary,
                bottom: spacing.md,
                shadowColor: colors.primary,
              },
              pressed && styles.fabPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Write a new post"
          >
            <Ionicons name="create" size={26} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    paddingTop: spacing.sm,
  },
  listEmpty: {
    flexGrow: 1,
  },
  chipRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  syncing: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  separator: {
    height: spacing.md,
  },
  fab: {
    position: "absolute",
    right: spacing.md,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
      },
      android: { elevation: 10 },
    }),
  },
  fabPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.9,
  },
});
