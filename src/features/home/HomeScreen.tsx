import { getShopById } from '@api/mock';
import { Button, Txt } from '@toss/tds-react-native';
import { FlatList, StyleSheet, View } from 'react-native';
import { segmentLabel } from '../onboarding/surveyOptions';
import { useUser } from '../user/UserProvider';
import { isUserCheckedInToday, missionStatusFor, resolveShopName } from '../user/selectors';
import { DAILY_MISSIONS } from '@api/mock/missions';
import { getHomeGuideMessage } from '../../shared/constants/guideCopy';
import { GuideDialogue } from '../../shared/ui/GuideDialogue';
import { HomeHero } from '../../shared/ui/HomeHero';
import { MissionCard } from '../../shared/ui/MissionCard';
import { Screen } from '../../shared/ui/Screen';
import { SectionHeader } from '../../shared/ui/SectionHeader';
import { StatCard } from '../../shared/ui/StatCard';
import { WeekProgressSection } from '../../shared/ui/WeekProgressSection';

type HomeScreenProps = {
    onPressMissions: () => void;
    onPressMission: (id: string) => void;
    onPressShop: () => void;
    onPressOnboarding: () => void;
};

export function HomeScreen({
    onPressMissions,
    onPressMission,
    onPressShop,
    onPressOnboarding,
}: HomeScreenProps) {
    const { state, checkInToday } = useUser();
    const checkedIn = isUserCheckedInToday(state);
    const shop = state.shopId != null ? getShopById(state.shopId) : undefined;
    const shopName = resolveShopName(state.shopId);
    const guideMessage = getHomeGuideMessage(state);
    const segmentSummary =
        state.onboarding != null
            ? segmentLabel({
                  practitioner: state.onboarding.practitioner,
                  practitionerSegment: state.onboarding.practitionerSegment,
                  interestSegment: state.onboarding.interestSegment,
              })
            : null;

    return (
        <Screen scrollable>
            <HomeHero
                nickname={state.nickname}
                totalPoints={state.totalPoints}
                streakDays={state.streakDays}
                shopEmoji={shop?.emoji ?? '🏪'}
                shopName={shopName}
                shopArea={shop?.area ?? '샵 선택 필요'}
            />
            <GuideDialogue message={guideMessage} mood={checkedIn ? 'happy' : 'cheer'} compact />
            <View style={styles.statRow}>
                <StatCard
                    label="오늘 출석"
                    value={checkedIn ? '완료' : '미완료'}
                    hint={checkedIn ? undefined : '탭해서 체크'}
                    onPress={() => {
                        if (!checkedIn) {
                            void checkInToday();
                        }
                    }}
                />
                <StatCard label="내 샵" value={shopName} hint="샵 보기" onPress={onPressShop} />
            </View>
            <WeekProgressSection done={state.weeklyMissionDone} total={state.weeklyMissionTotal} />
            <SectionHeader title="오늘의 실천" actionLabel="전체" onPressAction={onPressMissions} />
            <FlatList
                horizontal
                data={DAILY_MISSIONS}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <MissionCard
                        mission={item}
                        status={missionStatusFor(state, item.id)}
                        onPress={() => onPressMission(item.id)}
                    />
                )}
                style={styles.missionList}
            />
            <Button size="large" type="primary" display="block" onPress={onPressMissions}>
                실천 미션 하러 가기
            </Button>
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
    segmentHint: {
        marginTop: 16,
        textAlign: 'center',
    },
    onboardingLink: {
        marginTop: 8,
        textAlign: 'center',
    },
});
