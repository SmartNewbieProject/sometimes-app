import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface StorageAdapter {
	getItem: (key: string) => Promise<string | null>;
	setItem: (key: string, value: string) => Promise<void>;
	removeItem: (key: string) => Promise<void>;
}

const nativeStorage: StorageAdapter = {
	getItem: AsyncStorage.getItem,
	setItem: AsyncStorage.setItem,
	removeItem: AsyncStorage.removeItem,
};

const webStorage: StorageAdapter = {
	getItem: async (key) => localStorage.getItem(key),
	setItem: async (key, value) => localStorage.setItem(key, value),
	removeItem: async (key) => localStorage.removeItem(key),
};

export const storage = Platform.OS === 'web' ? webStorage : nativeStorage;
