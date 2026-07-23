import { approximateCoordsFromAddress } from '@features/shop/approximateGeocode';
import { isManualPointEligibleShop } from './partnerShopFlags';
import type { ShopCategory } from './shopCategories';
import type { Shop, ShopDataSource, ShopGeocodeStatus } from './shopTypes';
import kakaoMapData from './data/kakao-map-shops.json';

type KakaoMapItem = {
    name: string;
    address: string;
    kind: string;
};

const CATEGORY_EMOJI: Record<ShopCategory, string> = {
    'almae-direct': '♻️',
    'zero-waste': '🌿',
    'shop-in-shop': '🏪',
    reuse: '💚',
    'eco-stay': '🏡',
};

function inferCategory(name: string, address: string): ShopCategory {
    const text = `${name} ${address}`;
    if (/알맹상점|알맹\s*직영/.test(text)) {
        return 'almae-direct';
    }
    if (/샵앤샵|shop\s*-?\s*in\s*-?\s*shop/i.test(text)) {
        return 'shop-in-shop';
    }
    if (/호스텔|숙소|게스트하우스|펜션|스테이|캠핑|유스호스텔|리조트|민박|글램핑/.test(text)) {
        return 'eco-stay';
    }
    if (/아름다운가게|굿윌|헌옷|중고|리유즈|재사용|기부|세컨핸드|옷장|빈티지|나눔|업사이클/.test(text)) {
        return 'reuse';
    }
    return 'zero-waste';
}

function isPointEligible(name: string, _category: ShopCategory): boolean {
    return isManualPointEligibleShop(name);
}

function extractRegion(address: string): string {
    const normalized = address
        .replace(/특별자치도/g, '')
        .replace(/특별시|광역시/g, '');
    const match = normalized.match(
        /(?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)\s+(\S+?)(?:구|군|시)/,
    );
    if (match?.[1]) {
        return match[1].replace(/시$|군$|구$/, '');
    }
    return '기타';
}

function slugify(text: string): string {
    return text
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^0-9a-zA-Z가-힣-]/g, '')
        .slice(0, 40)
        .toLowerCase();
}

/** 목록·상세에서 address를 따로 보여 주므로 description에는 주소를 넣지 않는다 */
function buildDescription(category: ShopCategory): string {
    switch (category) {
        case 'almae-direct':
            return '알맹 직영 매장이에요.';
        case 'shop-in-shop':
            return '샵앤샵 입점 매장이에요.';
        case 'eco-stay':
            return '제로웨이스트 숙소예요.';
        case 'reuse':
            return '재사용·중고 매장이에요.';
        default:
            return '제로웨이스트 상점이에요.';
    }
}

function buildShopId(
    name: string,
    address: string,
    index: number,
    usedIds: Map<string, number>,
): string {
    const baseSlug = slugify(name) || `shop-${index + 1}`;
    const regionSlug = slugify(extractRegion(address));
    let id = regionSlug ? `${baseSlug}-${regionSlug}` : baseSlug;

    const count = usedIds.get(id) ?? 0;
    usedIds.set(id, count + 1);
    if (count > 0) {
        id = `${id}-${count + 1}`;
    }

    return `kakao-${id}`;
}

export function mapKakaoItemsToShops(items: KakaoMapItem[]): Shop[] {
    const usedIds = new Map<string, number>();

    return items.map((item, index) => {
        const category = inferCategory(item.name, item.address);
        const id = buildShopId(item.name, item.address, index, usedIds);
        const coords = approximateCoordsFromAddress(item.address, id);

        return {
            id,
            name: item.name,
            description: buildDescription(category),
            imageUrl: null,
            emoji: CATEGORY_EMOJI[category],
            category,
            pointEligible: isPointEligible(item.name, category),
            address: item.address,
            region: extractRegion(item.address),
            latitude: coords.latitude,
            longitude: coords.longitude,
            geocodeStatus: 'approximate' as ShopGeocodeStatus,
            dataSource: 'almae-kakaomap' as ShopDataSource,
        };
    });
}

export const KAKAO_MAP_SHOPS = mapKakaoItemsToShops(kakaoMapData.items);

export const KAKAO_MAP_META = {
    sourceUrl: kakaoMapData.sourceUrl,
    scrapedAt: kakaoMapData.scrapedAt,
    totalReported: kakaoMapData.totalReported,
    parsedCount: kakaoMapData.count,
};
