#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

APP_NAME="0st"
SCHEME="intoss://${APP_NAME}"

get_ip() {
  local ip
  ip="$(ipconfig getifaddr en0 2>/dev/null || true)"
  if [[ -z "${ip}" ]]; then
    ip="$(ifconfig en0 2>/dev/null | awk '/inet / && $2 != "127.0.0.1" { print $2; exit }')"
  fi
  echo "${ip}"
}

IP="$(get_ip)"

echo "=============================================="
echo "  제로스트 FE — 샌드박스 개발 서버"
echo "=============================================="
echo ""
echo "  appName / 스킴: ${SCHEME}"
echo ""

if [[ -z "${IP}" ]]; then
  echo "  [경고] Wi-Fi IP를 찾지 못했습니다."
  echo "  → iPhone 핫스팟에 Mac을 연결한 뒤 다시 실행하세요."
  echo "  → 정상이면 IP가 172.20.10.x 형태입니다."
  echo ""
  HOST="127.0.0.1"
else
  echo "  Mac IP (en0): ${IP}"
  case "${IP}" in
    172.20.10.*)
      echo "  [OK] iPhone 핫스팟 네트워크로 보입니다."
      ;;
    172.30.*)
      echo "  [참고] 학교/캠퍼스 Wi-Fi입니다."
      echo "  → iPhone도 같은 Wi-Fi여야 합니다. (핫스팟만 쓰면 안 됨)"
      echo "  → 안 되면 iPhone+Mac 둘 다 핫스팟만 사용하세요."
      ;;
    192.0.0.*)
      echo "  [경고] 비정상 IP입니다. 핫스팟 재연결 후 다시 실행하세요."
      ;;
  esac
  echo ""
  echo "  샌드박스 Metro 서버 주소에 입력 (http:// 붙이지 마세요):"
  echo "    ${IP}:8081"
  echo "  (앱이 http:// 를 자동으로 붙입니다. http://http:... 오류 방지)"
  HOST="${IP}"
fi

echo ""
echo "  Metro 종료 후 재시작 중..."
if lsof -ti :8081 >/dev/null 2>&1; then
  kill "$(lsof -ti :8081)" 2>/dev/null || true
  sleep 1
fi

echo "  granite dev --host ${HOST}"
echo "  (종료: Ctrl+C)"
echo "=============================================="
echo ""

exec npx granite dev --host "${HOST}"
