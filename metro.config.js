const { getDefaultConfig } = require('expo/metro-config');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const isDev = process.env.NODE_ENV !== 'production';
const useSentryMetro = process.env.DISABLE_SENTRY_METRO !== '1';

const config = useSentryMetro
	? getSentryExpoConfig(__dirname, {
			annotateReactComponents: !isDev,
			enableSourceContextInDevelopment: false,
		})
	: getDefaultConfig(__dirname);

if (isDev) {
	config.maxWorkers = 2;
}

const { transformer, resolver } = config;
const existingServer = config.server ?? {};

config.transformer = {
	...transformer,
	babelTransformerPath: require.resolve('react-native-svg-transformer'),
	// Enable import.meta support used by the app.
	unstable_allowRequireContext: true,
};

config.resolver = {
	...resolver,
	assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
	sourceExts: [...resolver.sourceExts, 'svg'],
	// Prefer package exports when libraries expose them.
	unstable_enablePackageExports: true,
};

config.server = {
	...existingServer,
	port: Number(process.env.EXPO_METRO_PORT ?? process.env.RCT_METRO_PORT ?? 3000),
};

module.exports = config;
