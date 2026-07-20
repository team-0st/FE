import { apiRequest, isApiEnabled } from './client';
import type { EcoJamHistoryItem, EcoJamSourceType } from './notion/types';
import { API_PATHS } from './notion/types';

type BeAssetHistory = {
    historyId: number;
    amount: number;
    sourceType: string;
    sourceId: number;
    createdAt: string;
};

function mapSourceType(raw: string): EcoJamSourceType {
    switch (raw) {
        case 'SOUP':
        case 'GACHA':
        case 'MISSION':
        case 'CHECKIN':
            return raw;
        default:
            return 'SOUP';
    }
}

/** GET /api/v1/histories/eco-jams */
export async function getEcoJamHistories(): Promise<EcoJamHistoryItem[] | null> {
    if (!isApiEnabled()) {
        return null;
    }
    const items = await apiRequest<BeAssetHistory[]>(API_PATHS.ecoJamHistories);
    return items.map((item) => ({
        id: item.historyId,
        amount: item.amount,
        sourceType: mapSourceType(item.sourceType),
        description: item.sourceType,
        createdAt: item.createdAt,
    }));
}
