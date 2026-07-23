# Tester open landing (Cloudflare Worker)

고정 공유 URL: **https://zero-st.com/open**

Worker가 BE `GET /api/v1/tester-link/current`를 서버에서 읽고
브랜드 랜딩(솥 이미지)을 보여 준 뒤:

1. `tossShareUrl`(https)이 있으면 그 링크로 연다
2. 없으면 `intoss-private://` 폴백

## Deploy

```bash
cd infra/tester-open
npm install
npx wrangler login
npx wrangler deploy
```

`wrangler.toml`에 `zero-st.com/*` 라우트와 `public/` 정적 에셋이 포함되어 있습니다.

임시 확인 URL: `https://zerost-tester-open.zerost-official.workers.dev/open`
