/** 제로웨이스트 실천 여부 */
export type PractitionerAnswer = 'yes' | 'no';

/** 기존 실천자 세분화 */
export type PractitionerSegment =
    | 'steady'
    | 'restarting'
    | 'occasional';

/** 비실천·입문 사용자 세분화 */
export type InterestSegment =
    | 'new_interest'
    | 'had_interest_hard'
    | 'just_exploring';

export type OnboardingResult = {
    practitioner: PractitionerAnswer;
    practitionerSegment?: PractitionerSegment;
    interestSegment?: InterestSegment;
};
