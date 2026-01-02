// ========================================
// Service Worker 등록
// ========================================

// Service Worker를 지원하는 브라우저인지 확인
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Service Worker 등록 (추후 PWA 단계에서 활성화)
    // navigator.serviceWorker.register('/sw.js');
  });
}
