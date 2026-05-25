import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

export function FeedEmptyState({ onCompose }) {
  const { colors, scheme } = useTheme();
  const isDark = scheme === "dark";

  return (
    <View style={styles.wrap}>
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.ring3,
            { backgroundColor: isDark ? "#1A2638" : "#FEF3EA" },
          ]}
        />
        <View
          style={[
            styles.ring2,
            { backgroundColor: isDark ? "#243347" : "#FDDEBF" },
          ]}
        />
        <View
          style={[styles.ring1, { backgroundColor: `${colors.primary}22` }]}
        />
        <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
          <Ionicons name="chatbubbles" size={34} color="#FFF" />
        </View>
      </View>

      <View style={styles.textBlock}>
        <Text style={[styles.heading, { color: colors.text }]}>
          Be the first to share
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          Road closures, local events, helpful tips — the kind of updates that
          make your neighborhood better connected.
        </Text>
      </View>

      <Pressable
        onPress={onCompose}
        style={({ pressed }) => [
          styles.cta,
          { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
        ]}
      >
        <Ionicons name="create-outline" size={18} color="#FFF" />
        <Text style={styles.ctaText}>Write the first post</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingTop: 64,
    paddingHorizontal: 36,
    gap: spacing.xl,
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
    gap: spacing.sm + 2,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  sub: {
    fontSize: 15.5,
    lineHeight: 23,
    textAlign: "center",
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.xl + 4,
    paddingVertical: spacing.md,
    borderRadius: 999,
  },
  ctaText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
