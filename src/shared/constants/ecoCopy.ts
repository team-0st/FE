/**
 * 홈 화면 「내 미션」 하단 · 「내 주변 상점」 상단 연두색 환경 카피 카드.
 * 원문: Notion "환경 관련 카피 문구 + 제로스트의 목표 페이지" > 환경 관련 카피 문구.
 * 환경 소식·뉴스 10종 + 제로웨이스트 실천 멘트 13종 = 총 23종.
 * 하루 1회, 날짜 키 기반 결정적 선택으로 노출한다 (ecoCopyLogic.ts 참고).
 */

export type EcoCopyCategory = 'fact' | 'practice';

export type EcoCopyItem = {
    id: string;
    category: EcoCopyCategory;
    /** 한 줄 = 한 문장. 여러 문장이면 항목을 나눈다. */
    lines: readonly string[];
};

/** 1. 환경 소식 및 뉴스 (10종) — 검증된 핵심 수치만 보수적으로 사용 */
const ENVIRONMENT_FACT_ITEMS: readonly EcoCopyItem[] = [
    {
        id: 'fact-plastic-waste-per-year',
        category: 'fact',
        lines: [
            '매년 전 세계에서는 약 4억 톤의 플라스틱 폐기물이 발생합니다.',
            '일회용 플라스틱을 줄이는 작은 실천이 플라스틱 오염을 줄이는 첫걸음입니다.',
        ],
    },
    {
        id: 'fact-plastic-produced-since-1950',
        category: 'fact',
        lines: [
            '1950년 이후 인류가 생산한 플라스틱은 약 92억 톤이며, 이 중 약 70억 톤은 이미 폐기물이 되었습니다.',
        ],
    },
    {
        id: 'fact-plastic-annual-production',
        category: 'fact',
        lines: [
            '현재 전 세계에서는 매년 약 4억 6천만 톤의 플라스틱이 생산됩니다.',
            '생산량은 지난 20년 동안 두 배 이상 증가했습니다.',
        ],
    },
    {
        id: 'fact-plastic-packaging-share',
        category: 'fact',
        lines: [
            '전 세계 플라스틱의 약 36%는 포장재로 사용됩니다.',
            '대부분은 짧은 기간 사용된 뒤 폐기됩니다.',
        ],
    },
    {
        id: 'fact-plastic-greenhouse-gas',
        category: 'fact',
        lines: [
            '플라스틱은 생산부터 폐기까지 전 과정에서 약 18억 톤의 온실가스를 배출하며, 이는 전 세계 온실가스 배출량의 약 3%를 차지합니다.',
        ],
    },
    {
        id: 'fact-plastic-landfill-mismanaged',
        category: 'fact',
        lines: [
            '전 세계 플라스틱 폐기물의 약 46%는 매립되고, 약 22%는 적절히 관리되지 못한 채 환경으로 유출됩니다.',
        ],
    },
    {
        id: 'fact-plastic-ocean-inflow',
        category: 'fact',
        lines: [
            '매년 약 100만~200만 톤의 플라스틱이 바다로 유입됩니다.',
            '이는 전 세계 플라스틱 폐기물의 약 0.5%에 해당합니다.',
        ],
    },
    {
        id: 'fact-oecd-2060-outlook',
        category: 'fact',
        lines: [
            'OECD는 현재의 소비 방식이 유지될 경우, 전 세계 플라스틱 사용량이 2060년까지 약 3배 증가할 것으로 전망하고 있습니다.',
        ],
    },
    {
        id: 'fact-unep-3r',
        category: 'fact',
        lines: [
            'UNEP는 플라스틱 오염을 줄이기 위해 Reduce(줄이기), Reuse(재사용), Recycle(재활용)을 가장 중요한 해결책으로 제시하고 있습니다.',
        ],
    },
    {
        id: 'fact-plastic-fossil-fuel',
        category: 'fact',
        lines: [
            '플라스틱 대부분은 화석연료를 원료로 만들어집니다.',
            '플라스틱 사용을 줄이는 것은 탄소배출 감소에도 도움이 됩니다.',
        ],
    },
];

/** 2. 제로웨이스트 실천 멘트 (13종) */
const PRACTICE_TIP_ITEMS: readonly EcoCopyItem[] = [
    {
        id: 'practice-refuse-one-disposable',
        category: 'practice',
        lines: [
            '오늘 하루, 일회용품 하나만 거절해 보세요.',
            '생각보다 어렵지 않고, 생각보다 오래 기억에 남습니다.',
        ],
    },
    {
        id: 'practice-tumbler-10-seconds',
        category: 'practice',
        lines: [
            '집을 나가기 전 10초만 투자해 보세요.',
            '텀블러 하나가 오늘의 쓰레기를 하나 줄여줄 수도 있습니다.',
        ],
    },
    {
        id: 'practice-do-i-really-need-it',
        category: 'practice',
        lines: ["오늘 소비하려는 물건, '정말 필요한가?'를 한 번만 더 생각해 보세요."],
    },
    {
        id: 'practice-not-special-people',
        category: 'practice',
        lines: [
            '환경을 바꾸는 사람은 특별한 사람이 아닙니다.',
            '오늘 작은 실천을 시작한 사람이 그 주인공입니다.',
        ],
    },
    {
        id: 'practice-plastic-bag-refusal',
        category: 'practice',
        lines: [
            '혹시 오늘도 비닐봉투를 받을 예정이었나요?',
            '한 번의 거절이 새로운 습관의 시작이 될 수 있습니다.',
        ],
    },
    {
        id: 'practice-no-need-to-be-grand',
        category: 'practice',
        lines: ['환경을 위한 행동은 거창할 필요가 없습니다.', '오늘 단 하나의 미션이면 충분합니다.'],
    },
    {
        id: 'practice-ingredient-holds-practice',
        category: 'practice',
        lines: ['오늘 받은 재료 하나에는 지구를 위한 작은 실천 하나가 담겨 있습니다.'],
    },
    {
        id: 'practice-finish-todays-soup',
        category: 'practice',
        lines: [
            '오늘의 마녀스프를 완성해 보세요.',
            '당신의 작은 실천이 내일의 지구를 위한 재료가 됩니다.',
        ],
    },
    {
        id: 'practice-one-mission-this-week',
        category: 'practice',
        lines: [
            '이번 주 미션 하나만 완료해도 충분합니다.',
            '지속되는 작은 행동이 가장 큰 변화를 만듭니다.',
        ],
    },
    {
        id: 'practice-habit-continues-tomorrow',
        category: 'practice',
        lines: [
            '작은 실천은 하루면 끝나지만, 습관은 내일도 이어집니다.',
            '오늘의 미션으로 첫걸음을 시작해 보세요.',
        ],
    },
    {
        id: 'practice-only-you-can-complete',
        category: 'practice',
        lines: [
            '지구를 위한 행동은 누군가 대신해 줄 수 없습니다.',
            '오늘의 미션은 당신만이 완성할 수 있습니다.',
        ],
    },
    {
        id: 'practice-keep-practicing',
        category: 'practice',
        lines: [
            '완벽한 제로웨이스트보다 중요한 것은 계속 실천하는 것입니다.',
            '오늘도 하나의 행동을 이어가 보세요.',
        ],
    },
    {
        id: 'practice-change-one-daily-habit',
        category: 'practice',
        lines: [
            '환경을 바꾸는 가장 쉬운 방법은 내 일상 하나를 바꾸는 것입니다.',
            '지금, 오늘의 미션부터 시작해 보세요.',
        ],
    },
];

/** 환경 소식 10종 + 실천 멘트 13종 = 23종 */
export const ECO_COPY_ITEMS: readonly EcoCopyItem[] = [
    ...ENVIRONMENT_FACT_ITEMS,
    ...PRACTICE_TIP_ITEMS,
];
