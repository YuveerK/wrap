import { useCallback, useMemo } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import * as communitiesApi from "@/api/communities";
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
import { styles } from "./FeedScreen.styles";

export function FeedScreen() {
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const { colors, scheme } = useTheme();
  const listBg = scheme === "dark" ? colors.background : "#F4F6F9";
  const listBottomPad = tabBarHeight + 72;

  const communityQuery = useQuery({
    queryKey: ["community", "current"],
    queryFn: communitiesApi.fetchCurrentCommunity,
    staleTime: 1000 * 60 * 5,
  });

  const postsQuery = useQuery({
    queryKey: ["posts"],
    queryFn: postsApi.listPosts,
  });

  const { data, isLoading, error, refetch, isRefetching, isFetching } = postsQuery;
  const posts = data?.posts ?? [];
  const community = communityQuery.data?.community;

  const pinnedCount = useMemo(
    () => posts.filter((p) => p.pinned).length,
    [posts],
  );

  const goToCompose = useCallback(() => {
    navigation.navigate(SCREENS.CreatePost);
  }, [navigation]);

  const showSkeleton = isLoading && posts.length === 0;
  const showError = error && posts.length === 0 && !showSkeleton;

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

  return (
    <Screen edges={["top"]} padded={false} backgroundColor={listBg}>
      <View style={styles.screen}>
        {showSkeleton ? (
          <>
            <FeedHeader
              communityName={community?.name}
              postCount={community?.postCount}
              memberCount={community?.memberCount}
            />
            <FeedSkeleton />
          </>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: listBottomPad },
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
            ListHeaderComponent={
              <>
                <FeedHeader
                  communityName={community?.name}
                  postCount={community?.postCount ?? posts.length}
                  memberCount={community?.memberCount}
                />
                {posts.length > 0 ? (
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
            }
            ListEmptyComponent={
              <FeedEmptyState onCompose={goToCompose} />
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => <FeedPostCard post={item} />}
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
