/**
 * Central reference for navigation params.
 * Every screen should match the shape declared here.
 *
 * @typedef {Object} ScreenParams
 * @property {undefined} Home
 * @property {undefined} Profile
 * @property {undefined} Login
 * @property {undefined} Register
 * @property {undefined} RegisterSuccess
 * @property {undefined} ForgotPassword
 * @property {{ token: string }} ResetPassword
 */

export const SCREENS = /** @type {const} */ ({
  Home: "Home",
  Profile: "Profile",
  Login: "Login",
  Register: "Register",
  RegisterSuccess: "RegisterSuccess",
  ForgotPassword: "ForgotPassword",
  ResetPassword: "ResetPassword",
});
