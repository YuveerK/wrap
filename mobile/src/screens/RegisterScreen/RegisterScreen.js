import { useState } from "react";
import { Pressable, Switch, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/api/client";
import * as authApi from "@/api/auth";
import { Button } from "@/components/Button/Button";
import { FormField } from "@/components/FormField/FormField";
import { KeyboardAwareScrollView } from "@/components/KeyboardAwareScrollView/KeyboardAwareScrollView";
import { Screen } from "@/components/Screen/Screen";
import { getAuthErrorMessage } from "@/lib/authErrors";
import {
  emptyRegisterValues,
  getRegisterTestValues,
} from "@/lib/dev/registerFixtures";
import { registerSchema } from "@/lib/validation/authSchemas";
import { SCREENS } from "@/navigation/params";
import { useTheme } from "@/theme";
import { scrollContentBelowHeader } from "@/theme/screenLayout";
import { styles } from "./RegisterScreen.styles";

export function RegisterScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [formError, setFormError] = useState("");
  const [useTestData, setUseTestData] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: emptyRegisterValues,
  });

  const toggleTestData = (enabled) => {
    setUseTestData(enabled);
    setFormError("");
    reset(enabled ? getRegisterTestValues() : emptyRegisterValues);
  };

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      setFormError("");
      navigation.navigate(SCREENS.RegisterSuccess);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        setFormError("An account with this email or phone already exists");
      } else {
        setFormError(getAuthErrorMessage(error));
      }
    },
  });

  const onSubmit = (data) => {
    setFormError("");
    registerMutation.mutate(data);
  };

  return (
    <Screen edges={["bottom"]} padded={false}>
      <KeyboardAwareScrollView contentContainerStyle={scrollContentBelowHeader}>
          <Text style={[styles.title, { color: colors.text }]}>Create account</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Join your community on Wrap
          </Text>

          {formError ? (
            <Text style={[styles.formError, { color: colors.danger }]}>
              {formError}
            </Text>
          ) : null}

          {__DEV__ ? (
            <Pressable
              style={[styles.devRow, { backgroundColor: colors.surface }]}
              onPress={() => toggleTestData(!useTestData)}
            >
              <Text style={[styles.devLabel, { color: colors.textMuted }]}>
                Fill with test data (new email each time)
              </Text>
              <Switch
                value={useTestData}
                onValueChange={toggleTestData}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </Pressable>
          ) : null}

          <FormField control={control} name="firstName" label="First name" errors={errors} autoCapitalize="words" />
          <FormField control={control} name="lastName" label="Last name" errors={errors} autoCapitalize="words" />
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
          <FormField
            control={control}
            name="phone"
            label="Phone"
            errors={errors}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          <FormField control={control} name="streetAddress" label="Street address" errors={errors} />
          <FormField control={control} name="postalCode" label="Postal code" errors={errors} autoCapitalize="characters" />
          <FormField
            control={control}
            name="password"
            label="Password"
            errors={errors}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password-new"
          />

          <Button
            title="Register"
            onPress={handleSubmit(onSubmit)}
            disabled={registerMutation.isPending}
          />

          <Pressable
            style={styles.linkRow}
            onPress={() => navigation.navigate(SCREENS.Login)}
          >
            <Text style={{ color: colors.textMuted }}>Already have an account?</Text>
            <Text style={[styles.link, { color: colors.primary }]}>Log in</Text>
          </Pressable>
      </KeyboardAwareScrollView>
    </Screen>
  );
}
