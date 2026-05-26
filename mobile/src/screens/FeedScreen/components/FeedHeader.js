import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

export function FeedHeader({ hasUnread = false, onSearch, onNotifications }) {
  const { colors, semantic, isDark } = useTheme();
  const cardBg = semantic.cardBackground;
  const shadowColor = isDark ? "#000000" : "#0D1520";

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            YOUR NEIGHBOURHOOD
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>Community</Text>
        </View>

        <View style={styles.rightSlot}>
          <Pressable
            onPress={onSearch}
            style={({ pressed }) => [
              styles.iconBtn,
              {
                backgroundColor: cardBg,
                borderColor: colors.border,
                shadowColor,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Search"
          >
            <Ionicons name="search-outline" size={20} color={colors.text} />
          </Pressable>

          <Pressable
            onPress={onNotifications}
            style={({ pressed }) => [
              styles.iconBtn,
              {
                backgroundColor: cardBg,
                borderColor: colors.border,
                shadowColor,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
            {hasUnread ? (
              <View
                style={[styles.unreadDot, { backgroundColor: colors.primary }]}
              />
            ) : null}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  rightSlot: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: 4,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 20,
      },
      android: { elevation: 3 },
    }),
  },
  unreadDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
