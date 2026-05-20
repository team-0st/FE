import { appsInToss } from '@apps-in-toss/framework/plugins';
import { hermes } from '@granite-js/plugin-hermes';
import { router } from '@granite-js/plugin-router';
import { defineConfig } from '@granite-js/react-native/config';

/** Keep in sync with `app.config.ts` → APP_DISPLAY_NAME */
const APP_DISPLAY_NAME = '제로스트';

/**
 * `appName` must match the name registered in the Apps in Toss console.
 * Update before sandbox / production testing.
 */
export default defineConfig({
  appName: '0st',
  /** Must be `intoss` for Apps in Toss (see official RN config docs). */
  scheme: 'intoss',
  plugins: [
    appsInToss({
      brand: {
        displayName: APP_DISPLAY_NAME,
        primaryColor: '#3182F6',
        icon: 'https://static.toss.im/icons/png/4x/icon-leaf-mono.png',
      },
      permissions: [],
    }),
    router(),
    hermes(),
  ],
});
