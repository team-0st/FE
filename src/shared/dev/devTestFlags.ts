/**
 * 샌드박스·QA 전용 테스트 도구 스위치.
 * 출시 전: 이 파일 import 하는 DEV UI·메서드만 제거하면 됨.
 * (`__DEV__` 가 false인 프로덕션 빌드에서는 자동으로 꺼짐)
 */
export const DEV_TEST_TOOLS_ENABLED = __DEV__;
