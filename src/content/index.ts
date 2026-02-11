console.log('ClipBook Content Script Loaded (콘텐츠 스크립트 로드됨)');

// 컨텍스트 유효성 확인 헬퍼
const isContextValid = () => {
    try {
        return !!(chrome.runtime?.id && chrome.storage?.local);
    } catch (e) {
        return false;
    }
};

// 텍스트 선택 감지 및 처리
document.addEventListener('mouseup', () => {
    try {
        if (!isContextValid()) return;

        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();

        // 기존 버튼이 있다면 제거 (DOM 조작은 컨텍스트 무관하게 가능할 수 있으나 안전하게 처리)
        const existingBtn = document.getElementById('clipbook-capture-btn');
        if (existingBtn) existingBtn.remove();

        if (selectedText && selectedText.length > 0) {
            // 설정 확인 후 버튼 표시 결정
            chrome.storage.local.get(['showFloatingButton'], (result) => {
                try {
                    if (!isContextValid()) return;

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
                        // ... (styles remain same)
                        btn.style.position = 'fixed';
                        btn.style.top = `${rect.bottom + 5}px`;
                        btn.style.left = `${rect.left}px`;
                        btn.style.zIndex = '999999';
                        btn.style.padding = '8px 12px';
                        btn.style.background = '#4361EE';
                        btn.style.color = '#fff';
                        btn.style.border = 'none';
                        btn.style.borderRadius = '4px';
                        btn.style.cursor = 'pointer';
                        btn.style.fontSize = '12px';
                        btn.style.fontFamily = 'sans-serif';
                        btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

                        // 버튼 클릭 이벤트
                        btn.addEventListener('mousedown', (e) => {
                            try {
                                e.preventDefault();
                                e.stopPropagation();

                                if (!isContextValid()) {
                                    alert('확장 프로그램이 업데이트되었습니다. 페이지를 새로고침해주세요.');
                                    btn.remove();
                                    return;
                                }

                                const newClip = {
                                    id: Date.now().toString(),
                                    text: selectedText,
                                    sourceUrl: window.location.href,
                                    timestamp: Date.now()
                                };

                                chrome.storage.local.get(['clippings'], (result) => {
                                    try {
                                        if (!isContextValid()) return;
                                        const currentClippings = (result.clippings as any[]) || [];
                                        const updatedClippings = [...currentClippings, newClip];

                                        chrome.storage.local.set({ clippings: updatedClippings }, () => {
                                            try {
                                                if (!isContextValid()) return;
                                                console.log('Saved via Floating Button');
                                                btn.textContent = '저장 완료!';
                                                btn.style.background = '#10B981';
                                                setTimeout(() => {
                                                    if (btn.parentNode) btn.remove();
                                                }, 1500);
                                            } catch (err) { /* ignore */ }
                                        });
                                    } catch (err) { /* ignore */ }
                                });
                            } catch (err) {
                                console.debug('ClipBook: Error in button mousedown', err);
                            }
                        });

                        document.body.appendChild(btn);
                    }
                } catch (err) {
                    console.debug('ClipBook: Error in storage callback', err);
                }
            });
        }
    } catch (e) {
        if (String(e).includes('context invalidated')) {
            console.debug('ClipBook: Extension context invalidated.');
        } else {
            console.error('ClipBook mouseup Error:', e);
        }
    }
});

// 팝업 등의 요청에 따라 현재 선택된 텍스트 반환
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        if (!isContextValid()) {
            return false;
        }

        if (request.action === "GET_SELECTION") {
            const selection = window.getSelection()?.toString() || '';
            sendResponse({ text: selection });
        }
        return true; // Valid context, async response possible
    } catch (error) {
        console.debug('ClipBook: Error in message handler', error);
        return false;
    }
});

// 바탕화면 클릭 시 버튼 제거
document.addEventListener('mousedown', (e) => {
    try {
        const target = e.target as HTMLElement;
        if (target.id !== 'clipbook-capture-btn') {
            const existingBtn = document.getElementById('clipbook-capture-btn');
            if (existingBtn) existingBtn.remove();
        }
    } catch (err) { /* ignore DOM errors */ }
});
