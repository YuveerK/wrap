import { create } from "zustand";

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} email
 * @property {string} phone
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} streetAddress
 * @property {string} postalCode
 * @property {string | null} [profilePhoto]
 * @property {string} role
 * @property {boolean} isVerified
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} AuthState
 * @property {User | null} user
 * @property {boolean} isLoading
 * @property {(user: User | null) => void} setUser
 * @property {(loading: boolean) => void} setLoading
 * @property {() => void} logout
 */

/** @type {import('zustand').UseBoundStore<import('zustand').StoreApi<AuthState>>} */
export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null }),
}));
