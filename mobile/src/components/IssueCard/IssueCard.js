import { useCallback, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusPill } from "@/components/StatusPill/StatusPill";
import {
  categoryIcons,
  categoryLabels,
  hexAlpha,
  statusMeta,
} from "@/lib/issues";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

const H_PAD = spacing.md + 4;

/**
 * @param {Object} props
 * @param {object} props.issue
 * @param {() => void} props.onPress
 */
export function IssueCard({ issue, onPress }) {
  const { colors, semantic, isDark } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.982,
      useNativeDriver: true,
      tension: 400,
      friction: 20,
    }).start();
  }, [scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 400,
      friction: 20,
    }).start();
  }, [scale]);

  const cardBg = semantic.cardBackground;
  const shadowColor = isDark ? "#000000" : "#0D1520";
  const meta = statusMeta[issue.status] ?? { fg: "#6B7280", bgOpacity: 0.12 };
  const iconBg = hexAlpha(meta.fg, 0.14);
  const category = issue.category ?? issue.kind ?? "OTHER";
  const categoryLabel = categoryLabels[category] ?? category;
  const iconName = categoryIcons[category] ?? "alert-circle-outline";

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      {/* Shadow caster */}
      <View style={[styles.shadow, { shadowColor, backgroundColor: cardBg }]}>
        {/* Content clipper */}
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={[styles.card, { backgroundColor: cardBg }]}
          accessibilityRole="button"
        >
          <View style={styles.row}>
            {/* Leading icon block */}
            <View style={[styles.iconBlock, { backgroundColor: iconBg }]}>
              <Ionicons name={iconName} size={20} color={meta.fg} />
            </View>

            {/* Right column */}
            <View style={styles.rightCol}>
              {/* Top row: category eyebrow + status pill */}
              <View style={styles.topRow}>
                <Text style={[styles.eyebrow, { color: colors.textMuted }]}>
                  {categoryLabel.toUpperCase()}
                </Text>
                <StatusPill status={issue.status} />
              </View>

              {/* Title */}
              <Text
                style={[styles.title, { color: colors.text }]}
                numberOfLines={2}
              >
                {issue.title}
              </Text>

              {/* Meta row */}
              <View style={styles.metaRow}>
                {issue.addressText ? (
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="location-outline"
                      size={12}
                      color={colors.textMuted}
                    />
                    <Text
                      style={[styles.metaText, { color: colors.textMuted }]}
                      numberOfLines={1}
                    >
                      {issue.addressText}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.metaItem}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={colors.textMuted}
                  />
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>
                    {formatRelativeTime(issue.createdAt)}
                  </Text>
                </View>
                <View style={[styles.metaItem, styles.supports]}>
                  <Ionicons
                    name="arrow-up"
                    size={12}
                    color={colors.textMuted}
                  />
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>
                    {issue.supportCount ?? 0}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 20,
      },
      android: { elevation: 3 },
    }),
  },
  card: {
    borderRadius: 10,
    overflow: "hidden",
    paddingVertical: spacing.md,
    paddingHorizontal: H_PAD,
  },
  row: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  iconBlock: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rightCol: {
    flex: 1,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 15.5,
    fontWeight: "700",
    letterSpacing: -0.3,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "500",
  },
  supports: {
    marginLeft: "auto",
  },
});
