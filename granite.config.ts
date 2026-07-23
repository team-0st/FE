import { appsInToss } from '@apps-in-toss/framework/plugins';
import { hermes } from '@granite-js/plugin-hermes';
import { router } from '@granite-js/plugin-router';
import { defineConfig } from '@granite-js/react-native/config';

/**
 * `appName` must match the name registered in the Apps in Toss console.
 * 콘솔 등록명: 0st (표시명: 제로스트)
 * legacy 스킴 `intoss://zerost` 는 `normalizeSchemeUrl`에서 0st로 정규화됨.
 *
 * Brand literals stay inlined (keep in sync with `app.config.ts`).
 * `ait build` copies this file into `.granite/.ait-runtime-*.config.ts`,
 * so relative imports like `./app.config` fail module resolution.
 */
export default defineConfig({
  appName: '0st',
  /** Must be `intoss` for Apps in Toss (see official RN config docs). */
  scheme: 'intoss',
  plugins: [
    appsInToss({
      appType: 'general',
      brand: {
        displayName: '제로스트',
        primaryColor: '#3182F6',
        // 제로스트(0st) 컨셉에 맞춘 임시 아이콘. 콘솔에 업로드한 공식 로고 URL이 있으면 그것으로 교체.
        icon: 'https://static.toss.im/icons/png/4x/icon-plant-mono.png',
      },
      permissions: [{ name: 'camera', access: 'access' }],
      /**
       * `navigationBar`는 앱 전체에 적용되는 static 설정이라 화면별 분기가 안 됨
       * (`useTopNavigation`은 accessory 버튼만 제어, back 버튼은 노출 불가 — 확인 필요 시 SDK 문서 참고).
       * 탭 루트에서만 back을 없애는 옵션 A는 SDK 제약상 불가능해서,
       * back은 전역으로 켜고 탭 루트는 `useRootBackClosesApp`으로 뒤로가기 시 앱을 닫도록 처리함.
       */
      navigationBar: {
        withBackButton: true,
        withHomeButton: false,
      },
    }),
    router(),
    hermes(),
  ],
});
