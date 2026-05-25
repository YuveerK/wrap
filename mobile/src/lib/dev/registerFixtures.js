/**
 * @typedef {Object} RegisterFormValues
 * @property {string} email
 * @property {string} phone
 * @property {string} password
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} streetAddress
 * @property {string} postalCode
 */

export const emptyRegisterValues = /** @type {RegisterFormValues} */ ({
  email: "",
  phone: "",
  password: "",
  firstName: "",
  lastName: "",
  streetAddress: "",
  postalCode: "",
});

/**
 * Valid register payload with unique email/phone per call (avoids 409 on repeat tests).
 * @returns {RegisterFormValues}
 */
export function getRegisterTestValues() {
  const suffix = Date.now().toString(36).slice(-6);
  return {
    email: `dev.${suffix}@wrap.test`,
    phone: `555123${suffix.slice(0, 4)}`,
    password: "password123",
    firstName: "Test",
    lastName: "User",
    streetAddress: "123 Test Street",
    postalCode: "12345",
  };
}
