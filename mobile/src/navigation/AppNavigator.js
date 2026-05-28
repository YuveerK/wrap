import { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { syncPushToken } from "@/lib/notifications";
import { MainTabNavigator } from "./MainTabNavigator";

const Stack = createStackNavigator();

export function AppNavigator() {
  useEffect(() => {
    syncPushToken();
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabNavigator} />
    </Stack.Navigator>
  );
}
