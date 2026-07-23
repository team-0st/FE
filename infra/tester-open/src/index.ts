/**
 * Cloudflare Worker — https://zero-st.com/open
 * BE GET /api/v1/tester-link/current 조회 후 브랜드 랜딩을 보여 주고,
 * tossShareUrl(https)이 있으면 그쪽으로, 없으면 deep link로 연다.
 */
export interface Env {
  TESTER_LINK_API_BASE: string;
  ASSETS: Fetcher;
}

type CurrentTesterLinkEnvelope = {
  success: boolean;
  data: {
    deepLink: string | null;
    deploymentId: string | null;
    tossShareUrl?: string | null;
  } | null;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/login-cauldron.png') {
      return env.ASSETS.fetch(request);
    }

    if (path === '/' || path === '') {
      return Response.redirect(new URL('/open', url).toString(), 302);
    }

    if (path !== '/open' && path !== '/open/') {
      return new Response('Not Found', { status: 404 });
    }

    const base = (env.TESTER_LINK_API_BASE || 'https://dev-api.zero-st.com').replace(
      /\/$/,
      '',
    );
    let deepLink: string | null = null;
    let tossShareUrl: string | null = null;
    try {
      const res = await fetch(`${base}/api/v1/tester-link/current`, {
        headers: { Accept: 'application/json' },
      });
      const json = (await res.json()) as CurrentTesterLinkEnvelope;
      if (json.success && json.data) {
        deepLink = json.data.deepLink ?? null;
        const share = json.data.tossShareUrl ?? null;
        if (share != null && share.startsWith('https://')) {
          tossShareUrl = share;
        }
      }
    } catch {
      // fallback UI
    }

    const openHref = tossShareUrl ?? deepLink;
    // 자동 이동 없음 — 사용자가 버튼을 눌렀을 때만 tossShareUrl/deepLink로 이동
    const html = renderOpenPage(openHref, false);
    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  },
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderOpenPage(
  openHref: string | null,
  prefersAutoOpen: boolean,
): string {
  const safeHref = openHref != null ? escapeHtml(openHref) : '';
  const jsHref = openHref != null ? JSON.stringify(openHref) : 'null';
  const jsAuto = prefersAutoOpen ? 'true' : 'false';

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>0st 열기</title>
  <style>
    :root { color-scheme: light; }
    body {
      margin: 0; min-height: 100vh; display: grid; place-items: center;
      font-family: "Pretendard", "Apple SD Gothic Neo", sans-serif;
      background: radial-gradient(120% 80% at 50% 0%, #e8f6ef 0%, #f7f3ea 55%, #efe7d8 100%);
      color: #1f2a24; padding: 24px;
    }
    .card { width: min(420px, 100%); text-align: center; }
    h1 { font-size: 1.75rem; margin: 0 0 8px; letter-spacing: -0.03em; font-weight: 800; }
    p { margin: 0 0 16px; line-height: 1.5; color: #4c5a52; }
    .warn {
      display: none; text-align: left; background: #fff6e8; border: 1px solid #f0d7a8;
      border-radius: 12px; padding: 12px 14px; margin: 0 0 16px; color: #5c4a22; font-size: 0.92rem;
    }
    .warn.show { display: block; }
    .cauldron {
      width: min(220px, 70vw); height: auto; margin: 0 auto 18px;
      display: block; object-fit: contain;
    }
    a.btn {
      display: inline-block; width: 100%; box-sizing: border-box;
      border: 0; border-radius: 14px; padding: 14px 16px; margin: 6px 0;
      font-size: 1rem; font-weight: 700; cursor: pointer; text-decoration: none;
      background: #1f6b45; color: #fff;
    }
  </style>
</head>
<body>
  <main class="card">
    <img
      class="cauldron"
      src="/login-cauldron.png"
      width="220"
      height="220"
      alt="0st 솥"
    />
    <h1>0st</h1>
    <div id="inapp" class="warn">
      카톡·인앱 브라우저에서는 토스 앱이 안 열릴 수 있어요.<br/>
      우측 상단 <b>⋯</b> → <b>다른 브라우저로 열기</b>(Safari/Chrome) 후
      아래 버튼을 눌러 주세요.
    </div>
    <p id="msg">${
      openHref
        ? '버튼을 눌러 토스에서 0st를 여세요.'
        : '아직 테스트 링크가 등록되지 않았어요. 관리자에게 문의해 주세요.'
    }</p>
    ${
      openHref
        ? `<a class="btn" id="open" href="${safeHref}">토스에서 열기</a>`
        : ''
    }
  </main>
  <script>
    const openHref = ${jsHref};
    const prefersAutoOpen = ${jsAuto};
    const ua = navigator.userAgent || '';
    const inApp = /KAKAOTALK|Instagram|FBAN|FBAV|Line\\//i.test(ua);
    if (inApp) {
      document.getElementById('inapp')?.classList.add('show');
    }
    // 자동 이동 없음. https 토스 공유 링크는 버튼 클릭으로만 연다.
    if (prefersAutoOpen && openHref && !inApp) {
      setTimeout(() => { window.location.href = openHref; }, 400);
    }
  </script>
</body>
</html>`;
}
