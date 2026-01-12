const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the default config
const config = getDefaultConfig(__dirname);

// Ensure we only resolve node_modules from the mobile directory
// This prevents Metro from picking up 'react' or 'react-native' from the root project
// which causes the "PlatformConstants" invariant violation.
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

// Only watch the mobile directory to avoid crawling the web frontend
config.watchFolders = [__dirname];

module.exports = config;