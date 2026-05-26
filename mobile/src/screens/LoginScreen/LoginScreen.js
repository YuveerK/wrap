import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput as RNTextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "@/components/KeyboardAwareScrollView/KeyboardAwareScrollView";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import * as authApi from "@/api/auth";
import { Screen } from "@/components/Screen/Screen";
import { useAuth } from "@/hooks/useAuth";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { loginSchema } from "@/lib/validation/authSchemas";
import { SCREENS } from "@/navigation/params";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Email / password field matching the auth screen design */
function AuthField({ icon, label, error, secureTextEntry, trailing, ...inputProps }) {
  const { colors, semantic } = useTheme();
  const [secure, setSecure] = useState(secureTextEntry ?? false);

  return (
    <View style={fieldStyles.wrap}>
      <Text style={[fieldStyles.eyebrow, { color: colors.textMuted }]}>
        {label}
      </Text>
      <View
        style={[
          fieldStyles.container,
          {
            backgroundColor: semantic.cardBackground,
            borderColor: colors.border,
          },
          error ? { borderColor: colors.danger } : null,
        ]}
      >
        <Ionicons name={icon} size={18} color={colors.textMuted} />
        <RNTextInput
          style={[fieldStyles.input, { color: colors.text }]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secure}
          {...inputProps}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setSecure((s) => !s)} hitSlop={8}>
            <Ionicons
              name={secure ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={[fieldStyles.error, { color: colors.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { gap: 6 },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  error: {
    fontSize: 12.5,
    fontWeight: "500",
  },
});

export function LoginScreen() {
  const navigation = useNavigation();
  const { setSession } = useAuth();
  const { colors, semantic } = useTheme();
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

  const isPending = loginMutation.isPending;

  return (
    <Screen edges={["top", "bottom"]} padded={false} backgroundColor={colors.background}>
      {/* Background ornaments */}
      <View
        pointerEvents="none"
        style={[
          styles.orb1,
          { backgroundColor: hexAlpha(colors.primary, 0.14) },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.orb2,
          { backgroundColor: hexAlpha(colors.primary, 0.22) },
        ]}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo mark */}
        <View style={styles.logoWrap}>
          <View
            style={[
              styles.logoMark,
              {
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
              },
            ]}
          >
            <Text style={styles.logoLetter}>W</Text>
          </View>
        </View>

        {/* Title + subtitle */}
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.text }]}>
            Welcome back.
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {"Sign in to "}
            <Text style={{ color: colors.text, fontWeight: "700" }}>
              Wrap
            </Text>
            {"."}
          </Text>
        </View>

        {/* Fields */}
        <View style={styles.fields}>
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <AuthField
                icon="mail-outline"
                label="EMAIL"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                placeholder="you@example.com"
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur } }) => (
              <AuthField
                icon="lock-closed-outline"
                label="PASSWORD"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                placeholder="••••••••"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          <Pressable
            onPress={() => navigation.navigate(SCREENS.ForgotPassword)}
            style={styles.forgotWrap}
          >
            <Text style={[styles.forgotText, { color: colors.primary }]}>
              Forgot password?
            </Text>
          </Pressable>

          {formError ? (
            <Text style={[styles.formError, { color: colors.danger }]}>
              {formError}
            </Text>
          ) : null}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            style={({ pressed }) => [
              styles.signInBtn,
              {
                backgroundColor: colors.primary,
                opacity: isPending ? 0.7 : pressed ? 0.9 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            <Text style={styles.signInLabel}>
              {isPending ? "Signing in…" : "Sign in"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate(SCREENS.Register)}
            style={styles.joinRow}
          >
            <Text style={[styles.joinText, { color: colors.textMuted }]}>
              {"New to Wrap? "}
              <Text style={{ color: colors.primary, fontWeight: "700" }}>
                Join your estate
              </Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  orb1: {
    position: "absolute",
    top: -160,
    right: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    zIndex: -1,
  },
  orb2: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    zIndex: -1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.md + 4,
    paddingBottom: spacing.xl * 2,
    paddingTop: spacing.lg,
  },
  logoWrap: {
    alignItems: "flex-start",
    marginBottom: 28,
    marginTop: spacing.xl,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
      },
      android: { elevation: 10 },
    }),
  },
  logoLetter: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -1.6,
  },
  titleBlock: {
    gap: 6,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1.2,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  fields: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  forgotWrap: {
    alignSelf: "flex-end",
  },
  forgotText: {
    fontSize: 13.5,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  formError: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    marginTop: "auto",
    gap: spacing.md,
    paddingTop: spacing.xl,
  },
  signInBtn: {
    paddingVertical: spacing.md,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  signInLabel: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  joinRow: {
    alignItems: "center",
  },
  joinText: {
    fontSize: 14,
    textAlign: "center",
  },
});
