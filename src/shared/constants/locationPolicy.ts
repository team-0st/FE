/** 위치정보법·개인정보보호법 참고 — 주변 제휴 상점 안내용 */
export const LOCATION_POLICY_META = {
    title: '위치정보 이용 동의',
    version: '2026-05-01',
} as const;

export const LOCATION_POLICY_SECTIONS = [
    {
        heading: '수집·이용 목적',
        body: '내 주변 제휴 상점 안내, 직선 거리순 정렬, 지도 핀 표시',
    },
    {
        heading: '수집 항목',
        body: '기기 위치정보(위도·경도). 앱 사용 중 조회 시점의 위치만 사용해요.',
    },
    {
        heading: '보유·이용 기간',
        body: '조회 시점에 한해 이용하고, 서버에 위치 좌표를 저장하지 않아요. (동의 기록만 보관)',
    },
    {
        heading: '동의 거부 권리',
        body: '동의하지 않아도 앱 이용은 가능해요. 다만 가까운 순·직선 거리·지도 핀은 사용할 수 없고, 제휴 상점 목록만 볼 수 있어요.',
    },
] as const;

export const LOCATION_POLICY_LABELS = {
    confirmRead: '확인했어요',
    agree: '동의하고 주변 상점 보기',
    decline: '동의하지 않음',
    close: '닫기',
} as const;
