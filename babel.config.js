module.exports = (api) => {
	api.cache(true);
	return {
		presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
		plugins: [
			'@babel/plugin-proposal-export-namespace-from',
			['react-native-reanimated/plugin', {
				strict: false
			}],
			["module:react-native-dotenv", {
				"envName": "APP_ENV",
				"moduleName": "@env",
				"path": ".env",
				"safe": false,
				"allowUndefined": true,
			}]
		],
	};
};
