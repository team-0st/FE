/**
 * Shared brand constants for app runtime code.
 * Do not import this from `granite.config.ts` — `ait build` copies that
 * config into `.granite/` and relative imports break. Keep values in sync.
 */
export const APP_NAME = '0st' as const;
export const APP_DISPLAY_NAME = '제로스트' as const;
