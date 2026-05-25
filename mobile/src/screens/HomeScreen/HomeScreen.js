import { Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Button } from "@/components/Button/Button";
import { Screen } from "@/components/Screen/Screen";
import { useAuth } from "@/hooks/useAuth";
import { SCREENS } from "@/navigation/params";
import { useTheme } from "@/theme";
import { styles } from "./HomeScreen.styles";

export function HomeScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { colors } = useTheme();

  return (
    <Screen edges={["bottom"]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Hello{user?.firstName ? `, ${user.firstName}` : ""}
      </Text>
      <Button
        title="View profile"
        onPress={() => navigation.navigate(SCREENS.Profile)}
      />
      <Button title="Log out" onPress={logout} variant="secondary" />
    </Screen>
  );
}
