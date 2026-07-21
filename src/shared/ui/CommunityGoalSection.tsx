import {
    getCommunityGoalProgressPercent,
    PILOT_COMMUNITY_GOAL,
} from '../constants/communityGoalMock';
import { HOME_DECOR, progressCheerSource } from '../constants/homeDecorAssets';
import { ProgressBar, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { BrandEmojiImage } from './BrandEmojiImage';

const CHEER_SIZE = 22;
const HERO_SIZE = 52;

export function CommunityGoalSection() {
    const goal = PILOT_COMMUNITY_GOAL;
    const percent = getCommunityGoalProgressPercent(goal);
    const cheer = progressCheerSource(percent);

    return (
        <View style={styles.wrap}>
            <View style={styles.headerRow}>
                <Txt typography="t6" fontWeight="semibold" style={styles.title}>
                    {goal.title} · {percent}%
                </Txt>
                <BrandEmojiImage
                    source={HOME_DECOR.homeHero}
                    size={HERO_SIZE}
                    containerStyle={styles.hero}
                    accessibilityLabel="제로와 스티"
                />
            </View>
            <Txt typography="t7" color="grey600">
                {goal.description}
            </Txt>
            <View style={styles.barRow}>
                <ProgressBar
                    progress={percent}
                    size="normal"
                    color={colors.success}
                    style={styles.bar}
                />
                <BrandEmojiImage
                    source={cheer}
                    size={CHEER_SIZE}
                    containerStyle={styles.cheer}
                    accessibilityLabel="진행 응원 캐릭터"
                />
            </View>
            <Txt typography="t7" color="grey500" style={styles.meta}>
                {goal.current}
                {goal.unit} / 목표 {goal.target}
                {goal.unit}
            </Txt>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        gap: 6,
    },
    headerRow: {
        minHeight: HERO_SIZE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    title: {
        flex: 1,
    },
    hero: {
        flexShrink: 0,
        marginRight: 0,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    bar: {
        flex: 1,
    },
    cheer: {
        marginRight: 0,
        flexShrink: 0,
    },
    meta: {
        textAlign: 'right',
    },
});
