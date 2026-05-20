import { APP_NAME } from '../shared/constants/app';

/**
 * Maps console QR test schemes to Granite router URLs.
 * @see https://developers-apps-in-toss.toss.im/development/test/toss.html
 */
export function normalizeSchemeUrl(
  initialScheme: string | undefined,
): string | undefined {
  if (!initialScheme) {
    return undefined;
  }
  const decoded = decodeURI(initialScheme);
  const scheme = decoded.replace(/^intoss-private:/, 'intoss:');
  try {
    const url = new URL(scheme);
    if (url.hostname === 'appsintoss') {
      const path =
        url.pathname && url.pathname !== '/' ? url.pathname : '';
      return `intoss://${APP_NAME}${path}${url.search}`;
    }
  } catch {
    return scheme;
  }
  return scheme;
}
