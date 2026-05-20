#!/usr/bin/env bash
# Mac에서 할 수 있는 건 전부 실행. iPhone은 콘솔 QR 1번만.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo ""
echo "=========================================="
echo "  [1/3] 앱 빌드 (0st.ait)..."
echo "=========================================="
npm run build

AIT_FILE="${ROOT}/0st.ait"
if [[ ! -f "${AIT_FILE}" ]]; then
  echo "오류: 0st.ait 없음"
  exit 1
fi

echo ""
echo "  생성됨: ${AIT_FILE}"
echo ""

echo "=========================================="
echo "  [2/3] 앱인토스 콘솔 열기..."
echo "=========================================="
open "https://apps-in-toss.toss.im/"
open "${ROOT}"

echo ""
echo "=========================================="
echo "  [3/3] CLI 배포 시도..."
echo "=========================================="
if npx ait deploy -m "foundation build" 2>/dev/null; then
  echo ""
  echo "  배포 완료. 콘솔/샌드박스에서 테스트하세요."
else
  echo ""
  echo "  (CLI 토큰 없음 → 콘솔에서 수동 업로드)"
  echo ""
  echo "  폰에서 할 일 (딱 이것만):"
  echo "  1. 방금 연 콘솔 → 앱 '0st' → 번들 업로드"
  echo "  2. Finder의 0st.ait 파일 선택"
  echo "  3. QR 코드로 iPhone에서 실행"
  echo ""
  echo "  CLI 자동 배포 쓰려면 (한 번만):"
  echo "  npx ait token add"
  echo "  npx ait deploy"
fi

echo ""
echo "=========================================="
echo "  완료"
echo "=========================================="
