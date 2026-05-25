import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/Button/Button";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

/**
 * @param {Object} props
 * @param {() => void} props.onCompose
 */
export function FeedEmptyState({ onCompose }) {
  const { colors, scheme } = useTheme();
  const ringBg = scheme === "dark" ? colors.surface : "#FFF7ED";

  return (
    <View style={styles.wrap}>
      <View style={[styles.iconRing, { backgroundColor: ringBg }]}>
        <Ionicons name="chatbubbles" size={40} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>
        Your community feed is quiet
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Share road closures, events, or helpful updates — the kind of messages that
        get lost in group chats.
      </Text>
      <Button title="Write the first post" onPress={onCompose} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
});
