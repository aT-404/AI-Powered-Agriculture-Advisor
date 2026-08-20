const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable .mjs and .cjs extension resolution for lucide-react-native and modern packages
config.resolver.sourceExts.push('mjs', 'cjs');

module.exports = config;
