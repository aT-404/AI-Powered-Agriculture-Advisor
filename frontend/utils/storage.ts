import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryStorage: Record<string, string> = {};

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null) return val;
      return memoryStorage[key] || null;
    } catch (error) {
      console.warn(`[storage] Falling back to memory for key "${key}":`, error);
      return memoryStorage[key] || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      memoryStorage[key] = value;
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn(`[storage] Could not save to AsyncStorage, stored in memory:`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      delete memoryStorage[key];
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`[storage] Could not remove from AsyncStorage:`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      Object.keys(memoryStorage).forEach((k) => delete memoryStorage[k]);
      await AsyncStorage.clear();
    } catch (error) {
      console.warn('Error clearing storage:', error);
    }
  },
};

export default storage;
