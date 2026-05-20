import type { Mission } from './types';
import type { MissionProgressStatus } from '../../features/user/types';

export const DAILY_MISSIONS: Mission[] = [
    {
        id: 'tumbler',
        kind: 'daily',
        title: '텀블러 사용하기',
        description: '일회용 컵 대신 텀블러를 사용해요.',
        points: 30,
        emoji: '☕️',
        authHint: '텀블러 사용 사진 1장',
    },
    {
        id: 'bag',
        kind: 'daily',
        title: '장바구니 챙기기',
        description: '마트·편의점에서 장바구니를 사용해요.',
        points: 20,
        emoji: '🛍️',
        authHint: '장바구니 사용 사진 1장',
    },
    {
        id: 'quiz',
        kind: 'daily',
        title: '환경 퀴즈 풀기',
        description: '오늘의 제로웨이스트 퀴즈에 참여해요.',
        points: 15,
        emoji: '💡',
        authHint: '퀴즈 완료 화면 캡처',
    },
];

export const WEEKLY_MISSIONS: Mission[] = [
    {
        id: 'recycle',
        kind: 'weekly',
        title: '분리수거 인증',
        description: '올바르게 분리수거한 사진을 남겨요.',
        points: 50,
        emoji: '♻️',
        authHint: '분리수거 사진 1장',
    },
    {
        id: 'team-plogging',
        kind: 'weekly',
        title: '팀 플로깅 참여',
        description: '팀과 함께 주변 쓰레기를 줍는 활동이에요.',
        points: 80,
        emoji: '🌿',
        authHint: '활동 인증 사진 1장',
    },
];

export const ALL_MISSIONS: Mission[] = [...DAILY_MISSIONS, ...WEEKLY_MISSIONS];

export function getMissionById(id: string): Mission | undefined {
    return ALL_MISSIONS.find((mission) => mission.id === id);
}

export function missionStatusLabel(status: MissionProgressStatus): string {
    if (status === 'completed') {
        return '완료';
    }
    if (status === 'pending_review') {
        return '검수 중';
    }
    return '미완료';
}
