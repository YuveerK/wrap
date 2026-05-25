import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as authApi from "@/api/auth";
import { Button } from "@/components/Button/Button";
import { FormField } from "@/components/FormField/FormField";
import { Screen } from "@/components/Screen/Screen";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { resetPasswordSchema } from "@/lib/validation/authSchemas";
import { SCREENS } from "@/navigation/params";
import { useTheme } from "@/theme";
import { scrollContentBelowHeader, scrollViewStyle } from "@/theme/screenLayout";
import { spacing } from "@/theme/spacing";

/**
 * @typedef {Object} ResetPasswordRouteParams
 * @property {string} token
 */

export function ResetPasswordScreen() {
  const navigation = useNavigation();
  /** @type {{ params: ResetPasswordRouteParams }} */
  const route = useRoute();
  const { colors } = useTheme();
  const [formError, setFormError] = useState("");

  const token = route.params?.token;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const resetMutation = useMutation({
    mutationFn: (data) => authApi.resetPassword(token, data.password),
    onSuccess: () => {
      navigation.navigate(SCREENS.Login);
    },
    onError: (error) => {
      setFormError(getAuthErrorMessage(error));
    },
  });

  const onSubmit = (data) => {
    if (!token) {
      setFormError("Invalid reset link");
      return;
    }
    setFormError("");
    resetMutation.mutate(data);
  };

  if (!token) {
    return (
      <Screen edges={["bottom"]}>
        <Text style={{ color: colors.danger, textAlign: "center" }}>
          Invalid or missing reset link.
        </Text>
        <Button
          title="Back to login"
          onPress={() => navigation.navigate(SCREENS.Login)}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={["bottom"]} padded={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={scrollViewStyle}
          contentContainerStyle={[
            scrollContentBelowHeader,
            { flexGrow: 1, justifyContent: "center" },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>
            Reset password
          </Text>
          <Text style={{ fontSize: 16, color: colors.textMuted }}>
            Enter your new password below.
          </Text>

          {formError ? (
            <Text style={{ color: colors.danger, textAlign: "center" }}>
              {formError}
            </Text>
          ) : null}

          <FormField
            control={control}
            name="password"
            label="New password"
            errors={errors}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password-new"
          />
          <FormField
            control={control}
            name="confirmPassword"
            label="Confirm password"
            errors={errors}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Button
            title="Reset password"
            onPress={handleSubmit(onSubmit)}
            disabled={resetMutation.isPending}
          />

          <Pressable onPress={() => navigation.navigate(SCREENS.Login)}>
            <Text
              style={{
                color: colors.primary,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Back to login
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
