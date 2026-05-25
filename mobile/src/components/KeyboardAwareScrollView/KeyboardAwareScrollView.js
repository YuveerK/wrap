import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { scrollViewStyle } from "@/theme/screenLayout";

/**
 * Scrollable form content that stays visible when the keyboard opens.
 * Uses stack header height for keyboardVerticalOffset when present.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children
 * @param {import('react-native').StyleProp<import('react-native').ViewStyle>} [props.style]
 * @param {import('react-native').StyleProp<import('react-native').ViewStyle>} [props.contentContainerStyle]
 * @param {number} [props.keyboardVerticalOffset] — extra offset beyond header height
 * @param {import('react-native').ScrollViewProps} [props.scrollViewProps]
 */
export function KeyboardAwareScrollView({
  children,
  style,
  contentContainerStyle,
  keyboardVerticalOffset = 0,
  ...scrollViewProps
}) {
  const headerHeight = useHeaderHeight();
  const offset = headerHeight + keyboardVerticalOffset;

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={offset}
    >
      <ScrollView
        style={scrollViewStyle}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
