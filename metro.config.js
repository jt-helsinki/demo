const { withNativeWind } = require("nativewind/metro");
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

let config = getSentryExpoConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./src/global.css",
  inlineRem: 16,
  configPath: "./tailwind.config.js",
});
