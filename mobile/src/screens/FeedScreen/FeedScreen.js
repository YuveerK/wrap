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
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
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
import { useNotificationsStore } from "@/store/notifications";
import { FeedEmptyState } from "./components/FeedEmptyState";
import { FeedHeader } from "./components/FeedHeader";
import { FilteredEmptyState } from "./components/FilteredEmptyState";

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
  const hasUnread = useNotificationsStore((s) => s.hasUnread);
  const setHasUnread = useNotificationsStore((s) => s.setHasUnread);
  const listBg = semantic.feedListBackground;

  const [selectedCategory, setSelectedCategory] = useState("all");

  const postsQuery = useQuery({
    queryKey: ["posts"],
    queryFn: postsApi.listPosts,
  });

  const tabBarHeight = useBottomTabBarHeight();
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
      {/* FeedHeader breaks out of the list's horizontal padding */}
      <View style={styles.headerOutset}>
        <FeedHeader
          hasUnread={hasUnread}
          onNotifications={() => setHasUnread(false)}
        />
      </View>

      {/* Category chip row — full-width scroll, content padded to align with list */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipOutset}
        contentContainerStyle={styles.chipRow}
      >
        {CATEGORY_OPTIONS.map((opt) => {
          const active = selectedCategory === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setSelectedCategory(opt.value)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${opt.label}`}
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                  opacity: pressed ? 0.75 : 1,
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

      {/* Section row — inherits list's horizontal padding */}
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
              { paddingBottom: tabBarHeight + 72 },
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
            ListEmptyComponent={
              selectedCategory !== "all" && allPosts.length > 0 ? (
                <FilteredEmptyState
                  categoryLabel={
                    CATEGORY_OPTIONS.find((o) => o.value === selectedCategory)?.label ??
                    selectedCategory
                  }
                  onClear={() => setSelectedCategory("all")}
                />
              ) : (
                <FeedEmptyState onCompose={goToCompose} />
              )
            }
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
                bottom: tabBarHeight + spacing.md,
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
    paddingHorizontal: spacing.md,
  },
  listEmpty: {
    flexGrow: 1,
  },
  headerOutset: {
    marginHorizontal: -spacing.md,
  },
  chipOutset: {
    marginHorizontal: -spacing.md,
  },
  chipRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
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
