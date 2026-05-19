import { appsInToss } from '@apps-in-toss/framework/plugins';
import { hermes } from '@granite-js/plugin-hermes';
import { router } from '@granite-js/plugin-router';
import { defineConfig } from '@granite-js/react-native/config';

/**
 * `appName` must match the name registered in the Apps in Toss console.
 * Update before sandbox / production testing.
 */
export default defineConfig({
  appName: 'zero-start',
  scheme: 'granite',
  plugins: [
    appsInToss({
      brand: {
        displayName: '제로스타트',
        primaryColor: '#3182F6',
        icon: '',
      },
      permissions: [],
    }),
    router(),
    hermes(),
  ],
});
