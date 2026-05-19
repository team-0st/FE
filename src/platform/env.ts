export const platformEnv = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
  isDev: __DEV__,
} as const;
