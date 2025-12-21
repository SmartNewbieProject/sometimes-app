module.exports = (api) => {
	api.cache(true);
	return {
		presets: ['babel-preset-expo'],
		plugins: [
			'babel-plugin-transform-import-meta',
			[
				'react-native-reanimated/plugin',
				{
					strict: false,
				},
			],
		],
	};
};
