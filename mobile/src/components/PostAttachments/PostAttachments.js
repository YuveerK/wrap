import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

/**
 * @param {Object} props
 * @param {Array<{ id: number, url: string, mimeType: string, originalName?: string }>} props.attachments
 */
export function PostAttachments({ attachments }) {
  const { colors } = useTheme();

  if (!attachments?.length) return null;

  return (
    <View style={styles.wrap}>
      {attachments.map((att) => {
        const url = resolveMediaUrl(att.url);
        const isImage = att.mimeType?.startsWith("image/");

        if (isImage && url) {
          return (
            <Image
              key={att.id}
              source={{ uri: url }}
              style={styles.image}
              resizeMode="cover"
            />
          );
        }

        return (
          <Pressable
            key={att.id}
            onPress={() => url && Linking.openURL(url)}
            style={[
              styles.fileRow,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={22}
              color={colors.primary}
            />
            <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
              {att.originalName ?? "Attachment"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md + 4,
    paddingBottom: spacing.md,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 12,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
});
