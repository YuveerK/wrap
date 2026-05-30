import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme";

const GRID_HEIGHT = 232;
const GRID_GAP    = 2;

/**
 * Twitter-style image grid.
 *
 * @param {{
 *   images: { uri: string }[],
 *   onRemove?: (index: number) => void,
 *   onImagePress?: (index: number) => void,
 *   style?: object,
 * }} props
 *
 * Layouts:
 *   1 image  → full width
 *   2 images → side by side
 *   3+       → large left (full height, half width) + two stacked right
 *              last right cell shows a "+N" overlay if > 3
 */
export function MediaGrid({ images, onRemove, onImagePress, style }) {
  const { colors } = useTheme();
  if (!images?.length) return null;

  const canRemove = typeof onRemove === "function";
  const canPress  = typeof onImagePress === "function";

  function Cell({ index, children }) {
    return (
      <Pressable
        style={[styles.cell, { flex: 1 }]}
        onPress={canPress ? () => onImagePress(index) : undefined}
        disabled={!canPress}
      >
        {children}
      </Pressable>
    );
  }

  function RemoveBtn({ index }) {
    if (!canRemove) return null;
    return (
      <Pressable onPress={() => onRemove(index)} style={styles.removeBtn} hitSlop={6}>
        <View style={styles.removeBg}>
          <Ionicons name="close" size={12} color="#FFF" />
        </View>
      </Pressable>
    );
  }

  // ── 1 image ──────────────────────────────────────────────────────────
  if (images.length === 1) {
    return (
      <View style={[styles.container, { height: GRID_HEIGHT, backgroundColor: colors.background }, style]}>
        <Cell index={0}>
          <Image source={{ uri: images[0].uri }} style={styles.cellImage} />
          <RemoveBtn index={0} />
        </Cell>
      </View>
    );
  }

  // ── 2 images — side by side ──────────────────────────────────────────
  if (images.length === 2) {
    return (
      <View style={[styles.container, styles.row, { height: GRID_HEIGHT, gap: GRID_GAP, backgroundColor: colors.background }, style]}>
        {images.map((img, i) => (
          <Cell key={i} index={i}>
            <Image source={{ uri: img.uri }} style={styles.cellImage} />
            <RemoveBtn index={i} />
          </Cell>
        ))}
      </View>
    );
  }

  // ── 3+ images — large left + two stacked right ───────────────────────
  // If there are more than 3, a "+N more" overlay sits on the third cell.
  const extra = images.length - 3;
  return (
    <View style={[styles.container, styles.row, { height: GRID_HEIGHT, gap: GRID_GAP, backgroundColor: colors.background }, style]}>
      {/* Left: first image, full height */}
      <Cell index={0}>
        <Image source={{ uri: images[0].uri }} style={styles.cellImage} />
        <RemoveBtn index={0} />
      </Cell>

      {/* Right: images 2 & 3 stacked */}
      <View style={[styles.col, { flex: 1, gap: GRID_GAP, backgroundColor: colors.background }]}>
        <Cell index={1}>
          <Image source={{ uri: images[1].uri }} style={styles.cellImage} />
          <RemoveBtn index={1} />
        </Cell>

        <Cell index={2}>
          <Image source={{ uri: images[2].uri }} style={styles.cellImage} />
          {extra > 0 ? (
            <View style={styles.overflowOverlay}>
              <Text style={styles.overflowText}>+{extra}</Text>
            </View>
          ) : (
            <RemoveBtn index={2} />
          )}
        </Cell>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
  },
  col: {
    flexDirection: "column",
  },
  cell: {
    overflow: "hidden",
  },
  cellImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  removeBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  overflowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  overflowText: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
});
