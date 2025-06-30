import { Platform } from 'react-native';

type PlatformName = 'ios' | 'android' | 'web';
type PlatformCallback<T> = () => T;

type PlatformOptions<T> = {
	[K in PlatformName]?: PlatformCallback<T>;
} & {
	default?: PlatformCallback<T>;
};

export const platform = <T>(options: PlatformOptions<T>): T => {
	const currentPlatform = Platform.OS as PlatformName;

	if (options[currentPlatform]) {
		return options[currentPlatform]?.();
	}

	if (options.default) {
		return options.default();
	}

	throw new Error(`No handler for platform: ${currentPlatform}`);
};
