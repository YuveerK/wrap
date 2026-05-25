import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * @param {string} key
 * @param {string} value
 */
export async function setItem(key, value) {
  await AsyncStorage.setItem(key, value);
}

/**
 * @param {string} key
 * @returns {Promise<string | null>}
 */
export async function getItem(key) {
  return AsyncStorage.getItem(key);
}

/**
 * @param {string} key
 */
export async function removeItem(key) {
  await AsyncStorage.removeItem(key);
}
