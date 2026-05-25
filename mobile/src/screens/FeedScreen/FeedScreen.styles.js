import { Platform, StyleSheet } from "react-native";
import { spacing } from "@/theme/spacing";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.md,
  },
  listEmpty: {
    flexGrow: 1,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  syncing: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  separator: {
    height: spacing.md,
  },
  fab: {
    position: "absolute",
    right: spacing.md,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  fabPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.9,
  },
});
