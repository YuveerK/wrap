import { SCREENS } from "./params";

export const linking = {
  prefixes: ["wrap://", "https://wrap.example.com"],
  config: {
    screens: {
      [SCREENS.Home]: "",
      [SCREENS.Profile]: "user/:userId",
      [SCREENS.Login]: "login",
      [SCREENS.Register]: "register",
      [SCREENS.ForgotPassword]: "forgot-password",
      [SCREENS.ResetPassword]: "reset-password/:token",
    },
  },
};
