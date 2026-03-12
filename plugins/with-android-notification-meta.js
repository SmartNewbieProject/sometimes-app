const { withAndroidManifest } = require('expo/config-plugins');

const NOTIFICATION_COLOR_META = 'com.google.firebase.messaging.default_notification_color';

module.exports = function withAndroidNotificationMeta(config) {
	return withAndroidManifest(config, (config) => {
		const manifest = config.modResults.manifest;
		manifest.$ = manifest.$ || {};
		manifest.$['xmlns:tools'] = manifest.$['xmlns:tools'] || 'http://schemas.android.com/tools';

		const application = manifest.application?.[0];
		if (!application) {
			return config;
		}

		const metaData = application['meta-data'] || [];
		const target = metaData.find((item) => item.$?.['android:name'] === NOTIFICATION_COLOR_META);
		if (target?.$) {
			target.$['tools:replace'] = 'android:resource';
		}

		application['meta-data'] = metaData;
		return config;
	});
};
