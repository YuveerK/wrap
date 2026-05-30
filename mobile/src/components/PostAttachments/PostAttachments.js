import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MediaGrid } from "@/components/MediaGrid/MediaGrid";
import { MediaViewer } from "@/components/MediaViewer/MediaViewer";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

/**
 * @param {{ attachments: Array<{ id: number, url: string, mimeType: string, originalName?: string }> }} props
 */
export function PostAttachments({ attachments }) {
  const { colors } = useTheme();
  const [viewerIndex, setViewerIndex] = useState(null);

  if (!attachments?.length) return null;

  const imageAttachments = attachments.filter((a) => a.mimeType?.startsWith("image/"));
  const fileAttachments  = attachments.filter((a) => !a.mimeType?.startsWith("image/"));

  const gridImages = imageAttachments
    .map((a) => ({ uri: resolveMediaUrl(a.url) }))
    .filter((a) => Boolean(a.uri));

  return (
    <View style={styles.wrap}>
      {gridImages.length > 0 ? (
        <MediaGrid
          images={gridImages}
          onImagePress={(index) => setViewerIndex(index)}
        />
      ) : null}

      {fileAttachments.length > 0 ? (
        <View style={styles.files}>
          {fileAttachments.map((att) => {
            const url = resolveMediaUrl(att.url);
            return (
              <Pressable
                key={att.id}
                onPress={() => url && Linking.openURL(url)}
                style={[
                  styles.fileRow,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
                  {att.originalName ?? "Attachment"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <MediaViewer
        images={gridImages}
        initialIndex={viewerIndex ?? 0}
        visible={viewerIndex !== null}
        onClose={() => setViewerIndex(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  files: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
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
