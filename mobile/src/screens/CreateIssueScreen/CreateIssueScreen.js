import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as issuesApi from "@/api/issues";
import { ApiError } from "@/api/client";
import { Button } from "@/components/Button/Button";
import { FormField } from "@/components/FormField/FormField";
import { Screen } from "@/components/Screen/Screen";
import { ISSUE_CATEGORIES, categoryLabels } from "@/lib/issues";
import { createIssueSchema } from "@/lib/validation/issueSchemas";
import { SCREENS } from "@/navigation/params";
import { useTheme } from "@/theme";
import { scrollContentBelowHeader, scrollViewStyle } from "@/theme/screenLayout";
import { styles } from "./CreateIssueScreen.styles";

export function CreateIssueScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const [formError, setFormError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      category: "OTHER",
      title: "",
      description: "",
      addressText: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      issuesApi.createIssue({
        category: values.category,
        title: values.title.trim(),
        description: values.description.trim(),
        addressText: values.addressText?.trim() || undefined,
      }),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ["issues"] });
      navigation.replace(SCREENS.IssueDetail, { issueId: res.issue.id });
    },
    onError: (err) => {
      setFormError(
        err instanceof ApiError ? err.message : "Could not report issue",
      );
    },
  });

  return (
    <Screen edges={["bottom"]} padded={false}>
      <KeyboardAvoidingView
        style={scrollViewStyle}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={scrollContentBelowHeader}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.label, { color: colors.text }]}>Category</Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { value, onChange } }) => (
              <View style={styles.chips}>
                {ISSUE_CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => onChange(cat)}
                    style={[
                      styles.chip,
                      {
                        borderColor: colors.border,
                        backgroundColor:
                          value === cat ? colors.primary : colors.surface,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: value === cat ? "#fff" : colors.text,
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {categoryLabels[cat]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          />
          {errors.category?.message ? (
            <Text style={{ color: colors.danger }}>{errors.category.message}</Text>
          ) : null}

          <FormField
            control={control}
            name="title"
            label="Short title"
            errors={errors}
          />
          <FormField
            control={control}
            name="description"
            label="What is happening?"
            errors={errors}
            inputProps={{ multiline: true, numberOfLines: 5 }}
          />
          <FormField
            control={control}
            name="addressText"
            label="Location (optional)"
            errors={errors}
          />
          {formError ? (
            <Text style={[styles.error, { color: colors.danger }]}>
              {formError}
            </Text>
          ) : null}
          <Button
            title={mutation.isPending ? "Submitting…" : "Submit report"}
            onPress={handleSubmit((values) => mutation.mutate(values))}
            disabled={mutation.isPending}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
