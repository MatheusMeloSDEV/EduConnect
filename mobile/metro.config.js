
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Obter a configuração padrão
const config = getDefaultConfig(__dirname);

// Garantir que resolvemos node_modules apenas do diretório mobile
// Isso evita que o Metro pegue 'react' ou 'react-native' do projeto raiz
// o que causa a violação de invariante "PlatformConstants".
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

// Observar apenas o diretório mobile para evitar rastrear o frontend web
config.watchFolders = [__dirname];

module.exports = config;
