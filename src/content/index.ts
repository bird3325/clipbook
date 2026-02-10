console.log('ClipBook Content Script Loaded (콘텐츠 스크립트 로드됨)');

// 텍스트 선택 감지 및 처리
document.addEventListener('mouseup', () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    // 기존 버튼이 있다면 제거
    const existingBtn = document.getElementById('clipbook-capture-btn');
    if (existingBtn) existingBtn.remove();

    if (selectedText && selectedText.length > 0) {
        console.log('Text selected (텍스트 선택됨):', selectedText);

        // 설정 확인 후 버튼 표시 결정
        chrome.storage.local.get(['showFloatingButton'], (result) => {
            // 기본값은 true
            const showButton = result.showFloatingButton !== false;

            if (!showButton) return;

            // 선택 영역의 위치 계산
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // 캡처 버튼 생성
                const btn = document.createElement('button');
                btn.id = 'clipbook-capture-btn';
                btn.textContent = 'ClipBook 저장';
                btn.style.position = 'fixed'; // 절대 위치 대신 fixed 사용 (스크롤 대응)
                btn.style.top = `${rect.bottom + 5}px`; // 선택 영역 바로 아래
                btn.style.left = `${rect.left}px`;
                btn.style.zIndex = '999999';
                btn.style.padding = '8px 12px';
                btn.style.background = '#4361EE'; // Primary color
                btn.style.color = '#fff';
                btn.style.border = 'none';
                btn.style.borderRadius = '4px';
                btn.style.cursor = 'pointer';
                btn.style.fontSize = '12px';
                btn.style.fontFamily = 'sans-serif';
                btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

                // 버튼 클릭 이벤트
                btn.addEventListener('mousedown', (e) => {
                    e.preventDefault(); // 선택 해제 방지
                    e.stopPropagation();

                    // 백그라운드 스크립트로 메시지 전송 (저장 요청)
                    // 참고: 백그라운드에서 직접 수신하는 로직 추가 필요함. 현재는 컨텍스트 메뉴 로직만 있음.
                    // 일단 여기서는 스토리지에 직접 저장하는 방식도 가능하지만, Background 위임이 정석.

                    const newClip = {
                        id: Date.now().toString(),
                        text: selectedText,
                        sourceUrl: window.location.href,
                        timestamp: Date.now()
                    };

                    // 직접 스토리지 저장 (Content Script도 storage 권한 있음)
                    try {
                        if (!chrome.runtime?.id) {
                            alert('확장 프로그램이 업데이트되었습니다. 페이지를 새로고침해주세요.');
                            return;
                        }

                        chrome.storage.local.get(['clippings'], (result) => {
                            if (chrome.runtime.lastError) {
                                console.error('Storage error:', chrome.runtime.lastError);
                                return;
                            }

                            const currentClippings = (result.clippings as any[]) || [];
                            const updatedClippings = [...currentClippings, newClip];

                            chrome.storage.local.set({ clippings: updatedClippings }, () => {
                                if (chrome.runtime.lastError) {
                                    console.error('Storage set error:', chrome.runtime.lastError);
                                    return;
                                }
                                console.log('Saved via Floating Button (플로팅 버튼으로 저장됨)');
                                btn.textContent = '저장 완료!';
                                btn.style.background = '#10B981'; // Success Green
                                setTimeout(() => btn.remove(), 1500);
                            });
                        });
                    } catch (e) {
                        console.error('Context invalidation error:', e);
                        alert('확장 프로그램 연결이 끊어졌습니다. 페이지를 새로고침해주세요.');
                    }
                });

                document.body.appendChild(btn);
            }
        });
    }
});

// 팝업 등의 요청에 따라 현재 선택된 텍스트 반환
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        if (!chrome.runtime?.id) {
            console.warn('Extension context invalidated. (확장 프로그램 컨텍스트가 유효하지 않음)');
            return;
        }

        if (request.action === "GET_SELECTION") {
            const selection = window.getSelection()?.toString() || '';
            sendResponse({ text: selection });
        }
    } catch (error) {
        console.error('Error in content script message handler:', error);
    }
    return true; // Async response handling
});

// 바탕화면 클릭 시 버튼 제거
document.addEventListener('mousedown', (e) => {
    const target = e.target as HTMLElement;
    if (target.id !== 'clipbook-capture-btn') {
        const existingBtn = document.getElementById('clipbook-capture-btn');
        if (existingBtn) existingBtn.remove();
    }
});
