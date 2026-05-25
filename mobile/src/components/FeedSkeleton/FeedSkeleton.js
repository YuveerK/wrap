import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

function SkeletonBlock({ style, color }) {
  return <View style={[styles.block, { backgroundColor: color }, style]} />;
}

export function FeedSkeleton() {
  const { colors, scheme } = useTheme();
  const bone = scheme === "dark" ? colors.border : "#E8ECF0";
  const cardBg = scheme === "dark" ? colors.surface : "#FFFFFF";

  return (
    <View style={styles.list}>
      {[0, 1, 2].map((key) => (
        <View
          key={key}
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: colors.border },
          ]}
        >
          <View style={styles.row}>
            <SkeletonBlock style={styles.avatar} color={bone} />
            <View style={styles.col}>
              <SkeletonBlock style={styles.lineShort} color={bone} />
              <SkeletonBlock style={styles.lineTiny} color={bone} />
            </View>
          </View>
          <SkeletonBlock style={styles.lineTitle} color={bone} />
          <SkeletonBlock style={styles.lineBody} color={bone} />
          <SkeletonBlock style={styles.lineBodyShort} color={bone} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  col: {
    flex: 1,
    gap: spacing.sm,
  },
  block: {
    borderRadius: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  lineShort: {
    height: 14,
    width: "45%",
  },
  lineTiny: {
    height: 12,
    width: "28%",
  },
  lineTitle: {
    height: 18,
    width: "70%",
  },
  lineBody: {
    height: 14,
    width: "100%",
  },
  lineBodyShort: {
    height: 14,
    width: "82%",
  },
});
