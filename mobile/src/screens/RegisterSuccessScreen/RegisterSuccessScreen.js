import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Button } from "@/components/Button/Button";
import { Screen } from "@/components/Screen/Screen";
import { SCREENS } from "@/navigation/params";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

export function RegisterSuccessScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <Screen edges={["bottom"]}>
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.md }}>
        <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>
          Check your email
        </Text>
        <Text style={{ fontSize: 16, color: colors.textMuted, lineHeight: 24 }}>
          We sent you a verification link. Please verify your email before logging in.
        </Text>
        <Button
          title="Back to login"
          onPress={() => navigation.navigate(SCREENS.Login)}
        />
      </View>
    </Screen>
  );
}
