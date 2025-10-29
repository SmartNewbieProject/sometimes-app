export function resolveBannerUnitId(prodUnitId?: string) {
  // prodUnitId가 없으면 호출부에서 TestIds로 대체합니다(네이티브 require 시).
  return prodUnitId ?? "";
}
export function resolveInterstitialUnitId(prodUnitId?: string) {
  return prodUnitId ?? "";
}
export function resolveRewardedUnitId(prodUnitId?: string) {
  return prodUnitId ?? "";
}
