const { withGradleProperties } = require('expo/config-plugins');

const withKspVersion = (config) => {
  return withGradleProperties(config, (config) => {
    // expo-updates uses KSP 2.0.21-1.0.28 by default for Kotlin 2.0.21
    // No custom KSP settings needed - use expo-updates default
    return config;
  });
};

module.exports = withKspVersion;
