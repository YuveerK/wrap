import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as authApi from "@/api/auth";
import { Button } from "@/components/Button/Button";
import { FormField } from "@/components/FormField/FormField";
import { Screen } from "@/components/Screen/Screen";
import { useAuth } from "@/hooks/useAuth";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { loginSchema } from "@/lib/validation/authSchemas";
import { SCREENS } from "@/navigation/params";
import { useTheme } from "@/theme";
import { scrollContentFullScreen, scrollViewStyle } from "@/theme/screenLayout";
import { styles } from "./LoginScreen.styles";

export function LoginScreen() {
  const navigation = useNavigation();
  const { setSession } = useAuth();
  const { colors } = useTheme();
  const [formError, setFormError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      setFormError("");
      await setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });
    },
    onError: (error) => {
      setFormError(getAuthErrorMessage(error));
    },
  });

  const onSubmit = (data) => {
    setFormError("");
    loginMutation.mutate(data);
  };

  return (
    <Screen edges={["top", "bottom"]} padded={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={scrollViewStyle}
          contentContainerStyle={scrollContentFullScreen}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Sign in to your account
          </Text>

          {formError ? (
            <Text style={[styles.formError, { color: colors.danger }]}>
              {formError}
            </Text>
          ) : null}

          <FormField
            control={control}
            name="email"
            label="Email"
            errors={errors}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
          />
          <FormField
            control={control}
            name="password"
            label="Password"
            errors={errors}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleSubmit(onSubmit)}
          />

          <Button
            title="Log in"
            onPress={handleSubmit(onSubmit)}
            disabled={loginMutation.isPending}
          />

          <Pressable onPress={() => navigation.navigate(SCREENS.ForgotPassword)}>
            <Text style={[styles.link, { color: colors.primary, textAlign: "center" }]}>
              Forgot password?
            </Text>
          </Pressable>

          <Pressable
            style={styles.linkRow}
            onPress={() => navigation.navigate(SCREENS.Register)}
          >
            <Text style={{ color: colors.textMuted }}>No account?</Text>
            <Text style={[styles.link, { color: colors.primary }]}>Register</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
