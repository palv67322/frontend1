const { override, removeModuleScopePlugin } = require('customize-cra');

module.exports = override(
  removeModuleScopePlugin(),
  (config) => {
    config.module.rules = config.module.rules.filter(
      (rule) => !rule.loader?.includes('source-map-loader')
    );
    return config;
  }
);