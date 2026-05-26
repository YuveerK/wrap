import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

export function FeedEmptyState({ onCompose }) {
  const { colors, semantic, isDark } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.iconContainer}>
        <View
          style={[styles.ring3, { backgroundColor: semantic.emptyStateRing }]}
        />
        <View
          style={[
            styles.ring2,
            { backgroundColor: isDark ? "#243347" : "#FDDEBF" },
          ]}
        />
        <View style={[styles.ring1, { backgroundColor: `${colors.primary}22` }]} />
        <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
          <Ionicons name="chatbubbles" size={34} color="#FFF" />
        </View>
      </View>

      <View style={styles.textBlock}>
        <Text style={[styles.heading, { color: colors.text }]}>No posts yet</Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          Be the first to start a conversation. Share an update, ask a question,
          or thank a neighbour.
        </Text>
      </View>

      <Pressable
        onPress={onCompose}
        style={({ pressed }) => [
          styles.cta,
          { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Write a post"
      >
        <Ionicons name="create-outline" size={18} color="#FFF" />
        <Text style={styles.ctaText}>Write a post</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 28,
    gap: spacing.md,
  },
  iconContainer: {
    width: 128,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
  },
  ring3: {
    position: "absolute",
    width: 128,
    height: 128,
    borderRadius: 64,
  },
  ring2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  ring1: {
    position: "absolute",
    width: 78,
    height: 78,
    borderRadius: 39,
  },
  iconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    alignItems: "center",
    gap: spacing.sm,
  },
  heading: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.4,
    textAlign: "center",
    marginTop: 4,
  },
  sub: {
    fontSize: 14.5,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 280,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.xl + 4,
    paddingVertical: spacing.md,
    borderRadius: 999,
    marginTop: 8,
  },
  ctaText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
