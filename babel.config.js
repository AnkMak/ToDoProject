// babel.config.js — Expo 專案的 Babel 設定
// 必須將 react-native-reanimated/plugin 放在 plugins 陣列最後面
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
