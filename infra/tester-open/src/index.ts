/**
 * Cloudflare Worker — https://zero-st.com/open
 * BE GET /api/v1/tester-link/current 조회 후:
 * 1) tossShareUrl(https) 있으면 302
 * 2) 없으면 deep link 랜딩(폴백)
 */
export interface Env {
  TESTER_LINK_API_BASE: string;
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

    if (tossShareUrl != null) {
      return Response.redirect(tossShareUrl, 302);
    }

    const html = renderOpenPage(deepLink);
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

function androidIntentUrl(deepLink: string): string | null {
  // intoss-private://0st?_deploymentId=...
  const m = /^([a-z0-9+.-]+):\/\/([^?]*)(\?.*)?$/i.exec(deepLink);
  if (m == null) {
    return null;
  }
  const scheme = m[1];
  const hostAndPath = m[2] || '';
  const query = m[3] || '';
  return `intent://${hostAndPath}${query}#Intent;scheme=${scheme};package=viva.republica.toss;end`;
}

function renderOpenPage(deepLink: string | null): string {
  const safeLink = deepLink != null ? escapeHtml(deepLink) : '';
  const jsLink = deepLink != null ? JSON.stringify(deepLink) : 'null';
  const intent =
    deepLink != null ? androidIntentUrl(deepLink) : null;
  const safeIntent = intent != null ? escapeHtml(intent) : '';
  const jsIntent = intent != null ? JSON.stringify(intent) : 'null';

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
    h1 { font-size: 1.6rem; margin: 0 0 8px; letter-spacing: -0.02em; }
    p { margin: 0 0 16px; line-height: 1.5; color: #4c5a52; }
    .warn {
      display: none; text-align: left; background: #fff6e8; border: 1px solid #f0d7a8;
      border-radius: 12px; padding: 12px 14px; margin: 0 0 16px; color: #5c4a22; font-size: 0.92rem;
    }
    .warn.show { display: block; }
    .cauldron {
      width: 160px; height: 160px; margin: 0 auto 20px; border-radius: 50%;
      background: linear-gradient(160deg, #2f6b4f, #1d3f30);
      box-shadow: 0 18px 40px rgba(31, 64, 48, 0.25);
      position: relative;
    }
    .cauldron::after {
      content: ""; position: absolute; left: 28%; right: 28%; top: 42%; height: 28%;
      border-radius: 40% 40% 50% 50%; background: #7fd0a5; opacity: 0.9;
    }
    a.btn, button.btn {
      display: inline-block; width: 100%; box-sizing: border-box;
      border: 0; border-radius: 14px; padding: 14px 16px; margin: 6px 0;
      font-size: 1rem; font-weight: 700; cursor: pointer; text-decoration: none;
    }
    a.primary, button.primary { background: #1f6b45; color: #fff; }
    button.secondary, a.secondary { background: #e7efe9; color: #1f2a24; }
    .muted { font-size: 0.85rem; color: #6b776f; margin-top: 16px; word-break: break-all; }
  </style>
</head>
<body>
  <main class="card">
    <div class="cauldron" aria-hidden="true"></div>
    <h1>0st</h1>
    <div id="inapp" class="warn">
      카톡·인앱 브라우저에서는 토스 앱이 안 열릴 수 있어요.<br/>
      우측 상단 <b>⋯</b> → <b>다른 브라우저로 열기</b>(Safari/Chrome) 후
      아래 버튼을 눌러 주세요.
    </div>
    <p id="msg">${
      deepLink
        ? '버튼을 눌러 토스에서 0st를 여세요.'
        : '아직 테스트 링크가 등록되지 않았어요. 관리자에게 문의해 주세요.'
    }</p>
    ${
      deepLink
        ? `<a class="btn primary" id="open" href="${safeLink}">토스에서 열기</a>
           ${
             safeIntent
               ? `<a class="btn secondary" id="open-android" href="${safeIntent}">Android에서 열기</a>`
               : ''
           }
           <button class="btn secondary" id="copy" type="button">딥링크 복사</button>
           <p class="muted">${safeLink}</p>`
        : ''
    }
  </main>
  <script>
    const deepLink = ${jsLink};
    const intentUrl = ${jsIntent};
    const ua = navigator.userAgent || '';
    const inApp = /KAKAOTALK|Instagram|FBAN|FBAV|Line\\//i.test(ua);
    if (inApp) {
      document.getElementById('inapp')?.classList.add('show');
    }
    // tossShareUrl 없을 때의 폴백: 자동 스킴 이동은 OS/카톡에서
    // "해당 페이지를 열 수 없습니다"만 유발하므로 버튼 클릭에만 맡긴다.
    document.getElementById('open')?.addEventListener('click', (e) => {
      // href도 유지. Android면 intent 보조
      if (/Android/i.test(ua) && intentUrl) {
        e.preventDefault();
        window.location.href = intentUrl;
        setTimeout(() => { window.location.href = deepLink; }, 800);
      }
    });
    document.getElementById('copy')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(deepLink);
        document.getElementById('msg').textContent = '딥링크를 복사했어요. 토스/메모에서 열어보세요.';
      } catch (_) {
        document.getElementById('msg').textContent = '아래 링크를 길게 눌러 복사해 주세요.';
      }
    });
  </script>
</body>
</html>`;
}
