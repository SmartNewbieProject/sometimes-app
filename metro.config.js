const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname)

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  // import.meta 지원을 위한 설정
  unstable_allowRequireContext: true,
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
  // ESM 패키지 지원
  unstable_enablePackageExports: true,
};

config.server = {
  port: 3000,
};

config.watchFolders = [__dirname];

module.exports = config