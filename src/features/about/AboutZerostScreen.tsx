import { Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { ABOUT_ZEROST_LABELS, ABOUT_ZEROST_SECTIONS } from '../../shared/constants/aboutZerost';
import { Screen } from '../../shared/ui/Screen';

/** 마이 화면 「제로스트의 목표와 의의」 진입 항목 — 별도 route로 노출. */
export function AboutZerostScreen() {
    return (
        <Screen scrollable>
            <Top
                title={
                    <Top.TitleParagraph size={22} style={styles.title}>
                        {ABOUT_ZEROST_LABELS.title}
                    </Top.TitleParagraph>
                }
            />
            {ABOUT_ZEROST_SECTIONS.map((section) => (
                <View key={section.heading} style={styles.section}>
                    <Txt typography="t5" fontWeight="semibold" style={styles.heading}>
                        {section.heading}
                    </Txt>
                    {section.lines.map((line) => (
                        <Txt key={line} typography="t6" color="grey700" style={styles.line}>
                            {line}
                        </Txt>
                    ))}
                </View>
            ))}
        </Screen>
    );
}

const styles = StyleSheet.create({
    title: {
        width: '100%',
        textAlign: 'center',
    },
    section: {
        width: '100%',
        alignItems: 'center',
        gap: 6,
        marginTop: 16,
    },
    heading: {
        width: '100%',
        textAlign: 'center',
        marginBottom: 4,
    },
    line: {
        width: '100%',
        textAlign: 'center',
        lineHeight: 22,
    },
});
