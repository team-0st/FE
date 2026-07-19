import { Button, Txt } from '@toss/tds-react-native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { PROBABILITY_FOOTNOTE } from '../constants/probabilityInfo';
import { colors } from '../theme/colors';

type ProbabilityInfoButtonProps = {
    title: string;
    lines: string[];
    footnote?: string | null;
    /** 접근성 버튼 라벨 접미사. 기본: 안내 */
    accessibilitySuffix?: string;
};

export function ProbabilityInfoButton({
    title,
    lines,
    footnote = PROBABILITY_FOOTNOTE,
    accessibilitySuffix = '안내',
}: ProbabilityInfoButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Pressable
                onPress={() => setOpen(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`${title} ${accessibilitySuffix}`}
                style={styles.infoButton}
            >
                <Txt typography="t7" color="grey500" fontWeight="bold" style={styles.infoGlyph}>
                    !
                </Txt>
            </Pressable>
            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={() => setOpen(false)}
            >
                <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
                    <View style={styles.sheet} onStartShouldSetResponder={() => true}>
                        <Txt typography="t5" fontWeight="bold" style={styles.sheetTitle}>
                            {title}
                        </Txt>
                        {lines.map((line) => (
                            <Txt key={line} typography="t6" color="grey700" style={styles.line}>
                                · {line}
                            </Txt>
                        ))}
                        {footnote != null && footnote.length > 0 ? (
                            <Txt typography="t7" color="grey500" style={styles.footnote}>
                                {footnote}
                            </Txt>
                        ) : null}
                        <Button
                            size="medium"
                            type="dark"
                            display="block"
                            onPress={() => setOpen(false)}
                        >
                            닫기
                        </Button>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    infoGlyph: {
        fontSize: 11,
        lineHeight: 14,
    },
    infoButton: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        padding: 24,
    },
    sheet: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sheetTitle: {
        marginBottom: 4,
    },
    line: {
        lineHeight: 22,
    },
    footnote: {
        marginTop: 8,
        marginBottom: 8,
    },
});
