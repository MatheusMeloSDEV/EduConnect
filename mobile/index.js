
import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent chama AppRegistry.registerComponent('main', () => App);
// Também garante que, se você carregar o app no Expo Go ou em uma build nativa,
// o ambiente esteja configurado apropriadamente
registerRootComponent(App);
