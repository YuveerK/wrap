import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { TextInput } from "@/components/TextInput/TextInput";
import { useRoute } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as issuesApi from "@/api/issues";
import { ApiError } from "@/api/client";
import { Button } from "@/components/Button/Button";
import { KeyboardAwareScrollView } from "@/components/KeyboardAwareScrollView/KeyboardAwareScrollView";
import { ErrorView } from "@/components/ErrorView/ErrorView";
import { Loading } from "@/components/Loading/Loading";
import { Screen } from "@/components/Screen/Screen";
import { StatusTimeline } from "@/components/StatusTimeline/StatusTimeline";
import { useAuth } from "@/hooks/useAuth";
import {
  ISSUE_STATUSES,
  categoryLabels,
  statusColors,
  statusLabels,
} from "@/lib/issues";
import { useTheme } from "@/theme";
import { scrollContentBelowHeader } from "@/theme/screenLayout";
import { styles } from "./IssueDetailScreen.styles";

export function IssueDetailScreen() {
  const route = useRoute();
  /** @type {{ issueId: number }} */
  const { issueId } = route.params;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const [actionError, setActionError] = useState("");
  const [moderatorStatus, setModeratorStatus] = useState(null);
  const [moderatorNote, setModeratorNote] = useState("");

  const id = Number(issueId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["issue", id],
    queryFn: () => issuesApi.getIssue(id),
    enabled: Number.isFinite(id),
  });

  const issue = data?.issue;
  const isModerator =
    user?.role === "COMMITTEE" || user?.role === "ADMIN";

  const supportMutation = useMutation({
    mutationFn: () => issuesApi.supportIssue(id),
    onSuccess: async () => {
      setActionError("");
      await queryClient.invalidateQueries({ queryKey: ["issue", id] });
      await queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
    onError: (err) => {
      setActionError(
        err instanceof ApiError ? err.message : "Could not support issue",
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: () =>
      issuesApi.updateIssueStatus(id, {
        status: moderatorStatus ?? issue?.status,
        note: moderatorNote.trim() || undefined,
      }),
    onSuccess: async () => {
      setActionError("");
      setModeratorNote("");
      await queryClient.invalidateQueries({ queryKey: ["issue", id] });
      await queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
    onError: (err) => {
      setActionError(
        err instanceof ApiError ? err.message : "Could not update status",
      );
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

  const statusColor = statusColors[issue.status] ?? colors.textMuted;
  const selectedStatus = moderatorStatus ?? issue.status;

  return (
    <Screen edges={["bottom"]} padded={false}>
      <KeyboardAwareScrollView contentContainerStyle={scrollContentBelowHeader}>
          <Text style={[styles.category, { color: colors.textMuted }]}>
            {categoryLabels[issue.category] ?? issue.category}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>{issue.title}</Text>
          <View style={[styles.badge, { backgroundColor: statusColor }]}>
            <Text style={styles.badgeText}>
              {statusLabels[issue.status] ?? issue.status}
            </Text>
          </View>
          <Text style={[styles.body, { color: colors.text }]}>
            {issue.description}
          </Text>
          {issue.addressText ? (
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {issue.addressText}
            </Text>
          ) : null}
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {issue.supportCount} neighbors supported this · reported by{" "}
            {issue.reporter?.firstName} {issue.reporter?.lastName}
          </Text>

          <Button
            title={
              supportMutation.isPending
                ? "Supporting…"
                : `Support (${issue.supportCount})`
            }
            onPress={() => supportMutation.mutate()}
            disabled={supportMutation.isPending}
            variant="secondary"
          />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Status timeline
          </Text>
          <StatusTimeline updates={issue.updates} />

          {isModerator ? (
            <View style={styles.moderatorBox}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Update status (moderator)
              </Text>
              <View style={styles.chips}>
                {ISSUE_STATUSES.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setModeratorStatus(s)}
                    style={[
                      styles.chip,
                      {
                        borderColor: colors.border,
                        backgroundColor:
                          selectedStatus === s ? colors.primary : colors.surface,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: selectedStatus === s ? "#fff" : colors.text,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {statusLabels[s]}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                label="Note (optional)"
                value={moderatorNote}
                onChangeText={setModeratorNote}
              />
              <Button
                title={statusMutation.isPending ? "Saving…" : "Save status"}
                onPress={() => statusMutation.mutate()}
                disabled={statusMutation.isPending}
              />
            </View>
          ) : null}

          {actionError ? (
            <Text style={[styles.error, { color: colors.danger }]}>
              {actionError}
            </Text>
          ) : null}
      </KeyboardAwareScrollView>
    </Screen>
  );
}
