import type { Mission } from '@api/mock';
import { Button, Top, Txt } from '@toss/tds-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

type MissionVerifyScreenProps = {
    mission: Mission;
    onSubmit: () => void;
};

export function MissionVerifyScreen({ mission, onSubmit }: MissionVerifyScreenProps) {
    const [picked, setPicked] = useState(false);

    return (
        <Screen>
            <View style={styles.body}>
                <Top
                    title={<Top.TitleParagraph size={22}>미션 인증</Top.TitleParagraph>}
                    subtitle2={<Top.SubtitleParagraph>{mission.authHint}</Top.SubtitleParagraph>}
                />
                <View style={styles.placeholder}>
                    <Txt typography="t1">{picked ? '📷' : '🖼️'}</Txt>
                    <Txt typography="t6" color="grey600" style={styles.hint}>
                        {picked ? '인증 사진이 선택됐어요 (데모)' : '인증에 사용할 사진을 선택해 주세요'}
                    </Txt>
                    {!picked ? (
                        <Button size="medium" type="dark" style="weak" onPress={() => setPicked(true)}>
                            사진 선택 (데모)
                        </Button>
                    ) : null}
                </View>
            </View>
            <View style={styles.cta}>
                <Button size="large" type="primary" display="block" disabled={!picked} onPress={onSubmit}>
                    제출하기
                </Button>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
        paddingHorizontal: 20,
    },
    placeholder: {
        marginTop: 24,
        minHeight: 220,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 12,
    },
    hint: {
        textAlign: 'center',
    },
    cta: {
        padding: 20,
    },
});
