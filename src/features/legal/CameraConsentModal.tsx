import { BottomSheet, Button, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import {
    CAMERA_POLICY_LABELS,
    CAMERA_POLICY_META,
    CAMERA_POLICY_SECTIONS,
} from '../../shared/constants/cameraPolicy';

type CameraConsentModalProps = {
    visible: boolean;
    onClose: () => void;
    onAgree: () => void;
    onDecline: () => void;
};

/** 카메라 이용 동의 — TDS BottomSheet (심사: 안내·확인은 TDS) */
export function CameraConsentModal({ visible, onClose, onAgree, onDecline }: CameraConsentModalProps) {
    return (
        <BottomSheet.Root
            open={visible}
            onClose={onClose}
            onDimmerClick={onClose}
            header={<BottomSheet.Header>{CAMERA_POLICY_META.title}</BottomSheet.Header>}
            cta={
                <BottomSheet.CTA.Double
                    leftButton={
                        <Button size="large" type="dark" style="weak" display="block" onPress={onDecline}>
                            {CAMERA_POLICY_LABELS.decline}
                        </Button>
                    }
                    rightButton={
                        <Button size="large" type="primary" display="block" onPress={onAgree}>
                            {CAMERA_POLICY_LABELS.agree}
                        </Button>
                    }
                />
            }
        >
            <View style={styles.body}>
                {CAMERA_POLICY_SECTIONS.map((section) => (
                    <View key={section.heading} style={styles.block}>
                        <Txt typography="t6" fontWeight="semibold">
                            {section.heading}
                        </Txt>
                        <Txt typography="t7" color="grey700" style={styles.text}>
                            {section.body}
                        </Txt>
                    </View>
                ))}
            </View>
        </BottomSheet.Root>
    );
}

const styles = StyleSheet.create({
    body: {
        paddingHorizontal: 20,
        paddingBottom: 8,
        gap: 14,
    },
    block: {
        gap: 4,
    },
    text: {
        lineHeight: 20,
    },
});
