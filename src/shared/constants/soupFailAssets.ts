import { soupFailUriSource, type SoupFailImageUriKey } from './soupFailImageUris';

/** 스프 꽝 결과 — 들어가는 문구별 전용 아트 */
export function getSoupFailImageSource(
    phrase: string,
    seed = 0,
): { uri: string } {
    return soupFailUriSource(pickSoupFailKey(phrase, seed));
}

export function pickSoupFailKey(phrase: string, seed = 0): SoupFailImageUriKey {
    if (phrase.includes('덜')) {
        return seed % 2 === 0 ? 'fail_undercooked_a' : 'fail_undercooked_b';
    }
    if (phrase.includes('다시')) {
        return 'fail_spill';
    }
    if (phrase.includes('아쉬운')) {
        return 'fail_sprout';
    }
    const pool: SoupFailImageUriKey[] = [
        'fail_sprout',
        'fail_spill',
        'fail_undercooked_a',
    ];
    return pool[Math.abs(seed) % pool.length] ?? 'fail_sprout';
}

export function isUndercookedFailPhrase(phrase: string): boolean {
    return phrase.includes('덜');
}
