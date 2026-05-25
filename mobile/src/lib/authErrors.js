import { ApiError } from "@/api/client";

/**
 * @param {unknown} error
 * @returns {string}
 */
export function getAuthErrorMessage(error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "INVALID_CREDENTIALS":
        return "Invalid email or password";
      case "EMAIL_NOT_VERIFIED":
        return "Please verify your email before logging in. Check your inbox for the verification link.";
      case "ACCOUNT_INACTIVE":
        return "Your account has been deactivated";
      case "RATE_LIMITED":
        return "Too many attempts. Please try again later.";
      default:
        return error.message;
    }
  }
  if (error instanceof Error) {
    if (error.message === "Network request failed") {
      return "Cannot reach the server. Check that the backend is running and EXPO_PUBLIC_API_URL points to your machine (Android emulator: http://10.0.2.2:3000/api).";
    }
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
