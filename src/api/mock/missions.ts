import type { Mission } from './types';

/** 멘토링 기준: 일상 실천 미션 (샵 방문만 측정하지 않음) */
export const DAILY_MISSIONS: Mission[] = [
    {
        id: 'tumbler',
        kind: 'daily',
        title: '텀블러 챙기기',
        description: '외출 전 텀블러를 챙겨요.',
        points: 20,
        emoji: '☕️',
        authHint: '텀블러 사진 1장',
    },
    {
        id: 'bag',
        kind: 'daily',
        title: '장바구니 사용하기',
        description: '마트·편의점에서 장바구니를 사용해요.',
        points: 20,
        emoji: '🛍️',
        authHint: '장바구니 사용 사진 1장',
    },
    {
        id: 'transit',
        kind: 'daily',
        title: '대중교통 이용하기',
        description: '가까운 거리는 대중교통으로 이동해요.',
        points: 25,
        emoji: '🚌',
        authHint: '교통카드·탑승 인증 사진 1장',
    },
    {
        id: 'visit-not-delivery',
        kind: 'daily',
        title: '배달 대신 방문하기',
        description: '배달 대신 직접 가거나 포장해 와요.',
        points: 25,
        emoji: '🚶',
        authHint: '방문·포장 인증 사진 1장',
    },
    {
        id: 'recycle',
        kind: 'daily',
        title: '분리수거하기',
        description: '올바르게 분리수거해요.',
        points: 30,
        emoji: '♻️',
        authHint: '분리수거 사진 1장',
    },
];

export const ALL_MISSIONS: Mission[] = DAILY_MISSIONS;

export function getMissionById(id: string): Mission | undefined {
    return ALL_MISSIONS.find((mission) => mission.id === id);
}

export function missionStatusLabel(status: 'available' | 'pending_review' | 'completed'): string {
    if (status === 'completed') {
        return '완료';
    }
    if (status === 'pending_review') {
        return '검수 중';
    }
    return '미완료';
}
