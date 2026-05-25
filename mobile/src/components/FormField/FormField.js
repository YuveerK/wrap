import { Controller } from "react-hook-form";
import { TextInput } from "@/components/TextInput/TextInput";

/**
 * @param {Object} props
 * @param {import('react-hook-form').Control} props.control
 * @param {string} props.name
 * @param {string} [props.label]
 * @param {import('react-hook-form').FieldErrors} props.errors
 * @param {import('react-native').TextInputProps} [props.inputProps]
 */
export function FormField({ control, name, label, errors, ...inputProps }) {
  const error = errors[name]?.message;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          label={label}
          value={value ?? ""}
          onChangeText={onChange}
          onBlur={onBlur}
          error={typeof error === "string" ? error : undefined}
          {...inputProps}
        />
      )}
    />
  );
}
