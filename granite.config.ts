import { appsInToss } from '@apps-in-toss/framework/plugins';
import { hermes } from '@granite-js/plugin-hermes';
import { router } from '@granite-js/plugin-router';
import { defineConfig } from '@granite-js/react-native/config';
import { APP_DISPLAY_NAME, APP_NAME } from './app.config';

/**
 * `appName` must match the name registered in the Apps in Toss console.
 * 콘솔 등록명: zerost (표시명: 제로스트)
 */
export default defineConfig({
  appName: APP_NAME,
  /** Must be `intoss` for Apps in Toss (see official RN config docs). */
  scheme: 'intoss',
  plugins: [
    appsInToss({
      brand: {
        displayName: APP_DISPLAY_NAME,
        primaryColor: '#3182F6',
        icon: 'https://static.toss.im/icons/png/4x/icon-leaf-mono.png',
      },
      permissions: [{ name: 'camera', access: 'access' }],
    }),
    router(),
    hermes(),
  ],
});
