import type { Mission } from '@api/mock';
import { Asset, Button, frameShape, Txt } from '@toss/tds-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { getMissionVerifyMessage } from '../../shared/constants/guideCopy';
import { GuideHero } from '../../shared/ui/GuideHero';
import { Screen } from '../../shared/ui/Screen';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
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
                <GuideHero message={getMissionVerifyMessage(mission.authHint)} align="start" compact />
                <View style={styles.placeholder}>
                    <Asset.Icon
                        name={TDS_ICON.missionCamera}
                        frameShape={frameShape.CircleLarge}
                        backgroundColor={colors.primaryLight}
                        accessibilityLabel={picked ? '인증 사진 선택됨' : '인증 사진 선택'}
                    />
                    <Txt typography="t6" color="grey600" style={styles.hint}>
                        {picked ? '인증 사진을 선택했어요' : '인증에 사용할 사진을 선택해 주세요'}
                    </Txt>
                    {!picked ? (
                        <Button size="medium" type="dark" style="weak" onPress={() => setPicked(true)}>
                            사진 선택
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
        paddingTop: 12,
    },
    placeholder: {
        marginTop: 16,
        flex: 1,
        maxHeight: 280,
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
