import { useState } from "react";
import { Pressable, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as authApi from "@/api/auth";
import { Button } from "@/components/Button/Button";
import { FormField } from "@/components/FormField/FormField";
import { KeyboardAwareScrollView } from "@/components/KeyboardAwareScrollView/KeyboardAwareScrollView";
import { Screen } from "@/components/Screen/Screen";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { forgotPasswordSchema } from "@/lib/validation/authSchemas";
import { SCREENS } from "@/navigation/params";
import { useTheme } from "@/theme";
import { scrollContentBelowHeader } from "@/theme/screenLayout";

export function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const forgotMutation = useMutation({
    mutationFn: (data) => authApi.forgotPassword(data.email),
    onSuccess: (data) => {
      setFormError("");
      setSuccessMessage(
        data.message ??
          "If an account exists with that email, a reset link has been sent.",
      );
    },
    onError: (error) => {
      setSuccessMessage("");
      setFormError(getAuthErrorMessage(error));
    },
  });

  const onSubmit = (data) => {
    setFormError("");
    setSuccessMessage("");
    forgotMutation.mutate(data);
  };

  return (
    <Screen edges={["bottom"]} padded={false}>
      <KeyboardAwareScrollView
        contentContainerStyle={[
          scrollContentBelowHeader,
          { flexGrow: 1, justifyContent: "center" },
        ]}
      >
          <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>
            Forgot password
          </Text>
          <Text style={{ fontSize: 16, color: colors.textMuted }}>
            Enter your email and we will send you a reset link.
          </Text>

          {formError ? (
            <Text style={{ color: colors.danger, textAlign: "center" }}>
              {formError}
            </Text>
          ) : null}
          {successMessage ? (
            <Text style={{ color: colors.success, textAlign: "center" }}>
              {successMessage}
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
          />

          <Button
            title="Send reset link"
            onPress={handleSubmit(onSubmit)}
            disabled={forgotMutation.isPending}
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
      </KeyboardAwareScrollView>
    </Screen>
  );
}
