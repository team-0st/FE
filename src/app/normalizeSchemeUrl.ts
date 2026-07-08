import { APP_NAME } from '../shared/constants/app';

/** 샌드박스·콘솔에 legacy 호스트명으로 열릴 때 appName(0st)으로 정규화 */
const LEGACY_SCHEME_HOSTS = new Set(['zerost', 'zer0st']);

export function normalizeSchemeUrl(initialScheme: string | undefined): string | undefined {
    if (!initialScheme) {
        return undefined;
    }
    const decoded = decodeURI(initialScheme);
    const scheme = decoded.replace(/^intoss-private:/, 'intoss:');
    try {
        const url = new URL(scheme);
        if (url.hostname === 'appsintoss') {
            const path = url.pathname && url.pathname !== '/' ? url.pathname : '';
            return `intoss://${APP_NAME}${path}${url.search}`;
        }
        if (LEGACY_SCHEME_HOSTS.has(url.hostname)) {
            const path = url.pathname && url.pathname !== '/' ? url.pathname : '';
            return `intoss://${APP_NAME}${path}${url.search}`;
        }
    } catch {
        return scheme;
    }
    return scheme;
}
