import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import * as issuesApi from "@/api/issues";
import { ApiError } from "@/api/client";
import { ErrorView } from "@/components/ErrorView/ErrorView";
import { Loading } from "@/components/Loading/Loading";
import { Screen } from "@/components/Screen/Screen";
import { StatusPill } from "@/components/StatusPill/StatusPill";
import { StatusTimeline } from "@/components/StatusTimeline/StatusTimeline";
import { useAuth } from "@/hooks/useAuth";
import {
  categoryIcons,
  categoryLabels,
  hexAlpha,
  ISSUE_STATUSES,
  statusLabels,
  statusMeta,
} from "@/lib/issues";
import {
  formatRelativeTime,
  getAvatarColor,
  getInitials,
} from "@/lib/formatRelativeTime";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";
import { scrollViewStyle } from "@/theme/screenLayout";

const H_PAD = spacing.md + 4;

export function IssueDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { issueId } = route.params;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { colors, semantic, isDark } = useTheme();
  const id = Number(issueId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["issue", id],
    queryFn: () => issuesApi.getIssue(id),
    enabled: Number.isFinite(id),
  });

  const issue = data?.issue;

  const [selectedStatus, setSelectedStatus] = useState(null);

  const supportMutation = useMutation({
    mutationFn: () => issuesApi.supportIssue(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["issue", id] });
      await queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status) => issuesApi.reporterUpdateIssueStatus(id, { status }),
    onSuccess: () => {
      setSelectedStatus(null);
      queryClient.invalidateQueries({ queryKey: ["issue", id] });
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });

  const watchMutation = useMutation({
    mutationFn: () =>
      issue?.watchedByMe ? issuesApi.unwatchIssue(id) : issuesApi.watchIssue(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["issue", id] });
      const previous = queryClient.getQueryData(["issue", id]);
      queryClient.setQueryData(["issue", id], (old) => {
        if (!old?.issue) return old;
        return { ...old, issue: { ...old.issue, watchedByMe: !old.issue.watchedByMe } };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["issue", id], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", id] });
    },
  });

  if (isLoading && !issue) {
    return (
      <Screen edges={["bottom"]} padded={false}>
        <Loading />
      </Screen>
    );
  }

  if (error && !issue) {
    return (
      <Screen edges={["bottom"]} padded={false}>
        <ErrorView
          message={error instanceof Error ? error.message : "Failed to load issue"}
          onRetry={() => refetch()}
        />
      </Screen>
    );
  }

  if (!issue) {
    return (
      <Screen edges={["bottom"]} padded={false}>
        <ErrorView message="Issue not found" />
      </Screen>
    );
  }

  const category = issue.category ?? issue.kind ?? "OTHER";
  const categoryLabel = categoryLabels[category] ?? category;
  const iconName = categoryIcons[category] ?? "alert-circle-outline";
  const meta = statusMeta[issue.status] ?? { fg: "#6B7280", bgOpacity: 0.12 };
  const iconBg = hexAlpha(meta.fg, 0.14);

  const reporter = issue.reporter;
  const reporterName =
    [reporter?.firstName, reporter?.lastName].filter(Boolean).join(" ") || "Unknown";
  const reporterSeed = String(reporter?.id ?? reporterName);
  const reporterAvatarBg = getAvatarColor(reporterSeed);

  const cardBg = semantic.cardBackground;
  const shadowColor = isDark ? "#000000" : "#0D1520";

  return (
    <Screen edges={["bottom"]} padded={false}>
      <ScrollView
        style={scrollViewStyle}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status hero row */}
        <View style={styles.heroRow}>
          <View style={[styles.heroIcon, { backgroundColor: iconBg }]}>
            <Ionicons name={iconName} size={24} color={meta.fg} />
          </View>
          <View style={styles.heroMeta}>
            <Text style={[styles.heroEyebrow, { color: colors.textMuted }]}>
              {categoryLabel.toUpperCase()}
            </Text>
            <View style={styles.pillRow}>
              <StatusPill status={issue.status} />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>{issue.title}</Text>

        {/* Meta block */}
        <View style={styles.metaBlock}>
          {issue.addressText ? (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={15} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {issue.addressText}
              </Text>
            </View>
          ) : null}
          <View style={styles.metaRow}>
            <View
              style={[styles.reporterAvatar, { backgroundColor: reporterAvatarBg }]}
            >
              <Text style={styles.reporterInitials}>
                {getInitials(reporter?.firstName, reporter?.lastName)}
              </Text>
            </View>
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {"Reported by "}
              <Text style={{ color: colors.text, fontWeight: "700" }}>
                {reporterName}
              </Text>
              {` · ${formatRelativeTime(issue.createdAt)}`}
            </Text>
          </View>
        </View>

        {/* Support / Watch row */}
        <View style={styles.reactionRow}>
          <Pressable
            onPress={() => supportMutation.mutate()}
            disabled={supportMutation.isPending}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Support this issue · ${issue.supportCount ?? 0} supporters`}
            style={[
              styles.reactionBtn,
              styles.reactionBtnPrimary,
              { backgroundColor: hexAlpha(colors.primary, 0.12) },
            ]}
          >
            <Ionicons name="arrow-up" size={16} color={colors.primary} />
            <Text style={[styles.reactionLabel, { color: colors.primary }]}>
              {`Support · ${issue.supportCount ?? 0}`}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => watchMutation.mutate()}
            disabled={watchMutation.isPending}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={issue.watchedByMe ? "Stop watching this issue" : "Watch this issue for updates"}
            accessibilityState={{ selected: Boolean(issue.watchedByMe) }}
            style={[
              styles.reactionBtn,
              {
                borderWidth: 1,
                borderColor: issue.watchedByMe ? colors.primary : colors.border,
                backgroundColor: issue.watchedByMe
                  ? hexAlpha(colors.primary, 0.08)
                  : "transparent",
                opacity: watchMutation.isPending ? 0.6 : 1,
              },
            ]}
          >
            <Ionicons
              name={issue.watchedByMe ? "notifications" : "notifications-outline"}
              size={16}
              color={issue.watchedByMe ? colors.primary : colors.text}
            />
            <Text
              style={[
                styles.reactionLabel,
                { color: issue.watchedByMe ? colors.primary : colors.text },
              ]}
            >
              {issue.watchedByMe ? "Watching" : "Watch"}
            </Text>
          </Pressable>
        </View>

        {/* StatusTimeline card — wrapped in shadow */}
        <View style={[styles.timelineShadow, { shadowColor, backgroundColor: cardBg }]}>
          <StatusTimeline
            currentStatus={issue.status}
            updates={issue.updates}
          />
        </View>

        {/* Reporter-only status picker */}
        {issue.reporter.id === user?.id ? (
          <View style={[styles.statusCardShadow, { shadowColor, backgroundColor: cardBg }]}>
            <View style={[styles.statusCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.statusEyebrow, { color: colors.textMuted }]}>
                UPDATE STATUS
              </Text>
              <View style={styles.statusChips}>
                {ISSUE_STATUSES.filter((s) => s !== issue.status).map((s) => {
                  const m = statusMeta[s];
                  const active = selectedStatus === s;
                  return (
                    <Pressable
                      key={s}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={`Set status to ${statusLabels[s]}`}
                      accessibilityState={{ selected: active }}
                      onPress={() => setSelectedStatus(active ? null : s)}
                      style={({ pressed }) => [
                        styles.statusChip,
                        {
                          backgroundColor: active
                            ? hexAlpha(m.fg, 0.14)
                            : colors.surface,
                          borderColor: active ? m.fg : colors.border,
                          opacity: pressed ? 0.75 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusChipText,
                          { color: active ? m.fg : colors.textMuted },
                        ]}
                      >
                        {statusLabels[s]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {selectedStatus ? (
                <Pressable
                  onPress={() => statusMutation.mutate(selectedStatus)}
                  disabled={statusMutation.isPending}
                  accessibilityRole="button"
                  accessibilityLabel={`Mark as ${statusLabels[selectedStatus]}`}
                  style={[
                    styles.updateBtn,
                    {
                      backgroundColor: statusMeta[selectedStatus].fg,
                      opacity: statusMutation.isPending ? 0.6 : 1,
                    },
                  ]}
                >
                  <Text style={styles.updateBtnText}>
                    {statusMutation.isPending
                      ? "Updating…"
                      : `Mark as ${statusLabels[selectedStatus]}`}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  heroRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
    paddingHorizontal: H_PAD,
    paddingTop: spacing.md,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  heroMeta: {
    flex: 1,
    gap: 4,
  },
  heroEyebrow: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  pillRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 30,
    marginTop: 14,
    paddingHorizontal: H_PAD,
  },
  metaBlock: {
    gap: 8,
    marginTop: 14,
    paddingHorizontal: H_PAD,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    fontWeight: "400",
    flex: 1,
  },
  reporterAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  reporterInitials: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  reactionRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    paddingHorizontal: H_PAD,
    marginBottom: spacing.lg,
  },
  reactionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  reactionBtnPrimary: {},
  reactionLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  timelineShadow: {
    borderRadius: 22,
    marginHorizontal: H_PAD,
    marginBottom: spacing.xl,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 20,
      },
      android: { elevation: 3 },
    }),
  },
  statusCardShadow: {
    borderRadius: 22,
    marginHorizontal: H_PAD,
    marginBottom: spacing.xl,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 20,
      },
      android: { elevation: 3 },
    }),
  },
  statusCard: {
    borderRadius: 22,
    overflow: "hidden",
    padding: H_PAD,
    gap: spacing.md,
  },
  statusEyebrow: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statusChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  updateBtn: {
    borderRadius: 999,
    paddingVertical: spacing.sm + 2,
    alignItems: "center",
  },
  updateBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
