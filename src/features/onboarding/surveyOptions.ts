import type { InterestSegment, PractitionerSegment } from '../../api/mock/onboardingTypes';

export const PRACTITIONER_OPTIONS: { value: 'yes' | 'no'; label: string; description: string }[] = [
    {
        value: 'yes',
        label: '네, 실천하고 있어요',
        description: '텀블러·분리수거 등 제로웨이스트를 해본 적이 있어요',
    },
    {
        value: 'no',
        label: '아니요, 아직은요',
        description: '관심은 있거나, 이제 시작하려고 해요',
    },
];

export const EXPERIENCE_OPTIONS: { value: PractitionerSegment; label: string; description: string }[] = [
    {
        value: 'steady',
        label: '꾸준히 실천 중이에요',
        description: '일상에서 지속적으로 실천하고 있어요',
    },
    {
        value: 'restarting',
        label: '다시 시작하려고 해요',
        description: '예전에 하다가 잠시 멈췄거나, 새로 다짐 중이에요',
    },
    {
        value: 'occasional',
        label: '가끔 실천해요',
        description: '할 때는 하지만 아직 습관은 아니에요',
    },
];

export const INTEREST_OPTIONS: { value: InterestSegment; label: string; description: string }[] = [
    {
        value: 'new_interest',
        label: '이제 관심이 생겼어요',
        description: '예전엔 크게 신경 쓰지 않았는데, 최근 관심이 생겼어요',
    },
    {
        value: 'had_interest_hard',
        label: '관심은 있었는데 실천이 어려웠어요',
        description: '하고 싶었지만 환경·습관 때문에 막혔어요',
    },
    {
        value: 'just_exploring',
        label: '처음 알아보는 중이에요',
        description: '제로웨이스트가 무엇인지부터 알아보고 싶어요',
    },
];

export function segmentLabel(result: {
    practitioner: 'yes' | 'no';
    practitionerSegment?: PractitionerSegment;
    interestSegment?: InterestSegment;
}): string {
    if (result.practitioner === 'yes' && result.practitionerSegment != null) {
        const found = EXPERIENCE_OPTIONS.find((o) => o.value === result.practitionerSegment);
        return found?.label ?? '실천 중';
    }
    if (result.interestSegment != null) {
        const found = INTEREST_OPTIONS.find((o) => o.value === result.interestSegment);
        return found?.label ?? '시작 단계';
    }
    return '설문 완료';
}
