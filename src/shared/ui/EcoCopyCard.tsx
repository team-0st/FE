import { Button, Txt } from '@toss/tds-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { formatDateKey } from '../../features/user/userStateLogic';
import { selectDailyEcoCopy } from '../../features/home/ecoCopyLogic';
import { ECO_COPY_ITEMS, type EcoCopyItem } from '../constants/ecoCopy';
import { colors } from '../theme/colors';

const CARD_TITLE = '오늘의 환경 이야기';
const FACT_TITLE = '환경 소식';
const PRACTICE_TITLE = '실천 팁';

function EcoCopyGroup({
    title,
    items,
    highlight = false,
}: {
    title: string;
    items: readonly EcoCopyItem[];
    highlight?: boolean;
}) {
    return (
        <View style={styles.group}>
            <Txt typography="t6" color="grey900" fontWeight="bold">
                {title}
            </Txt>
            {items.map((item, index) => (
                <View
                    key={item.id}
                    style={[
                        styles.story,
                        index < items.length - 1 ? styles.storyDivider : null,
                        highlight ? styles.todayStory : null,
                    ]}
                >
                    {item.lines.map((line, index) => (
                        <Txt key={`${item.id}-${index}`} typography="t7" color="grey700" style={styles.line}>
                            {line}
                        </Txt>
                    ))}
                </View>
            ))}
        </View>
    );
}

/**
 * 홈 「내 미션」 하단 · 「내 주변 상점」 상단 — 연두색 환경 카피 카드.
 * 날짜 키 기준 하루 1회 결정적으로 선택되어 하루 동안 동일하고, 다음 날 바뀐다.
 */
export function EcoCopyCard() {
    const [open, setOpen] = useState(false);
    const dateKey = useMemo(() => formatDateKey(new Date()), []);
    const copy = useMemo(() => selectDailyEcoCopy(ECO_COPY_ITEMS, dateKey), [dateKey]);
    const facts = useMemo(
        () => ECO_COPY_ITEMS.filter((item) => item.category === 'fact' && item.id !== copy.id),
        [copy.id],
    );
    const practices = useMemo(
        () => ECO_COPY_ITEMS.filter((item) => item.category === 'practice' && item.id !== copy.id),
        [copy.id],
    );

    return (
        <>
            <Pressable
                style={styles.card}
                onPress={() => setOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={`${CARD_TITLE} 모두 보기`}
            >
                <Txt typography="t7" color="grey700" fontWeight="semibold">
                    {CARD_TITLE}
                </Txt>
                <Txt typography="t6" color="grey500" accessibilityElementsHidden>
                    ›
                </Txt>
            </Pressable>
            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={() => setOpen(false)}
            >
                <View style={styles.overlay}>
                    <Pressable
                        testID="eco-copy-dismiss-overlay"
                        style={StyleSheet.absoluteFill}
                        onPress={() => setOpen(false)}
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                    />
                    <View testID="eco-copy-sheet" style={styles.sheet}>
                        <Txt typography="t5" color="grey900" fontWeight="bold">
                            {CARD_TITLE}
                        </Txt>
                        <ScrollView
                            style={styles.scroll}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator
                            nestedScrollEnabled
                        >
                            <EcoCopyGroup title="오늘의 이야기" items={[copy]} highlight />
                            <EcoCopyGroup title={FACT_TITLE} items={facts} />
                            <EcoCopyGroup title={PRACTICE_TITLE} items={practices} />
                        </ScrollView>
                        <Button size="medium" type="dark" display="block" onPress={() => setOpen(false)}>
                            닫기
                        </Button>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        minHeight: 48,
        backgroundColor: colors.ecoCopyBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.ecoCopyBorder,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        padding: 20,
    },
    sheet: {
        height: '82%',
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 20,
        gap: 16,
    },
    scroll: {
        flex: 1,
        minHeight: 0,
    },
    scrollContent: {
        gap: 24,
        paddingBottom: 8,
    },
    group: {
        gap: 10,
    },
    story: {
        paddingVertical: 12,
        gap: 4,
    },
    storyDivider: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    todayStory: {
        backgroundColor: colors.sproutTint,
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    line: {
        lineHeight: 20,
    },
});
