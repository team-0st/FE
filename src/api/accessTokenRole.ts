/** access JWT payload의 role 읽기 (서명 검증 없음 — UI 노출용) */
export type AccessTokenRole = 'USER' | 'ADMIN';

export function readAccessTokenRole(
    accessToken: string | null | undefined,
): AccessTokenRole | null {
    if (accessToken == null || accessToken.length === 0) {
        return null;
    }
    const parts = accessToken.split('.');
    const payloadPart = parts[1];
    if (parts.length < 2 || payloadPart == null || payloadPart.length === 0) {
        return null;
    }
    try {
        const payload = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
        const pad = '='.repeat((4 - (payload.length % 4)) % 4);
        const json = JSON.parse(atob(payload + pad)) as { role?: string };
        if (json.role === 'ADMIN' || json.role === 'USER') {
            return json.role;
        }
        return null;
    } catch {
        return null;
    }
}
