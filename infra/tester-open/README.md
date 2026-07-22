# Tester open landing (Cloudflare Worker)

고정 공유 URL: **https://zero-st.com/open**

Worker가 BE `GET /api/v1/tester-link/current`를 서버에서 읽고:

1. `tossShareUrl`(https)이 있으면 **302 리다이렉트**
2. 없으면 `intoss-private://` 랜딩(폴백)

## Deploy

```bash
cd infra/tester-open
npm install
npx wrangler login
npx wrangler deploy
```

`wrangler.toml`에 `zero-st.com/*` 라우트가 포함되어 있습니다.

임시 확인 URL: `https://zerost-tester-open.zerost-official.workers.dev/open`
