/**
 * Local Storage Helper Utilities
 * TODO: Replace with @react-native-async-storage/async-storage or expo-secure-store once installed
 */

// In-memory fallback mock storage for development/skeleton phase
const memoryStorage: Record<string, string> = {};

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      // TODO: Connect to AsyncStorage.getItem(key)
      return memoryStorage[key] || null;
    } catch (error) {
      console.error(`Error reading storage key "${key}":`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      // TODO: Connect to AsyncStorage.setItem(key, value)
      memoryStorage[key] = value;
    } catch (error) {
      console.error(`Error setting storage key "${key}":`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      // TODO: Connect to AsyncStorage.removeItem(key)
      delete memoryStorage[key];
    } catch (error) {
      console.error(`Error removing storage key "${key}":`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      // TODO: Connect to AsyncStorage.clear()
      Object.keys(memoryStorage).forEach((k) => delete memoryStorage[k]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

export default storage;
