import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

  const supportMutation = useMutation({
    mutationFn: () => issuesApi.supportIssue(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["issue", id] });
      await queryClient.invalidateQueries({ queryKey: ["issues"] });
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

        {/* Support / Comment row */}
        <View style={styles.reactionRow}>
          <Pressable
            onPress={() => supportMutation.mutate()}
            disabled={supportMutation.isPending}
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
            style={[
              styles.reactionBtn,
              { borderWidth: 1, borderColor: colors.border },
            ]}
          >
            <Ionicons name="chatbubble-outline" size={16} color={colors.text} />
            <Text style={[styles.reactionLabel, { color: colors.text }]}>
              {`${issue.commentCount ?? 0} comments`}
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
});
