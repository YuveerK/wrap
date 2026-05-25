import { createStackNavigator } from "@react-navigation/stack";
import { ForgotPasswordScreen } from "@/screens/ForgotPasswordScreen/ForgotPasswordScreen";
import { LoginScreen } from "@/screens/LoginScreen/LoginScreen";
import { RegisterScreen } from "@/screens/RegisterScreen/RegisterScreen";
import { RegisterSuccessScreen } from "@/screens/RegisterSuccessScreen/RegisterSuccessScreen";
import { ResetPasswordScreen } from "@/screens/ResetPasswordScreen/ResetPasswordScreen";
import { SCREENS } from "./params";

const Stack = createStackNavigator();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name={SCREENS.Login}
        component={LoginScreen}
        options={{ title: "Log in", headerShown: false }}
      />
      <Stack.Screen
        name={SCREENS.Register}
        component={RegisterScreen}
        options={{ title: "Register" }}
      />
      <Stack.Screen
        name={SCREENS.RegisterSuccess}
        component={RegisterSuccessScreen}
        options={{ title: "Verify email", headerLeft: () => null }}
      />
      <Stack.Screen
        name={SCREENS.ForgotPassword}
        component={ForgotPasswordScreen}
        options={{ title: "Forgot password" }}
      />
      <Stack.Screen
        name={SCREENS.ResetPassword}
        component={ResetPasswordScreen}
        options={{ title: "Reset password" }}
      />
    </Stack.Navigator>
  );
}
