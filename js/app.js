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
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFileInput');
const detailModal = document.getElementById('detailModal');
const closeDetailBtn = document.getElementById('closeDetailBtn');
const detailDate = document.getElementById('detailDate');
const detailText = document.getElementById('detailText');
const detailEditBtn = document.getElementById('detailEditBtn');
const detailDeleteBtn = document.getElementById('detailDeleteBtn');
const detailShareBtn = document.getElementById('detailShareBtn');
const detailCopyBtn = document.getElementById('detailCopyBtn');

// 전역 변수
let memos = []; // 메모 배열
let currentMemoId = null; // 현재 수정 중인 메모 ID
let currentDetailMemoId = null; // 현재 상세보기 중인 메모 ID
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

  // 메모 내보내기 버튼
  exportBtn.addEventListener('click', exportMemos);

  // 메모 가져오기 버튼
  importBtn.addEventListener('click', () => {
    importFileInput.click();
  });

  // 파일 선택 시
  importFileInput.addEventListener('change', importMemos);
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
        ${memo.isImportant ? '<span class="memo-star">⭐</span>' : ''}
      </div>
      <div class="memo-content">${escapeHtml(memo.content)}</div>
    </div>
  `).join('');

  // 메모 클릭 이벤트 등록 (상세보기 열기)
  document.querySelectorAll('.memo-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = parseInt(item.dataset.id);
      openDetailModal(id);
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

// ========================================
// 메모 내보내기 (JSON 다운로드)
// ========================================
function exportMemos() {
  if (memos.length === 0) {
    alert('내보낼 메모가 없습니다.');
    return;
  }

  // 메뉴 닫기
  menuDropdown.classList.remove('active');

  // JSON 데이터 생성
  const dataStr = JSON.stringify(memos, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });

  // 파일명 생성 (날짜 포함)
  const date = new Date();
  const fileName = `메모백업_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}.json`;

  // 다운로드 링크 생성
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(dataBlob);
  downloadLink.download = fileName;

  // 자동 클릭하여 다운로드
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  // URL 객체 해제
  URL.revokeObjectURL(downloadLink.href);

  alert(`메모가 성공적으로 내보내졌습니다.\n(${memos.length}개의 메모)`);
}

// ========================================
// 메모 가져오기 (JSON 업로드)
// ========================================
function importMemos(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  // 메뉴 닫기
  menuDropdown.classList.remove('active');

  // 파일 확장자 검증
  if (!file.name.endsWith('.json')) {
    alert('JSON 파일만 가져올 수 있습니다.');
    importFileInput.value = ''; // 파일 입력 초기화
    return;
  }

  // 파일 읽기
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      // JSON 파싱
      const importedMemos = JSON.parse(e.target.result);

      // 배열인지 확인
      if (!Array.isArray(importedMemos)) {
        throw new Error('올바른 메모 파일 형식이 아닙니다.');
      }

      // 메모 데이터 유효성 검증
      const isValid = importedMemos.every(memo =>
        memo.id &&
        memo.content &&
        memo.date &&
        typeof memo.isImportant === 'boolean'
      );

      if (!isValid) {
        throw new Error('메모 데이터가 올바르지 않습니다.');
      }

      // 확인 메시지
      const confirmMsg = `${importedMemos.length}개의 메모를 가져오시겠습니까?\n기존 메모에 추가됩니다.`;
      if (!confirm(confirmMsg)) {
        importFileInput.value = '';
        return;
      }

      // 기존 메모와 병합 (중복 ID 처리)
      const existingIds = new Set(memos.map(m => m.id));
      const newMemos = importedMemos.filter(memo => !existingIds.has(memo.id));

      // 새 메모 추가
      memos = [...newMemos, ...memos];

      // LocalStorage에 저장
      saveMemos();

      // 메모 목록 렌더링
      renderMemoList();

      alert(`${newMemos.length}개의 메모를 성공적으로 가져왔습니다.`);

    } catch (error) {
      console.error('메모 가져오기 실패:', error);
      alert('메모를 가져오는 데 실패했습니다.\n' + error.message);
    } finally {
      // 파일 입력 초기화
      importFileInput.value = '';
    }
  };

  reader.onerror = () => {
    alert('파일을 읽는 데 실패했습니다.');
    importFileInput.value = '';
  };

  reader.readAsText(file);
}

// ========================================
// 상세보기 모달 열기
// ========================================
function openDetailModal(id) {
  const memo = memos.find(m => m.id === id);
  if (!memo) return;

  currentDetailMemoId = id;

  // 날짜 표시
  detailDate.innerHTML = `
    <span>📅</span>
    <span>${formatDate(memo.date)}</span>
    ${memo.isImportant ? '<span>⭐ 중요 메모</span>' : ''}
  `;

  // 내용 표시
  detailText.textContent = memo.content;

  // 모달 열기
  detailModal.classList.add('active');
  document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
}

// ========================================
// 상세보기 모달 닫기
// ========================================
function closeDetailModal() {
  detailModal.classList.remove('active');
  document.body.style.overflow = ''; // 배경 스크롤 복원
  currentDetailMemoId = null;
}

// ========================================
// 상세보기에서 수정
// ========================================
function editFromDetail() {
  if (!currentDetailMemoId) return;

  closeDetailModal();
  loadMemoForEdit(currentDetailMemoId);
}

// ========================================
// 상세보기에서 삭제
// ========================================
function deleteFromDetail() {
  if (!currentDetailMemoId) return;

  deleteMemo(currentDetailMemoId);
  closeDetailModal();
}

// ========================================
// 메모 공유 (Web Share API)
// ========================================
function shareMemo() {
  if (!currentDetailMemoId) return;

  const memo = memos.find(m => m.id === currentDetailMemoId);
  if (!memo) return;

  // Web Share API 지원 확인
  if (navigator.share) {
    navigator.share({
      title: '나만의 메모장',
      text: memo.content
    })
    .then(() => {
      console.log('메모 공유 성공');
    })
    .catch((error) => {
      console.error('메모 공유 실패:', error);
      // 공유 실패 시 클립보드 복사로 대체
      copyMemo();
    });
  } else {
    // Web Share API 미지원 시 클립보드 복사
    alert('이 브라우저는 공유 기능을 지원하지 않습니다.\n클립보드에 복사합니다.');
    copyMemo();
  }
}

// ========================================
// 메모 복사 (Clipboard API)
// ========================================
function copyMemo() {
  if (!currentDetailMemoId) return;

  const memo = memos.find(m => m.id === currentDetailMemoId);
  if (!memo) return;

  // Clipboard API 사용
  if (navigator.clipboard) {
    navigator.clipboard.writeText(memo.content)
      .then(() => {
        alert('메모가 클립보드에 복사되었습니다.');
      })
      .catch((error) => {
        console.error('복사 실패:', error);
        // fallback: textarea 사용
        copyMemoFallback(memo.content);
      });
  } else {
    // fallback: textarea 사용
    copyMemoFallback(memo.content);
  }
}

// ========================================
// 메모 복사 fallback (구형 브라우저)
// ========================================
function copyMemoFallback(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand('copy');
    alert('메모가 클립보드에 복사되었습니다.');
  } catch (error) {
    console.error('복사 실패:', error);
    alert('복사에 실패했습니다.');
  }

  document.body.removeChild(textarea);
}

// ========================================
// 상세보기 이벤트 리스너
// ========================================
// 닫기 버튼
closeDetailBtn.addEventListener('click', closeDetailModal);

// 모달 배경 클릭 시 닫기
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) {
    closeDetailModal();
  }
});

// ESC 키로 닫기
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && detailModal.classList.contains('active')) {
    closeDetailModal();
  }
});

// 수정 버튼
detailEditBtn.addEventListener('click', editFromDetail);

// 삭제 버튼
detailDeleteBtn.addEventListener('click', deleteFromDetail);

// 공유 버튼
detailShareBtn.addEventListener('click', shareMemo);

// 복사 버튼
detailCopyBtn.addEventListener('click', copyMemo);
