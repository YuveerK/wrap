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
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import * as issuesApi from "@/api/issues";
import { ErrorView } from "@/components/ErrorView/ErrorView";
import { IssueCard } from "@/components/IssueCard/IssueCard";
import { Loading } from "@/components/Loading/Loading";
import { Screen } from "@/components/Screen/Screen";
import { SCREENS } from "@/navigation/params";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

const H_PAD = spacing.md + 4;

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Mine", value: "mine" },
  { label: "Resolved", value: "resolved" },
];

const OPEN_STATUSES = new Set(["REPORTED", "ACKNOWLEDGED", "IN_PROGRESS"]);

export function IssuesListScreen() {
  const navigation = useNavigation();
  const { colors, semantic, isDark } = useTheme();
  const listBg = semantic.feedListBackground;
  const [filter, setFilter] = useState("all");

  const { data, isLoading, error, refetch, isRefetching, isFetching } = useQuery({
    queryKey: ["issues"],
    queryFn: () => issuesApi.listIssues(),
  });

  const allIssues = data?.issues ?? [];

  const openCount = useMemo(
    () => allIssues.filter((i) => OPEN_STATUSES.has(i.status)).length,
    [allIssues],
  );
  const resolvedCount = useMemo(
    () => allIssues.filter((i) => i.status === "RESOLVED" || i.status === "CLOSED").length,
    [allIssues],
  );
  const inProgressCount = useMemo(
    () => allIssues.filter((i) => i.status === "IN_PROGRESS").length,
    [allIssues],
  );

  const issues = useMemo(() => {
    if (filter === "all") return allIssues;
    if (filter === "open") return allIssues.filter((i) => OPEN_STATUSES.has(i.status));
    if (filter === "resolved") return allIssues.filter((i) => i.status === "RESOLVED" || i.status === "CLOSED");
    return allIssues; // "mine" — would filter by current user; show all for now
  }, [allIssues, filter]);

  const cardBg = semantic.cardBackground;
  const shadowColor = isDark ? "#000000" : "#0D1520";
  const showSkeleton = isLoading && allIssues.length === 0;
  const showError = error && allIssues.length === 0 && !showSkeleton;

  const goToCreate = useCallback(() => {
    navigation.navigate(SCREENS.CreateIssue);
  }, [navigation]);

  if (showError) {
    return (
      <Screen edges={["top"]} padded={false} backgroundColor={listBg}>
        <ErrorView
          message={error instanceof Error ? error.message : "Failed to load issues"}
          onRetry={() => refetch()}
        />
      </Screen>
    );
  }

  if (showSkeleton) {
    return (
      <Screen edges={["top"]} padded={false} backgroundColor={listBg}>
        <Loading />
      </Screen>
    );
  }

  const ListHeader = (
    <>
      {/* PageHeader */}
      <View style={[styles.pageHeader, { paddingHorizontal: H_PAD }]}>
        <View style={styles.titleBlock}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            YOUR NEIGHBOURHOOD
          </Text>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Issues</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
            {`${openCount} open · ${resolvedCount} resolved`}
          </Text>
        </View>
      </View>

      {/* Stat strip card */}
      <View style={[styles.statCard, { backgroundColor: cardBg, shadowColor }]}>
        <View style={styles.statCol}>
          <Text style={[styles.statNum, { color: colors.textMuted }]}>
            {allIssues.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Reported</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statCol}>
          <Text style={[styles.statNum, { color: colors.primary }]}>
            {inProgressCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>In progress</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statCol}>
          <Text style={[styles.statNum, { color: colors.success }]}>
            {resolvedCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Resolved</Text>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.chipRow, { paddingHorizontal: H_PAD }]}
      >
        {FILTER_OPTIONS.map((opt) => {
          const active = filter === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setFilter(opt.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? "#FFF" : colors.text }]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Section row */}
      <View style={[styles.sectionRow, { paddingHorizontal: H_PAD }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          All reports
        </Text>
        {isFetching && !isRefetching ? (
          <Text style={[styles.syncing, { color: colors.textMuted }]}>
            Updating…
          </Text>
        ) : null}
      </View>
    </>
  );

  return (
    <Screen edges={["top"]} padded={false} backgroundColor={listBg}>
      <View style={styles.screen}>
        <FlatList
          data={issues}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: 80 },
            issues.length === 0 && styles.listEmpty,
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
            <View style={styles.emptyWrap}>
              <Ionicons name="construct-outline" size={36} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No issues reported
              </Text>
              <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
                Help keep the estate in good shape by reporting faults when you
                spot them.
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <IssueCard
              issue={item}
              onPress={() => navigation.navigate(SCREENS.IssueDetail, { issueId: item.id })}
            />
          )}
        />

        {/* FAB */}
        <Pressable
          onPress={goToCreate}
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
          accessibilityLabel="Report an issue"
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    paddingHorizontal: H_PAD,
    paddingTop: spacing.sm,
  },
  listEmpty: {
    flexGrow: 1,
  },
  pageHeader: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  titleBlock: {
    gap: 2,
  },
  eyebrow: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  pageSubtitle: {
    fontSize: 13.5,
    fontWeight: "500",
    marginTop: 2,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    marginHorizontal: H_PAD,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 20,
      },
      android: { elevation: 3 },
    }),
  },
  statCol: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statNum: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
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
    height: spacing.sm,
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  emptyBody: {
    fontSize: 14.5,
    lineHeight: 22,
    textAlign: "center",
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
