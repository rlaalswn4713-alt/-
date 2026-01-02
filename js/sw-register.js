// ========================================
// Service Worker 등록
// ========================================

// Service Worker를 지원하는 브라우저인지 확인
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('[Service Worker] 등록 성공:', registration.scope);

        // 업데이트 확인
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[Service Worker] 새 버전 발견');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[Service Worker] 새 버전 설치 완료. 페이지를 새로고침하세요.');
            }
          });
        });
      })
      .catch((error) => {
        console.error('[Service Worker] 등록 실패:', error);
      });

    // Service Worker 상태 변경 감지
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[Service Worker] 컨트롤러 변경됨');
    });
  });
}
