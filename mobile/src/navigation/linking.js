import { SCREENS } from "./params";

export const linking = {
  prefixes: ["wrap://", "https://wrap.example.com"],
  config: {
    screens: {
      Main: {
        screens: {
          FeedTab: {
            screens: {
              [SCREENS.Feed]: "feed",
              [SCREENS.CreatePost]: "feed/new",
            },
          },
          IssuesTab: {
            screens: {
              [SCREENS.IssuesList]: "issues",
              [SCREENS.IssueDetail]: "issues/:issueId",
              [SCREENS.CreateIssue]: "issues/new",
            },
          },
          ProfileTab: SCREENS.Profile,
        },
      },
      [SCREENS.Login]: "login",
      [SCREENS.Register]: "register",
      [SCREENS.ForgotPassword]: "forgot-password",
      [SCREENS.ResetPassword]: "reset-password/:token",
    },
  },
};
