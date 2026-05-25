import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as postsApi from "@/api/posts";
import { Button } from "@/components/Button/Button";
import { FormField } from "@/components/FormField/FormField";
import { Screen } from "@/components/Screen/Screen";
import { ApiError } from "@/api/client";
import { createPostSchema } from "@/lib/validation/postSchemas";
import { useTheme } from "@/theme";
import { scrollContentBelowHeader, scrollViewStyle } from "@/theme/screenLayout";
import { styles } from "./CreatePostScreen.styles";

export function CreatePostScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const [formError, setFormError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPostSchema),
    defaultValues: { title: "", body: "" },
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      postsApi.createPost({
        title: values.title?.trim() || undefined,
        body: values.body.trim(),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigation.goBack();
    },
    onError: (err) => {
      setFormError(
        err instanceof ApiError ? err.message : "Could not create post",
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
          <FormField
            control={control}
            name="title"
            label="Title (optional)"
            errors={errors}
          />
          <FormField
            control={control}
            name="body"
            label="Message"
            errors={errors}
            inputProps={{ multiline: true, numberOfLines: 5 }}
          />
          {formError ? (
            <Text style={[styles.error, { color: colors.danger }]}>
              {formError}
            </Text>
          ) : null}
          <Button
            title={mutation.isPending ? "Posting…" : "Post to feed"}
            onPress={handleSubmit((values) => mutation.mutate(values))}
            disabled={mutation.isPending}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
