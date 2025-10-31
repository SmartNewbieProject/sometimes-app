module.exports = (api) => {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "@babel/plugin-proposal-export-namespace-from",
      [
        "react-native-reanimated/plugin",
        {
          strict: false,
        },
      ],
    ],
    env: {
      web: {
        plugins: [
          [
            "module-resolver",
            {
              alias: {
                "react-native-google-mobile-ads": false,
                "@react-native-firebase/analytics": false,
                "@react-native-firebase/app": false,
              },
            },
          ],
        ],
      },
    },
  };
};
