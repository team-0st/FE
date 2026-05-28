import { Loader } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';

type CenterLoaderProps = {
    label?: string;
};

export function CenterLoader({ label = '불러오는 중이에요' }: CenterLoaderProps) {
    return (
        <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel={label}>
            <Loader size="large" type="primary" label={label} />
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
});
