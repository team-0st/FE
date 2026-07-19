/**
 * 앱인토스 오픈 정책(자금세탁·현금성 교환 금지)에 맞춘 알맹 포인트 표기.
 * - 앱 내: 적립·조회만
 * - 이용: 제휴 매장(알맹상점) 방문 후 매장 절차
 * - 금지 뉘앙스: 출금·환전·환불·현금화·앱 내 교환
 * @see https://developers-apps-in-toss.toss.im/intro/guide.html
 */

export const ALMANG_COMPLIANCE = {
    /** 짧은 고지 (온보딩·마이) */
    noCashInApp:
        '앱 안에서는 현금으로 바꾸거나 환불·출금할 수 없어요.\n알맹 포인트는 제휴 매장(알맹상점)에서만 이용해요.',
    /** 한 줄 */
    noCashInAppOneLine: '앱 내 현금 교환·환불·출금 없음 · 매장에서만 이용',
    /** 에코잼과의 관계 */
    ecoJamSeparate: '에코잼은 게임 안 재화예요. 알맹 포인트와 바꾸거나 현금화할 수 없어요.',
} as const;

export const ALMANG_UI_COPY = {
    label: '알맹 포인트',
    accruedSuffix: '적립',
    storeOnlyHint: '매장 방문 후 이용',
    pendingStoreLink: '매장 연동 대기',
    bannerTitle: '알맹 포인트 · 매장 이용 안내',
    bannerBody:
        '포인트가 앱에 적립됐어요.\n앱에서 현금으로 바꾸거나 환불할 수 없어요.\n알맹상점에 방문해 본인 확인 후 매장 포인트로 이용해 주세요.',
    phoneConsentPurpose: '알맹상점 매장 본인 확인 및 제휴 매장 포인트 연동',
    phoneConsentItems: '휴대전화번호',
    phoneConsentRetention: '회원 탈퇴 또는 매장 포인트 연동 종료 후 3년(관련 법령이 더 긴 경우 그 기간)',
    phoneConsentRefuse:
        '동의를 거부할 수 있어요.\n거부 시에도 앱 이용·포인트 적립은 가능해요.\n다만 매장에서 포인트를 이용하려면 알맹상점 방문과 본인 확인이 필요해요.',
    phoneCheckbox:
        '[선택] 알맹상점 매장 포인트 연동을 위한 휴대전화번호 수집·이용에 동의해요.',
    skipModalBody:
        '알맹 포인트는 앱에 적립될 수 있어요.\n앱에서 현금으로 바꾸거나 환불할 수 없고,\n매장에서 이용하려면 알맹상점에 직접 방문해 주세요.',
    payoutHint:
        '동의하지 않아도 앱 이용·적립은 가능해요.\n매장에서 쓰려면 알맹상점 방문이 필요해요.\n앱 내 현금 교환·환불·출금은 없어요.',
} as const;
