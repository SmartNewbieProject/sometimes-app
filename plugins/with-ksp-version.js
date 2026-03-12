const { withGradleProperties } = require('expo/config-plugins');

const upsertGradleProperty = (properties, type, key, value) => {
	const existing = properties.find((item) => item.type === type && item.key === key);

	if (existing) {
		existing.value = value;
		return properties;
	}

	return [...properties, { type, key, value }];
};

const withKspVersion = (config) =>
	withGradleProperties(config, (propsConfig) => {
		propsConfig.modResults = upsertGradleProperty(
			propsConfig.modResults,
			'property',
			'kspVersion',
			'2.1.20-2.0.1',
		);

		return propsConfig;
	});

module.exports = withKspVersion;
