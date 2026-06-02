import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { ProbabilityInfoButton } from './ProbabilityInfoButton';

type ProbabilityInfoRowProps = {
    label: string;
    title: string;
    lines: string[];
};

/** 라벨 옆 작은 i 버튼 */
export function ProbabilityInfoRow({ label, title, lines }: ProbabilityInfoRowProps) {
    return (
        <View style={styles.row}>
            <Txt typography="t7" color="grey600">
                {label}
            </Txt>
            <ProbabilityInfoButton title={title} lines={lines} />
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
});
