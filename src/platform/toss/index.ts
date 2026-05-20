/**
 * Toss / Apps in Toss bridge helpers.
 * Wire Toss login and native APIs here when BE contracts are ready.
 */
import { APP_SCHEME } from '@shared/constants/app';

export const tossPlatform = {
  schemePrefix: 'intoss://',
  appScheme: APP_SCHEME,
} as const;
