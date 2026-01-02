// ========================================
// Service Worker (PWA 오프라인 지원)
// ========================================

// 캐시 버전
const CACHE_NAME = 'memo-app-v1';

// 캐시할 파일 목록 (추후 PWA 단계에서 정의)
const urlsToCache = [
  // '/',
  // '/index.html',
  // '/css/style.css',
  // '/js/app.js'
];

// Service Worker 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('Service Worker 설치 중...');
});

// Service Worker 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('Service Worker 활성화됨');
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  // 추후 PWA 단계에서 구현
});
