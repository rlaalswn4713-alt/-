// ========================================
// 메인 애플리케이션 로직
// ========================================

// DOM 요소 선택
const menuBtn = document.getElementById('menuBtn');
const menuDropdown = document.getElementById('menuDropdown');
const memoList = document.getElementById('memoList');
const memoTextarea = document.getElementById('memoTextarea');
const saveBtn = document.getElementById('saveBtn');
const newMemoBtn = document.getElementById('newMemoBtn');
const importantBtn = document.getElementById('importantBtn');
const searchInput = document.getElementById('searchInput');
const filterBtn = document.getElementById('filterBtn');

// 전역 변수
let memos = []; // 메모 배열
let currentMemoId = null; // 현재 수정 중인 메모 ID
let isImportantMode = false; // 중요 메모 모드 여부
let isFilteringImportant = false; // 중요 메모만 보기 여부

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', () => {
  console.log('나만의 메모장 앱 시작');

  // 초기화
  initApp();
});

// ========================================
// 앱 초기화
// ========================================
function initApp() {
  // 메뉴 토글 이벤트
  setupMenuToggle();

  // 저장된 메모 불러오기
  loadMemos();

  // 메모 목록 렌더링
  renderMemoList();

  // 이벤트 리스너 등록
  setupEventListeners();
}

// ========================================
// 이벤트 리스너 등록
// ========================================
function setupEventListeners() {
  // 저장 버튼
  saveBtn.addEventListener('click', saveMemo);

  // 새 메모 버튼
  newMemoBtn.addEventListener('click', createNewMemo);

  // 중요 메모 토글 버튼
  importantBtn.addEventListener('click', toggleImportantMode);

  // 검색 입력
  searchInput.addEventListener('input', handleSearch);

  // 필터 버튼
  filterBtn.addEventListener('click', toggleFilter);
}

// ========================================
// LocalStorage에서 메모 불러오기
// ========================================
function loadMemos() {
  const saved = localStorage.getItem('memos');
  if (saved) {
    memos = JSON.parse(saved);
  }
}

// ========================================
// LocalStorage에 메모 저장
// ========================================
function saveMemos() {
  localStorage.setItem('memos', JSON.stringify(memos));
}

// ========================================
// 고유 ID 생성
// ========================================
function generateId() {
  return Date.now();
}

// ========================================
// 날짜 포맷팅
// ========================================
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// ========================================
// 메모 저장
// ========================================
function saveMemo() {
  const content = memoTextarea.value.trim();

  if (!content) {
    alert('메모 내용을 입력해주세요.');
    return;
  }

  if (currentMemoId) {
    // 기존 메모 수정
    const memo = memos.find(m => m.id === currentMemoId);
    if (memo) {
      memo.content = content;
      memo.date = generateId();
      memo.isImportant = isImportantMode;
    }
  } else {
    // 새 메모 추가
    const newMemo = {
      id: generateId(),
      content: content,
      date: generateId(),
      isImportant: isImportantMode
    };
    memos.unshift(newMemo); // 배열 앞에 추가
  }

  // LocalStorage에 저장
  saveMemos();

  // 입력창 초기화
  createNewMemo();

  // 메모 목록 렌더링
  renderMemoList();

  alert('메모가 저장되었습니다.');
}

// ========================================
// 새 메모 작성
// ========================================
function createNewMemo() {
  memoTextarea.value = '';
  currentMemoId = null;
  isImportantMode = false;
  importantBtn.classList.remove('active');
  memoTextarea.focus();
}

// ========================================
// 중요 메모 모드 토글
// ========================================
function toggleImportantMode() {
  isImportantMode = !isImportantMode;
  importantBtn.classList.toggle('active');
}

// ========================================
// 메모 목록 렌더링
// ========================================
function renderMemoList() {
  let displayMemos = memos;

  // 중요 메모 필터링
  if (isFilteringImportant) {
    displayMemos = memos.filter(memo => memo.isImportant);
  }

  // 검색어 필터링
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (searchTerm) {
    displayMemos = displayMemos.filter(memo =>
      memo.content.toLowerCase().includes(searchTerm)
    );
  }

  // 빈 목록 표시
  if (displayMemos.length === 0) {
    memoList.innerHTML = `
      <div class="memo-empty">
        ${isFilteringImportant ? '중요 메모가 없습니다.' : '아직 저장된 메모가 없습니다.'}
      </div>
    `;
    return;
  }

  // 메모 목록 HTML 생성
  memoList.innerHTML = displayMemos.map(memo => `
    <div class="memo-item ${memo.isImportant ? 'important' : ''}" data-id="${memo.id}">
      <div class="memo-header">
        <span class="memo-date">${formatDate(memo.date)}</span>
        <div class="memo-actions">
          ${memo.isImportant ? '<span class="memo-star">⭐</span>' : ''}
          <button class="delete-btn" data-id="${memo.id}" title="삭제">🗑️</button>
        </div>
      </div>
      <div class="memo-content">${escapeHtml(memo.content)}</div>
    </div>
  `).join('');

  // 메모 클릭 이벤트 등록
  document.querySelectorAll('.memo-item').forEach(item => {
    item.addEventListener('click', (e) => {
      // 삭제 버튼 클릭 시에는 수정 모드로 가지 않음
      if (e.target.classList.contains('delete-btn')) {
        return;
      }
      const id = parseInt(item.dataset.id);
      loadMemoForEdit(id);
    });
  });

  // 삭제 버튼 이벤트 등록
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      deleteMemo(id);
    });
  });
}

// ========================================
// 메모 삭제
// ========================================
function deleteMemo(id) {
  if (!confirm('이 메모를 삭제하시겠습니까?')) {
    return;
  }

  // 현재 수정 중인 메모가 삭제되는 경우 입력창 초기화
  if (currentMemoId === id) {
    createNewMemo();
  }

  // 메모 배열에서 제거
  memos = memos.filter(m => m.id !== id);

  // LocalStorage에 저장
  saveMemos();

  // 메모 목록 렌더링
  renderMemoList();
}

// ========================================
// 메모 수정을 위해 불러오기
// ========================================
function loadMemoForEdit(id) {
  const memo = memos.find(m => m.id === id);
  if (memo) {
    memoTextarea.value = memo.content;
    currentMemoId = id;
    isImportantMode = memo.isImportant;

    if (isImportantMode) {
      importantBtn.classList.add('active');
    } else {
      importantBtn.classList.remove('active');
    }

    // 입력창으로 스크롤
    memoTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    memoTextarea.focus();
  }
}

// ========================================
// 검색 처리
// ========================================
function handleSearch() {
  renderMemoList();
}

// ========================================
// 필터 토글 (전체메모 / 중요메모)
// ========================================
function toggleFilter() {
  isFilteringImportant = !isFilteringImportant;
  filterBtn.textContent = isFilteringImportant ? '중요 메모' : '전체 메모';
  filterBtn.classList.toggle('active');
  renderMemoList();
}

// ========================================
// HTML 이스케이프 (XSS 방지)
// ========================================
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ========================================
// 메뉴 토글
// ========================================
function setupMenuToggle() {
  // 메뉴 버튼 클릭
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuDropdown.classList.toggle('active');
  });

  // 메뉴 외부 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!menuDropdown.contains(e.target)) {
      menuDropdown.classList.remove('active');
    }
  });
}
