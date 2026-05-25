import { StyleSheet, Text, View } from "react-native";
import { statusLabels } from "@/lib/issues";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

/**
 * @param {Object} props
 * @param {Array<{ id: number, status?: string | null, note?: string | null, createdAt: string, author?: { firstName?: string, lastName?: string } }>} props.updates
 */
export function StatusTimeline({ updates }) {
  const { colors } = useTheme();

  if (!updates?.length) {
    return (
      <Text style={[styles.empty, { color: colors.textMuted }]}>
        No updates yet.
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {updates.map((item, index) => (
        <View key={item.id} style={styles.item}>
          <View style={styles.lineCol}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            {index < updates.length - 1 ? (
              <View style={[styles.line, { backgroundColor: colors.border }]} />
            ) : null}
          </View>
          <View style={styles.content}>
            <Text style={[styles.when, { color: colors.textMuted }]}>
              {formatWhen(item.createdAt)}
              {item.author
                ? ` · ${item.author.firstName ?? ""} ${item.author.lastName ?? ""}`.trim()
                : ""}
            </Text>
            {item.status ? (
              <Text style={[styles.status, { color: colors.text }]}>
                {statusLabels[item.status] ?? item.status}
              </Text>
            ) : null}
            {item.note ? (
              <Text style={[styles.note, { color: colors.text }]}>{item.note}</Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

/** @param {string} iso */
function formatWhen(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  item: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  lineCol: {
    width: 12,
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  line: {
    flex: 1,
    width: 2,
    marginTop: 4,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  when: {
    fontSize: 12,
  },
  status: {
    fontSize: 15,
    fontWeight: "600",
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
  },
  empty: {
    fontSize: 14,
  },
});
