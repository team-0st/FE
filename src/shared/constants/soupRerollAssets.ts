import { soupRerollUriSource, type SoupRerollImageKey } from './soupRerollImageUris';

/** 리롤 종류별 버튼 옆 일러스트 (격자만 제거한 PNG) */
export function getSoupRerollArtSource(kind: SoupRerollImageKey): { uri: string } {
    return soupRerollUriSource(kind);
}
