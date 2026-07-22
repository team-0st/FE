import { readAccessTokenRole } from './accessTokenRole';

describe('readAccessTokenRole', () => {
    function tokenWithRole(role: string): string {
        const header = btoa(JSON.stringify({ alg: 'none' }));
        const payload = btoa(JSON.stringify({ sub: '9', role }));
        return `${header}.${payload}.sig`;
    }

    it('ADMIN role을 읽는다', () => {
        expect(readAccessTokenRole(tokenWithRole('ADMIN'))).toBe('ADMIN');
    });

    it('USER role을 읽는다', () => {
        expect(readAccessTokenRole(tokenWithRole('USER'))).toBe('USER');
    });

    it('잘못된 토큰은 null', () => {
        expect(readAccessTokenRole('not-a-jwt')).toBeNull();
        expect(readAccessTokenRole(null)).toBeNull();
    });
});
