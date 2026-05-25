import { useLayoutEffect } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import * as issuesApi from "@/api/issues";
import { ErrorView } from "@/components/ErrorView/ErrorView";
import { IssueCard } from "@/components/IssueCard/IssueCard";
import { Loading } from "@/components/Loading/Loading";
import { Screen } from "@/components/Screen/Screen";
import { SCREENS } from "@/navigation/params";
import { useTheme } from "@/theme";
import { styles } from "./IssuesListScreen.styles";

export function IssuesListScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["issues"],
    queryFn: () => issuesApi.listIssues(),
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate(SCREENS.CreateIssue)}
          hitSlop={12}
          style={styles.headerBtn}
        >
          <Text style={[styles.headerBtnText, { color: colors.primary }]}>
            Report
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, colors.primary]);

  const issues = data?.issues ?? [];

  if (isLoading && !issues.length) {
    return (
      <Screen edges={["bottom"]} padded={false}>
        <Loading />
      </Screen>
    );
  }

  if (error && !issues.length) {
    return (
      <Screen edges={["bottom"]} padded={false}>
        <ErrorView
          message={error instanceof Error ? error.message : "Failed to load issues"}
          onRetry={() => refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={["bottom"]} padded={false}>
      <FlatList
        data={issues}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ItemSeparatorComponent={() => <Text style={styles.sep} />}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            No issues reported yet.
          </Text>
        }
        renderItem={({ item }) => (
          <IssueCard
            issue={item}
            onPress={() =>
              navigation.navigate(SCREENS.IssueDetail, { issueId: item.id })
            }
          />
        )}
      />
    </Screen>
  );
}
