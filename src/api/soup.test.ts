import type { SoupCraftResponse } from './notion/types';

/**
 * `./client`는 디바이스 모듈(@apps-in-toss/framework)에 의존해 테스트 런타임 밖에서
 * 실제 구현을 로드할 수 없다. apiRequest/ApiClientError를 자체 mock으로 완전히 대체한다.
 * (mock 클래스는 factory 안에서만 정의해 import 호이스팅 순서 문제를 피한다.)
 */
jest.mock('./client', () => {
    class ApiClientError extends Error {
        readonly code: string;
        readonly status: number;

        constructor(code: string, message: string, status: number) {
            super(message);
            this.name = 'ApiClientError';
            this.code = code;
            this.status = status;
        }
    }
    return {
        ApiClientError,
        apiRequest: jest.fn(),
        isApiEnabled: jest.fn(() => true),
        getApiBaseUrl: jest.fn(() => 'https://mock.example.com'),
    };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const clientMock = require('./client') as {
    apiRequest: jest.Mock;
    ApiClientError: new (code: string, message: string, status: number) => Error & {
        code: string;
        status: number;
    };
};
const { apiRequest, ApiClientError } = clientMock;

import { mapSoupRerollResponse, postSoupReroll } from './soup';

const prevCraft: SoupCraftResponse = {
    soupId: 10,
    result: 'SUCCESS',
    recipeName: '토마토 스프',
    rewardType: 'ALMANG_POINT',
    rewardAmount: 40,
    rewardDescription: '소박한 보상',
    rewardGrade: 'SMALL',
};

function baseBeResponse(overrides: Partial<{
    soupId: number;
    rerollCostEcoJam: number;
    remainingEcoJam: number;
    rewardGrade: string;
    rewardEcoJam: number;
    rewardPoint: number;
    rewardedIngredients: Array<{ ingredientId: number; ingredientName: string; quantity: number }>;
}> = {}) {
    return {
        soupId: 10,
        rerollCostEcoJam: 70,
        remainingEcoJam: 30,
        rewardGrade: 'SMALL',
        rewardEcoJam: 0,
        rewardPoint: 80,
        rewardedIngredients: [],
        ...overrides,
    };
}

describe('mapSoupRerollResponse (순수 응답 매핑)', () => {
    it('BE rewardGrade를 FE 등급 표기로 매핑한다', () => {
        expect(mapSoupRerollResponse(baseBeResponse({ rewardGrade: 'CONSOLATION' }), prevCraft).rewardGrade).toBe(
            'FAIL',
        );
        expect(mapSoupRerollResponse(baseBeResponse({ rewardGrade: 'INGREDIENT' }), prevCraft).rewardGrade).toBe(
            'INGREDIENT',
        );
        expect(mapSoupRerollResponse(baseBeResponse({ rewardGrade: 'SMALL' }), prevCraft).rewardGrade).toBe('SMALL');
        expect(mapSoupRerollResponse(baseBeResponse({ rewardGrade: 'MIDDLE' }), prevCraft).rewardGrade).toBe(
            'MEDIUM',
        );
        expect(mapSoupRerollResponse(baseBeResponse({ rewardGrade: 'JACKPOT' }), prevCraft).rewardGrade).toBe(
            'JACKPOT',
        );
    });

    it('recipeName·rewardDescription은 이전 craft 값을 보존한다 (reroll 응답에는 없음)', () => {
        const mapped = mapSoupRerollResponse(baseBeResponse(), prevCraft);
        expect(mapped.recipeName).toBe('토마토 스프');
        expect(mapped.rewardDescription).toBe('소박한 보상');
    });

    it('rewardPoint가 있으면 rewardType ALMANG_POINT·rewardAmount로 반영한다', () => {
        const mapped = mapSoupRerollResponse(baseBeResponse({ rewardPoint: 80, rewardEcoJam: 0 }), prevCraft);
        expect(mapped.rewardType).toBe('ALMANG_POINT');
        expect(mapped.rewardAmount).toBe(80);
        expect(mapped.rewardPoint).toBe(80);
        expect(mapped.rewardEcoJam).toBeUndefined();
    });

    it('rewardEcoJam이 있으면 rewardType ECO_JAM으로 반영한다', () => {
        const mapped = mapSoupRerollResponse(baseBeResponse({ rewardPoint: 0, rewardEcoJam: 25 }), prevCraft);
        expect(mapped.rewardType).toBe('ECO_JAM');
        expect(mapped.rewardAmount).toBe(25);
        expect(mapped.rewardEcoJam).toBe(25);
    });

    it('rewardedIngredients가 있으면 첫 재료를 슬러그로 매핑한다', () => {
        const mapped = mapSoupRerollResponse(
            baseBeResponse({
                rewardPoint: 0,
                rewardEcoJam: 0,
                rewardedIngredients: [{ ingredientId: 1, ingredientName: '양파', quantity: 1 }],
            }),
            prevCraft,
        );
        expect(mapped.rewardIngredientId).toBeDefined();
    });

    it('INGREDIENT 등급이면 rewardAmount는 재료 quantity이고 에코잼과 섞지 않는다', () => {
        const mapped = mapSoupRerollResponse(
            baseBeResponse({
                rewardGrade: 'INGREDIENT',
                rewardPoint: 0,
                rewardEcoJam: 50,
                rewardedIngredients: [{ ingredientId: 1, ingredientName: '양파', quantity: 2 }],
            }),
            prevCraft,
        );
        expect(mapped.rewardGrade).toBe('INGREDIENT');
        expect(mapped.rewardAmount).toBe(2);
        expect(mapped.rewardEcoJam).toBe(50);
        expect(mapped.rewardIngredientId).toBeDefined();
    });

    it('보상이 전혀 없고 등급이 FAIL이면 result FAIL을 반환한다', () => {
        const mapped = mapSoupRerollResponse(
            baseBeResponse({ rewardGrade: 'CONSOLATION', rewardPoint: 0, rewardEcoJam: 0 }),
            prevCraft,
        );
        expect(mapped.result).toBe('FAIL');
    });
});

describe('postSoupReroll (공개 함수 계약)', () => {
    beforeEach(() => {
        apiRequest.mockReset();
    });

    it('성공 시 remainingEcoJam·rerollCostEcoJam·매핑된 craft를 함께 반환한다', async () => {
        apiRequest.mockResolvedValueOnce(baseBeResponse());
        const result = await postSoupReroll(10, prevCraft);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.remainingEcoJam).toBe(30);
            expect(result.rerollCostEcoJam).toBe(70);
            expect(result.craft.recipeName).toBe('토마토 스프');
        }
    });

    it('알려진 비즈니스 오류 코드는 ok:false + 동일 code로 반환한다', async () => {
        apiRequest.mockRejectedValueOnce(new ApiClientError('INSUFFICIENT_ECO_JAM', '부족', 400));
        const result = await postSoupReroll(10, prevCraft);
        expect(result).toEqual({ ok: false, code: 'INSUFFICIENT_ECO_JAM' });
    });

    it('SOUP_REROLL_ALREADY_COMPLETED도 ok:false + 동일 code로 반환한다', async () => {
        apiRequest.mockRejectedValueOnce(
            new ApiClientError('SOUP_REROLL_ALREADY_COMPLETED', '이미 사용', 409),
        );
        const result = await postSoupReroll(10, prevCraft);
        expect(result).toEqual({ ok: false, code: 'SOUP_REROLL_ALREADY_COMPLETED' });
    });

    it('USER_NOT_FOUND는 처리하지 않고 그대로 다시 던진다 (호출측 복구 재시도용)', async () => {
        apiRequest.mockRejectedValueOnce(new ApiClientError('USER_NOT_FOUND', '유저 없음', 404));
        await expect(postSoupReroll(10, prevCraft)).rejects.toBeInstanceOf(ApiClientError);
    });
});
