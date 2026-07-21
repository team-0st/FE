/**
 * 미션별 탄소배출량 절감 지표.
 * 출처: 팀 Notion 「탄소배출량 감소 지표」·「Option(즉시 피드백 카피)」 페이지.
 * grams가 null인 미션은 공식 절감량 자료가 없어 정성적 피드백 문구만 사용해요.
 */
export type CarbonReductionEntry = {
    grams: number | null;
    /** 미션 완료 직후 보여줄 즉시 피드백 문구 */
    feedbackCopy: string;
};

export const MISSION_CARBON_REDUCTION: Record<string, CarbonReductionEntry> = {
    tumbler: {
        grams: 40,
        feedbackCopy: '나무가 이틀 동안 마시는 숨과 같아요!',
    },
    bag: {
        grams: 43,
        feedbackCopy: '나무가 이틀 넘게 흡수하는 양을 지금 막았어요!',
    },
    recycle: {
        grams: 150,
        feedbackCopy: '나무가 일주일 넘게 흡수하는 양이에요!',
    },
    transit: {
        grams: 1800,
        feedbackCopy: '방금 나무 0.28그루를 심은 효과!',
    },
    /** 공식 수치 없음 — 텀블러·장바구니 수준으로 FE 자체 추정(일회성 사용 기준) */
    reusable: {
        grams: 35,
        feedbackCopy: '다회용기 사용으로 일회용품을 줄였어요!',
    },
    'pickup-not-delivery': {
        grams: null,
        feedbackCopy: '포장재 하나를 지켰어요!',
    },
    'almang-visit': {
        grams: null,
        feedbackCopy: '제로웨이스트 상점과 함께했어요!',
    },
    'refill-station': {
        grams: null,
        feedbackCopy: '새 용기 하나를 덜 만들었어요!',
    },
    plogging: {
        grams: null,
        feedbackCopy: '거리를 걸으며 쓰레기를 주웠어요!',
    },
};

export function getCarbonReduction(missionId: string): CarbonReductionEntry | undefined {
    return MISSION_CARBON_REDUCTION[missionId];
}

/** 1000g 이상이면 kg 단위로 소수점 첫째 자리까지 표시 */
export function formatCarbonGrams(grams: number): string {
    if (grams >= 1000) {
        const kg = Math.round((grams / 1000) * 10) / 10;
        return `${kg}kg`;
    }
    return `${grams}g`;
}
