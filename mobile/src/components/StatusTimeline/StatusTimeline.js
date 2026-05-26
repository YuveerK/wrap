import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ISSUE_STATUSES, hexAlpha, statusLabels, statusMeta } from "@/lib/issues";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

/**
 * Full 5-step status timeline for an issue.
 *
 * @param {Object} props
 * @param {string} props.currentStatus — the issue's live status
 * @param {Array<{ status?: string | null, note?: string | null, createdAt: string, author?: { firstName?: string, lastName?: string } }>} [props.updates]
 */
export function StatusTimeline({ currentStatus, updates }) {
  const { colors, semantic, isDark } = useTheme();
  const cardBg = semantic.cardBackground;

  // Build a lookup from status → update record
  const updatesByStatus = {};
  if (updates) {
    for (const u of updates) {
      if (u.status) updatesByStatus[u.status] = u;
    }
  }

  const currentIdx = ISSUE_STATUSES.indexOf(currentStatus);

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <Text style={[styles.eyebrow, { color: colors.textMuted }]}>STATUS</Text>

      <View style={styles.steps}>
        {ISSUE_STATUSES.map((status, idx) => {
          const meta = statusMeta[status] ?? { fg: "#6B7280", bgOpacity: 0.12 };
          const reached = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          const update = updatesByStatus[status];
          const isLast = idx === ISSUE_STATUSES.length - 1;
          // Connector colour — filled if next step is reached
          const connectorColor = idx < currentIdx ? meta.fg : colors.border;

          return (
            <View key={status} style={styles.step}>
              {/* Dot + connector column */}
              <View style={styles.dotCol}>
                {/* Halo ring around current status dot */}
                {isCurrent ? (
                  <View
                    style={[
                      styles.halo,
                      { backgroundColor: hexAlpha(meta.fg, 0.18), borderRadius: 14 },
                    ]}
                  >
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: meta.fg },
                      ]}
                    >
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                  </View>
                ) : reached ? (
                  <View style={[styles.dot, { backgroundColor: meta.fg }]}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                ) : (
                  <View
                    style={[
                      styles.dot,
                      styles.dotEmpty,
                      { backgroundColor: cardBg, borderColor: colors.border },
                    ]}
                  />
                )}

                {/* Connector line */}
                {!isLast ? (
                  <View
                    style={[styles.connector, { backgroundColor: connectorColor }]}
                  />
                ) : null}
              </View>

              {/* Text content */}
              <View style={styles.content}>
                <Text
                  style={[
                    styles.statusLabel,
                    {
                      color: reached ? colors.text : colors.textMuted,
                      fontWeight: reached ? "700" : "500",
                    },
                  ]}
                >
                  {statusLabels[status] ?? status}
                </Text>
                {reached && update ? (
                  <Text style={[styles.metaLine, { color: colors.textMuted }]}>
                    {update.author
                      ? `by ${[update.author.firstName, update.author.lastName].filter(Boolean).join(" ")} · `
                      : ""}
                    {formatWhen(update.createdAt)}
                  </Text>
                ) : null}
                {reached && update?.note ? (
                  <View
                    style={[
                      styles.noteBubble,
                      { backgroundColor: hexAlpha(colors.textMuted, 0.08) },
                    ]}
                  >
                    <Text style={[styles.noteText, { color: semantic.postBodyText }]}>
                      {update.note}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** @param {string} iso */
function formatWhen(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: spacing.lg,
    paddingHorizontal: spacing.md + 4,
  },
  eyebrow: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  steps: {
    gap: 0,
  },
  step: {
    flexDirection: "row",
    gap: 14,
    minHeight: 52,
  },
  dotCol: {
    alignItems: "center",
    width: 24,
  },
  halo: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -2,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dotEmpty: {
    borderWidth: 2,
  },
  connector: {
    flex: 1,
    width: 2,
    marginVertical: 2,
  },
  content: {
    flex: 1,
    paddingTop: 2,
    paddingBottom: 14,
    gap: 3,
  },
  statusLabel: {
    fontSize: 14.5,
    lineHeight: 20,
  },
  metaLine: {
    fontSize: 12.5,
    fontWeight: "500",
  },
  noteBubble: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  noteText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
});
