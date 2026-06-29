const { getDefaultConfig } = require('@expo/metro-config');
const exclusionList = require('metro-config/private/defaults/exclusionList').default;

const config = getDefaultConfig(__dirname);

module.exports = {
  ...config,
  resolver: {
    ...config.resolver,
    blockList: exclusionList([
      /functions\/node_modules\/.*$/,
      /android\/build\/.*$/,
      /android\/\.gradle\/.*$/,
      /ios\/Pods\/.*$/,
      /node_modules\/firebase\/compat\/.*$/,
      /node_modules\/firebase\/ai\/.*$/,
      /node_modules\/firebase\/firestore\/pipelines\/.*$/,
    ]),
  },
};
