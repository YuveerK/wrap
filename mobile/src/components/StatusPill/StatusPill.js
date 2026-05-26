import { StyleSheet, Text, View } from "react-native";
import { hexAlpha, statusLabels, statusMeta } from "@/lib/issues";

/**
 * Compact status pill used in IssueCard and IssueDetail.
 * @param {{ status: string }} props
 */
export function StatusPill({ status }) {
  const meta = statusMeta[status] ?? { fg: "#6B7280", bgOpacity: 0.12 };
  const label = statusLabels[status] ?? status;
  const bg = hexAlpha(meta.fg, meta.bgOpacity);

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: meta.fg }]} />
      <Text style={[styles.label, { color: meta.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 10,
    borderRadius: 999,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  label: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
