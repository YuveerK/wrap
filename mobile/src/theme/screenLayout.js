import { StyleSheet } from "react-native";
import { spacing } from "./spacing";

/** ScrollView fills width so the indicator sits on the screen edge. */
export const scrollViewStyle = { flex: 1 };

const contentBase = {
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.xl * 2,
};

/** Form screens shown under a stack header — minimal top gap. */
export const scrollContentBelowHeader = StyleSheet.create({
  content: {
    ...contentBase,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
}).content;

/** Full-screen auth (no stack header), e.g. login. */
export const scrollContentFullScreen = StyleSheet.create({
  content: {
    ...contentBase,
    paddingTop: spacing.md,
    flexGrow: 1,
    justifyContent: "center",
    gap: spacing.md,
  },
}).content;
