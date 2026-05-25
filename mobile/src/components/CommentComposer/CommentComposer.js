import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TextInput } from "@/components/TextInput/TextInput";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

/**
 * @param {Object} props
 * @param {string} value
 * @param {(text: string) => void} onChangeText
 * @param {() => void} onSubmit
 * @param {boolean} [disabled]
 * @param {string | null} [replyingTo]
 * @param {() => void} [onCancelReply]
 */
export function CommentComposer({
  value,
  onChangeText,
  onSubmit,
  disabled = false,
  replyingTo = null,
  onCancelReply,
}) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.background, borderTopColor: colors.border },
      ]}
    >
      {replyingTo ? (
        <View style={[styles.replyBar, { backgroundColor: colors.surface }]}>
          <Text style={[styles.replyLabel, { color: colors.textMuted }]}>
            Replying to {replyingTo}
          </Text>
          <Pressable onPress={onCancelReply} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : null}
      <View style={styles.row}>
        <View style={styles.inputWrap}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder="Add a comment…"
            inputProps={{ multiline: true }}
          />
        </View>
        <Pressable
          onPress={onSubmit}
          disabled={disabled || !value.trim()}
          style={({ pressed }) => [
            styles.send,
            { backgroundColor: colors.primary },
            (disabled || !value.trim()) && styles.sendDisabled,
            pressed && styles.sendPressed,
          ]}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  replyBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  replyLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  inputWrap: {
    flex: 1,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  sendDisabled: {
    opacity: 0.5,
  },
  sendPressed: {
    opacity: 0.88,
  },
});
