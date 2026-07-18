#!/usr/bin/env node
/**
 * 카카오맵 즐겨찾기 폴더(4049789) 스크래핑 결과를 JSON으로 정리합니다.
 *
 * 브라우저에서 DOM 파싱 후 저장한 raw 응답을 인자로 넘기세요:
 *   node scripts/parse-kakao-map-shops.mjs /path/to/cdp-response.json
 *
 * 출력: src/api/mock/data/kakao-map-shops.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src/api/mock/data/kakao-map-shops.json');
const SOURCE_URL =
    'https://map.kakao.com/?map_type=TYPE_MAP&folderid=4049789&target=other&page=bookmark';

const REGION =
    /(?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주|강원특별자치도|전북특별자치도)/;

function parseListItemsFromDocument() {
    return `
    const rows = [...document.querySelectorAll('ul.list_body > li')];
    const out = [];
    for (const li of rows) {
      const text = li.innerText.replace(/\\t/g,' ').replace(/\\s+/g,' ').trim();
      if (!text || text === '신고') continue;
      const isPlace = text.startsWith('장소 ');
      const isAddr = text.startsWith('주소 ');
      if (!isPlace && !isAddr) continue;
      const body = text.replace(/^(장소|주소)\\s+/, '').replace(/\\s+더보기.*/,'').trim();
      const idx = body.search(${REGION});
      if (idx <= 0) continue;
      const name = body.slice(0, idx).trim();
      const address = body.slice(idx).trim();
      if (!name || name === '358') continue;
      out.push({ name, address, kind: isPlace ? 'place' : 'address-only' });
    }
    return out;
  `;
}

function loadItemsFromCdpFile(filePath) {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const value = raw?.result?.value;
    if (value?.items?.length) {
        return value.items;
    }
    if (Array.isArray(value)) {
        return value;
    }
    throw new Error(`CDP 파일에서 items를 찾지 못했습니다: ${filePath}`);
}

function dedupe(items) {
    const seen = new Set();
    const merged = [];
    for (const item of items) {
        const key = `${item.name}||${item.address}`;
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        merged.push(item);
    }
    return merged;
}

function main() {
    const input = process.argv[2];
    if (!input) {
        console.log('사용법: node scripts/parse-kakao-map-shops.mjs <cdp-response.json>');
        console.log('');
        console.log('브라우저 CDP 스니펫 (페이지 1~5 순회):');
        console.log(parseListItemsFromDocument());
        process.exit(1);
    }

    const items = dedupe(loadItemsFromCdpFile(path.resolve(input)));
    const payload = {
        sourceUrl: SOURCE_URL,
        scrapedAt: new Date().toISOString().slice(0, 10),
        totalReported: 358,
        count: items.length,
        items,
    };

    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(`저장 완료: ${OUT} (${items.length}건)`);
}

main();
