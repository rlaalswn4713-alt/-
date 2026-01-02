// ========================================
// Service Worker (PWA 오프라인 지원)
// ========================================

// 캐시 버전 (업데이트 시 버전 번호 변경)
const CACHE_NAME = 'memo-app-v1';

// 캐시할 파일 목록
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/sw-register.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// ========================================
// Service Worker 설치 이벤트
// ========================================
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 설치 중...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] 파일 캐싱 중...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] 설치 완료');
        // 즉시 활성화
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] 설치 실패:', error);
      })
  );
});

// ========================================
// Service Worker 활성화 이벤트
// ========================================
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 활성화 중...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // 오래된 캐시 삭제
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] 오래된 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] 활성화 완료');
        // 모든 클라이언트에서 즉시 제어
        return self.clients.claim();
      })
  );
});

// ========================================
// 네트워크 요청 가로채기 (Fetch 이벤트)
// ========================================
self.addEventListener('fetch', (event) => {
  // Chrome extension 요청 무시
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에 있으면 캐시에서 반환
        if (response) {
          console.log('[Service Worker] 캐시에서 반환:', event.request.url);
          return response;
        }

        // 캐시에 없으면 네트워크 요청
        console.log('[Service Worker] 네트워크 요청:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // 유효한 응답인지 확인
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 응답 복제 (스트림은 한 번만 읽을 수 있음)
            const responseToCache = response.clone();

            // 새로운 파일은 캐시에 추가
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('[Service Worker] Fetch 실패:', error);
            // 오프라인 시 기본 페이지 반환 (옵션)
            return caches.match('./index.html');
          });
      })
  );
});
