const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname)

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
};

config.server = {
  port: 3000,
};

config.watchFolders = [__dirname];

module.exports = config
