import { createStackNavigator } from "@react-navigation/stack";
import { HomeScreen } from "@/screens/HomeScreen/HomeScreen";
import { ProfileScreen } from "@/screens/ProfileScreen/ProfileScreen";
import { SCREENS } from "./params";

const Stack = createStackNavigator();

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: "slide_from_right",
        headerShown: true,
      }}
    >
      <Stack.Screen
        name={SCREENS.Home}
        component={HomeScreen}
        options={{ title: "Home" }}
      />
      <Stack.Screen
        name={SCREENS.Profile}
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Stack.Navigator>
  );
}
