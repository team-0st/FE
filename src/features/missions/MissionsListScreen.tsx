import { formatMissionIngredientReward } from '@api/mock/ingredients';
import { COOP_MISSIONS, DAILY_MISSIONS, missionStatusLabel, SPECIAL_MISSIONS } from '@api/mock/missions';
import type { CoopMission, Mission } from '@api/mock';
import { Badge, Border, ListRow, Top, Txt } from '@toss/tds-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useUser } from '../user/UserProvider';
import { missionStatusFor } from '../user/selectors';
import type { MissionProgressStatus } from '../user/types';
import { coopDifficultyStars, coopUnlockHint, isCoopMissionUnlocked } from './coopMissionLogic';
import { RecipeListRowShell } from '../recipes/RecipeCompletedStamp';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
import { GuideHero } from '../../shared/ui/GuideHero';
import { Screen } from '../../shared/ui/Screen';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { colors } from '../../shared/theme/colors';

type MissionsListScreenProps = {
    onPressMission: (id: string) => void;
    onPressBack?: () => void;
};

type StatusBadgeType = 'green' | 'blue' | 'elephant' | 'red';

function statusBadgeType(status: MissionProgressStatus): StatusBadgeType {
    if (status === 'completed') {
        return 'green';
    }
    if (status === 'pending_review') {
        return 'elephant';
    }
    if (status === 'rejected') {
        return 'red';
    }
    return 'blue';
}

/** 인증 방식에 맞는 TDS 아이콘 — photo/receipt/attendance_7d */
function coopAuthIcon(authType: CoopMission['authType']) {
    if (authType === 'receipt') {
        return TDS_ICON.receipt;
    }
    if (authType === 'attendance_7d') {
        return TDS_ICON.check;
    }
    return TDS_ICON.missionCamera;
}

/**
 * TDS ListHeader의 title/right 정렬이 기기에서 어긋나는 문제가 있어,
 * 제목·개수·설명을 직접 배치해요. 제목과 "N개"는 반드시 같은 줄에 있어야 해요.
 */
function MissionSectionHeader({
    title,
    count,
    description,
    rewardBadge,
}: {
    title: string;
    count: number;
    description?: string;
    rewardBadge?: string;
}) {
    return (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderRow}>
                <Txt typography="t5" fontWeight="semibold" color="grey800">
                    {title}
                </Txt>
                <Txt typography="t7" color={colors.textSecondary}>
                    {`${count}개`}
                </Txt>
            </View>
            {description != null ? (
                <Txt typography="t7" color="grey600" style={styles.sectionHeaderDesc}>
                    {description}
                </Txt>
            ) : null}
            {rewardBadge != null ? (
                <Badge
                    size="small"
                    badgeStyle="weak"
                    type="blue"
                    style={styles.sectionHeaderBadge}
                >
                    {rewardBadge}
                </Badge>
            ) : null}
        </View>
    );
}

function MissionRow({
    mission,
    status,
    onPress,
    showReward = true,
}: {
    mission: Mission;
    status: MissionProgressStatus;
    onPress: () => void;
    /** 섹션 전체 보상이 동일할 때(일반 미션)는 행마다 반복 표시하지 않아요. */
    showReward?: boolean;
}) {
    const isCompleted = status === 'completed';
    const rightLabel =
        status === 'available' ? formatMissionIngredientReward(mission.id) : missionStatusLabel(status);
    const showBadge = !isCompleted && (status !== 'available' || showReward);

    return (
        <RecipeListRowShell done={isCompleted}>
            <ListRow
                onPress={onPress}
                left={<ListRow.Icon name={TDS_ICON.missionCamera} />}
                contents={
                    <ListRow.Texts
                        type="2RowTypeA"
                        top={mission.title}
                        topProps={{ numberOfLines: 1 }}
                        bottom={mission.description}
                        bottomProps={{ numberOfLines: 2 }}
                    />
                }
                withArrow
                right={
                    showBadge ? (
                        <Badge size="small" badgeStyle="weak" type={statusBadgeType(status)}>
                            {rightLabel}
                        </Badge>
                    ) : undefined
                }
            />
        </RecipeListRowShell>
    );
}

function CoopMissionRow({
    mission,
    status,
    unlocked,
    onPress,
}: {
    mission: CoopMission;
    status: MissionProgressStatus;
    unlocked: boolean;
    onPress: () => void;
}) {
    // 뱃지는 짧게 유지 — 보상/상태만. 별 태그는 제목 줄과 분리된 캡션 줄로 — 제목에 붙이면 폭이 눌려 "..."로 잘려요.
    const isCompleted = unlocked && status === 'completed';
    const rightLabel = unlocked
        ? status === 'available'
            ? formatMissionIngredientReward(mission.id)
            : missionStatusLabel(status)
        : '잠금';

    return (
        <RecipeListRowShell done={isCompleted}>
            <ListRow
                onPress={onPress}
                left={
                    <ListRow.Icon
                        name={unlocked ? coopAuthIcon(mission.authType) : TDS_ICON.missionLock}
                        color={unlocked ? undefined : colors.textSecondary}
                    />
                }
                contents={
                    <View>
                        <Txt typography="t7" color={unlocked ? 'grey600' : 'grey500'} style={styles.difficultyStars}>
                            {coopDifficultyStars(mission.difficulty)}
                        </Txt>
                        <ListRow.Texts
                            type="2RowTypeA"
                            top={mission.title}
                            topProps={{ color: unlocked ? undefined : 'grey500', numberOfLines: 1 }}
                            bottom={
                                unlocked ? mission.description : (coopUnlockHint(mission) ?? mission.description)
                            }
                            bottomProps={{ color: unlocked ? undefined : 'grey500', numberOfLines: 2 }}
                        />
                    </View>
                }
                withArrow={unlocked}
                right={
                    isCompleted ? undefined : (
                        <Badge size="small" badgeStyle="weak" type={unlocked ? statusBadgeType(status) : 'elephant'}>
                            {rightLabel}
                        </Badge>
                    )
                }
            />
        </RecipeListRowShell>
    );
}

export function MissionsListScreen({ onPressMission, onPressBack }: MissionsListScreenProps) {
    const { state } = useUser();
    const toast = useAppToast();

    const handleCoopPress = (mission: CoopMission) => {
        if (!isCoopMissionUnlocked(state, mission)) {
            const hint = coopUnlockHint(mission);
            toast.show(hint ?? '이전 미션을 먼저 완료해 주세요.');
            return;
        }
        onPressMission(mission.id);
    };

    return (
        <Screen scrollable>
            {onPressBack != null ? (
                <Pressable onPress={onPressBack} style={styles.back} accessibilityRole="button">
                    <Txt typography="t6" color="blue500">
                        ← 홈
                    </Txt>
                </Pressable>
            ) : null}
            <Top
                title={<Top.TitleParagraph size={22}>오늘의 미션</Top.TitleParagraph>}
                subtitle2={
                    <Top.SubtitleParagraph>미션을 완료하면 재료가 쌓여요.</Top.SubtitleParagraph>
                }
            />
            <GuideHero
                message={'텀블러, 장바구니, 대중교통처럼\n일상에서 할 수 있는 미션이에요.'}
                align="start"
                compact
            />

            <MissionSectionHeader
                title="공동 미션"
                count={COOP_MISSIONS.length}
                description={'난이도 1부터 차례로 해금돼요.\n난이도 1 미션부터 시작해 보세요.'}
            />
            <View style={styles.sectionCard}>
                {COOP_MISSIONS.map((mission) => {
                    const unlocked = isCoopMissionUnlocked(state, mission);
                    const status = missionStatusFor(state, mission.id);
                    return (
                        <CoopMissionRow
                            key={mission.id}
                            mission={mission}
                            status={status}
                            unlocked={unlocked}
                            onPress={() => handleCoopPress(mission)}
                        />
                    );
                })}
            </View>

            <Border type="height16" style={styles.sectionBorder} />

            <MissionSectionHeader
                title="일반 미션"
                count={DAILY_MISSIONS.length}
                rewardBadge="랜덤 일반 재료 1종"
            />
            <View style={styles.sectionCard}>
                {DAILY_MISSIONS.map((mission) => (
                    <MissionRow
                        key={mission.id}
                        mission={mission}
                        status={missionStatusFor(state, mission.id)}
                        onPress={() => onPressMission(mission.id)}
                        showReward={false}
                    />
                ))}
            </View>

            <Border type="height16" style={styles.sectionBorder} />

            <MissionSectionHeader title="특별 미션 (히든 재료)" count={SPECIAL_MISSIONS.length} />
            <View style={styles.sectionCard}>
                {SPECIAL_MISSIONS.map((mission) => (
                    <MissionRow
                        key={mission.id}
                        mission={mission}
                        status={missionStatusFor(state, mission.id)}
                        onPress={() => onPressMission(mission.id)}
                    />
                ))}
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    back: {
        alignSelf: 'flex-start',
        paddingVertical: 8,
        marginBottom: 4,
    },
    sectionHeader: {
        marginTop: 24,
        marginBottom: 8,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionHeaderDesc: {
        marginTop: 4,
        lineHeight: 20,
    },
    sectionHeaderBadge: {
        marginTop: 6,
        alignSelf: 'flex-start',
    },
    sectionCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    sectionBorder: {
        borderRadius: 8,
        marginVertical: 4,
        overflow: 'hidden',
    },
    difficultyStars: {
        marginBottom: 2,
        letterSpacing: 1,
    },
});
