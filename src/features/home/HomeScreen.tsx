import { mockMissions, mockUser } from '@api/mock';
import { getOnboardingResult } from '@api/mock/onboardingState';
import { Button, Txt } from '@toss/tds-react-native';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { segmentLabel } from '../onboarding/surveyOptions';
import { HomeHeader } from '../../shared/ui/HomeHeader';
import { MissionCard } from '../../shared/ui/MissionCard';
import { Screen } from '../../shared/ui/Screen';
import { SectionHeader } from '../../shared/ui/SectionHeader';
import { StatCard } from '../../shared/ui/StatCard';
import { WeekProgressSection } from '../../shared/ui/WeekProgressSection';

type HomeScreenProps = {
    onPressMissions: () => void;
    onPressMission: (id: string) => void;
    onPressTeam: () => void;
    onPressRanking: () => void;
    onPressProfile: () => void;
    onPressOnboarding: () => void;
};

export function HomeScreen({
    onPressMissions,
    onPressMission,
    onPressTeam,
    onPressRanking,
    onPressProfile,
    onPressOnboarding,
}: HomeScreenProps) {
    const [checkedIn, setCheckedIn] = useState(mockUser.checkedInToday);
    const weeklyLabel = `이번 주 ${mockUser.weeklyMissionDone}/${mockUser.weeklyMissionTotal}`;
    const onboarding = getOnboardingResult();
    const segmentSummary =
        onboarding != null
            ? segmentLabel({
                  practitioner: onboarding.practitioner,
                  practitionerSegment: onboarding.practitionerSegment,
                  interestSegment: onboarding.interestSegment,
              })
            : null;

    return (
        <Screen scrollable>
            <HomeHeader
                nickname={mockUser.nickname}
                streakDays={mockUser.streakDays}
                weeklyLabel={weeklyLabel}
            />
            <View style={styles.statRow}>
                <StatCard
                    label="오늘 출석"
                    value={checkedIn ? '완료' : '미완료'}
                    hint={checkedIn ? undefined : '탭해서 체크'}
                    onPress={() => setCheckedIn(true)}
                />
                <StatCard
                    label="내 팀"
                    value={`${mockUser.teamName} 팀`}
                    hint="팀 보기"
                    onPress={onPressTeam}
                />
            </View>
            <WeekProgressSection done={mockUser.weeklyMissionDone} total={mockUser.weeklyMissionTotal} />
            <SectionHeader title="오늘의 미션" actionLabel="전체" onPressAction={onPressMissions} />
            <FlatList
                horizontal
                data={mockMissions}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <MissionCard mission={item} onPress={() => onPressMission(item.id)} />
                )}
                style={styles.missionList}
            />
            <View style={styles.actions}>
                <Button size="large" type="primary" onPress={onPressMissions}>
                    미션 하러 가기
                </Button>
                <Button size="medium" type="dark" style="weak" onPress={onPressRanking}>
                    주간 랭킹 보기
                </Button>
                <Button size="medium" type="dark" style="weak" onPress={onPressProfile}>
                    내 프로필
                </Button>
            </View>
            {segmentSummary != null ? (
                <Txt typography="t7" color="grey600" style={styles.segmentHint}>
                    {`내 상황: ${segmentSummary}`}
                </Txt>
            ) : null}
            <Txt typography="t7" color="blue500" style={styles.onboardingLink} onPress={onPressOnboarding}>
                시작 설문 다시 하기
            </Txt>
        </Screen>
    );
}

const styles = StyleSheet.create({
    statRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    missionList: {
        marginBottom: 20,
    },
    actions: {
        gap: 10,
    },
    segmentHint: {
        marginTop: 16,
        textAlign: 'center',
    },
    onboardingLink: {
        marginTop: 8,
        textAlign: 'center',
    },
});
