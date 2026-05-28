import { getIngredientById } from '@api/mock/ingredients';
import { getShopById } from '@api/mock';
import { DAILY_MISSIONS } from '@api/mock/missions';
import { Button } from '@toss/tds-react-native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useUser } from '../user/UserProvider';
import { isUserCheckedInToday, missionStatusFor, resolveShopName } from '../user/selectors';
import { getHomeGuideMessage } from '../../shared/constants/guideCopy';
import { GuideHero } from '../../shared/ui/GuideHero';
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
};

export function HomeScreen({ onPressMissions, onPressMission, onPressShop }: HomeScreenProps) {
    const { state, checkInToday } = useUser();
    const checkedIn = isUserCheckedInToday(state);
    const [todayRewardLabel, setTodayRewardLabel] = useState<string | null>(null);
    const handleCheckIn = useCallback(async () => {
        if (checkedIn) {
            return;
        }
        const result = await checkInToday();
        if (result.ok) {
            const ingredient = getIngredientById(result.data.reward.ingredientId);
            if (ingredient != null) {
                setTodayRewardLabel(`${ingredient.emoji} ${ingredient.name}`);
            }
        }
    }, [checkInToday, checkedIn]);
    const shop = state.shopId != null ? getShopById(state.shopId) : undefined;
    const shopName = resolveShopName(state.shopId);
    const guideMessage = getHomeGuideMessage(state);

    return (
        <Screen scrollable contentCentered>
            <View style={styles.heroSection}>
                <HomeHero
                    nickname={state.nickname}
                    totalPoints={state.totalPoints}
                    streakDays={state.streakDays}
                    shopEmoji={shop?.emoji ?? '🏪'}
                    shopName={shopName}
                    shopArea={shop?.area ?? '샵 선택 필요'}
                />
                <GuideHero
                    message={guideMessage}
                    mood={checkedIn ? 'happy' : 'cheer'}
                    size="large"
                    animate
                    compact
                />
            </View>
            <View style={styles.body}>
                <View style={styles.statRow}>
                    <StatCard
                        label="오늘 출석"
                        value={checkedIn ? '완료' : '미완료'}
                        hint={checkedIn ? (todayRewardLabel ?? '오늘의 재료를 받았어요') : '탭하면 재료 1개'}
                        hintTone="action"
                        onPress={() => {
                            void handleCheckIn();
                        }}
                        accessibilityLabel="오늘 출석하기"
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
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    heroSection: {
        width: '100%',
        alignItems: 'center',
    },
    body: {
        width: '100%',
    },
    statRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    missionList: {
        marginBottom: 20,
    },
});
