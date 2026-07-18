/** 주소 문자열 → 구·군 중심 좌표 (지도 미리보기용, geocode 전) */

export type ApproximateCoords = {
    latitude: number;
    longitude: number;
};

const DEFAULT_CENTROID: ApproximateCoords = { latitude: 37.5665, longitude: 126.978 };

const PROVINCE_CENTROIDS: Record<string, ApproximateCoords> = {
    서울: { latitude: 37.5665, longitude: 126.978 },
    부산: { latitude: 35.1796, longitude: 129.0756 },
    대구: { latitude: 35.8714, longitude: 128.6014 },
    인천: { latitude: 37.4563, longitude: 126.7052 },
    광주: { latitude: 35.1595, longitude: 126.8526 },
    대전: { latitude: 36.3504, longitude: 127.3845 },
    울산: { latitude: 35.5384, longitude: 129.3114 },
    세종: { latitude: 36.4801, longitude: 127.289 },
    경기: { latitude: 37.4138, longitude: 127.5183 },
    강원: { latitude: 37.8228, longitude: 128.1555 },
    충북: { latitude: 36.8, longitude: 127.7 },
    충남: { latitude: 36.5184, longitude: 126.8 },
    전북: { latitude: 35.82, longitude: 127.1087 },
    전남: { latitude: 34.8679, longitude: 126.991 },
    경북: { latitude: 36.4919, longitude: 128.8889 },
    경남: { latitude: 35.4606, longitude: 128.2132 },
    제주: { latitude: 33.4996, longitude: 126.5312 },
};

const DISTRICT_CENTROIDS: Record<string, ApproximateCoords> = {
    '서울-성동': { latitude: 37.5634, longitude: 127.0366 },
    '서울-마포': { latitude: 37.566, longitude: 126.901 },
    '서울-종로': { latitude: 37.5735, longitude: 126.9788 },
    '서울-용산': { latitude: 37.5326, longitude: 126.9905 },
    '서울-강남': { latitude: 37.5172, longitude: 127.0473 },
    '서울-서초': { latitude: 37.4837, longitude: 127.0324 },
    '서울-동작': { latitude: 37.5124, longitude: 126.9393 },
    '서울-영등포': { latitude: 37.5264, longitude: 126.8962 },
    '서울-금천': { latitude: 37.4519, longitude: 126.902 },
    '서울-관악': { latitude: 37.4784, longitude: 126.9516 },
    '서울-동대문': { latitude: 37.5744, longitude: 127.0396 },
    '서울-중랑': { latitude: 37.6066, longitude: 127.0926 },
    '서울-성북': { latitude: 37.5894, longitude: 127.0167 },
    '서울-강북': { latitude: 37.6398, longitude: 127.0253 },
    '서울-도봉': { latitude: 37.6688, longitude: 127.0471 },
    '서울-노원': { latitude: 37.6542, longitude: 127.0568 },
    '서울-은평': { latitude: 37.6028, longitude: 126.9291 },
    '서울-서대문': { latitude: 37.5791, longitude: 126.9368 },
    '서울-양천': { latitude: 37.517, longitude: 126.8664 },
    '서울-강서': { latitude: 37.5509, longitude: 126.8495 },
    '서울-구로': { latitude: 37.4954, longitude: 126.8874 },
    '서울-송파': { latitude: 37.5145, longitude: 127.1059 },
    '서울-강동': { latitude: 37.5301, longitude: 127.1238 },
    '서울-중': { latitude: 37.564, longitude: 126.997 },
    '서울-광진': { latitude: 37.5385, longitude: 127.0823 },
    '경기-수원': { latitude: 37.2636, longitude: 127.0286 },
    '경기-성남': { latitude: 37.4449, longitude: 127.1389 },
    '경기-고양': { latitude: 37.6584, longitude: 126.832 },
    '경기-용인': { latitude: 37.2411, longitude: 127.1776 },
    '경기-부천': { latitude: 37.5034, longitude: 126.766 },
    '경기-안양': { latitude: 37.3943, longitude: 126.9568 },
    '경기-안산': { latitude: 37.3219, longitude: 126.8309 },
    '경기-의정부': { latitude: 37.7381, longitude: 127.0338 },
    '경기-파주': { latitude: 37.7599, longitude: 126.78 },
    '경기-양평': { latitude: 37.4918, longitude: 127.4874 },
};

function hashSeed(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
        hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
    }
    return hash;
}

function jitterCoords(seed: string, base: ApproximateCoords): ApproximateCoords {
    const hash = hashSeed(seed);
    const latOffset = ((hash % 100) - 50) * 0.00025;
    const lngOffset = (((hash >> 8) % 100) - 50) * 0.00025;
    return {
        latitude: base.latitude + latOffset,
        longitude: base.longitude + lngOffset,
    };
}

function parseDistrictKey(address: string): string | null {
    const normalized = address
        .replace(/특별자치도/g, '')
        .replace(/특별시|광역시/g, '')
        .trim();
    const match = normalized.match(
        /^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)\s+(?:(\S+?)시\s+)?(\S+?)(?:구|군|시)/,
    );
    if (!match) {
        return null;
    }
    const province = match[1];
    const city = match[2]?.replace(/시$/, '');
    const district = match[3]?.replace(/(구|군|시)$/, '');
    if (province === '세종') {
        return '세종-세종';
    }
    if (city && district) {
        return `${province}-${district}`;
    }
    if (district) {
        return `${province}-${district}`;
    }
    return null;
}

export function approximateCoordsFromAddress(address: string, seed: string): ApproximateCoords {
    const districtKey = parseDistrictKey(address);
    if (districtKey && DISTRICT_CENTROIDS[districtKey]) {
        return jitterCoords(seed, DISTRICT_CENTROIDS[districtKey]);
    }

    const provinceMatch = address.match(
        /^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/,
    );
    const province = provinceMatch?.[1] ?? '서울';
    const base = PROVINCE_CENTROIDS[province] ?? DEFAULT_CENTROID;
    return jitterCoords(seed, base);
}
