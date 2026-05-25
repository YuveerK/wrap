/**
 * Central reference for navigation params.
 *
 * @typedef {Object} ScreenParams
 * @property {undefined} Feed
 * @property {undefined} CreatePost
 * @property {undefined} IssuesList
 * @property {{ issueId: number }} IssueDetail
 * @property {undefined} CreateIssue
 * @property {undefined} Profile
 * @property {undefined} Login
 * @property {undefined} Register
 * @property {undefined} RegisterSuccess
 * @property {undefined} ForgotPassword
 * @property {{ token: string }} ResetPassword
 */

export const SCREENS = /** @type {const} */ ({
  Feed: "Feed",
  CreatePost: "CreatePost",
  IssuesList: "IssuesList",
  IssueDetail: "IssueDetail",
  CreateIssue: "CreateIssue",
  Profile: "Profile",
  Login: "Login",
  Register: "Register",
  RegisterSuccess: "RegisterSuccess",
  ForgotPassword: "ForgotPassword",
  ResetPassword: "ResetPassword",
});
