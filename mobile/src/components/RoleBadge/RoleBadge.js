import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { hexAlpha } from "@/lib/issues";
import { useTheme } from "@/theme";

/**
 * Inline pill shown next to an author name for COMMITTEE / ADMIN roles.
 * @param {{ role: string }} props
 */
export function RoleBadge({ role }) {
  const { colors } = useTheme();

  if (role !== "COMMITTEE" && role !== "ADMIN") return null;

  const isAdmin = role === "ADMIN";
  const fg = isAdmin ? colors.primary : colors.success;
  const bg = isAdmin
    ? hexAlpha(colors.primary, 0.12)
    : hexAlpha(colors.success, 0.14);
  const label = isAdmin ? "Admin" : "Committee";

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Ionicons name="shield-checkmark" size={10} color={fg} />
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 6,
    paddingRight: 6,
    borderRadius: 999,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
