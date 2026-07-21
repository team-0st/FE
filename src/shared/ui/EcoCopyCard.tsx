import { Txt } from '@toss/tds-react-native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { formatDateKey } from '../../features/user/userStateLogic';
import { selectDailyEcoCopy } from '../../features/home/ecoCopyLogic';
import { ECO_COPY_ITEMS } from '../constants/ecoCopy';
import { colors } from '../theme/colors';

const CARD_TITLE = '오늘의 환경 이야기';

/**
 * 홈 「내 미션」 하단 · 「내 주변 상점」 상단 — 연두색 환경 카피 카드.
 * 날짜 키 기준 하루 1회 결정적으로 선택되어 하루 동안 동일하고, 다음 날 바뀐다.
 */
export function EcoCopyCard() {
    const dateKey = useMemo(() => formatDateKey(new Date()), []);
    const copy = useMemo(() => selectDailyEcoCopy(ECO_COPY_ITEMS, dateKey), [dateKey]);

    return (
        <View style={styles.card} accessibilityRole="text">
            <Txt typography="t7" color="grey700" fontWeight="semibold" style={styles.title}>
                {CARD_TITLE}
            </Txt>
            {copy.lines.map((line) => (
                <Txt key={line} typography="t7" color="grey800" style={styles.line}>
                    {line}
                </Txt>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        backgroundColor: colors.ecoCopyBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.ecoCopyBorder,
        padding: 16,
        gap: 4,
    },
    title: {
        marginBottom: 2,
    },
    line: {
        lineHeight: 20,
    },
});
