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
                                    type: 'text',
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
                                                showToast('📝 텍스트 저장 완료!');
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

        if (request.action === "START_REGION_CAPTURE") {
            startRegionCapture();
            sendResponse({ success: true });
        }
        return true;
    } catch (error) {
        console.debug('ClipBook: Error in message handler', error);
        return false;
    }
});

const startRegionCapture = () => {
    const overlay = document.createElement('div');
    overlay.id = 'clipbook-capture-overlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: '9999999',
        cursor: 'crosshair'
    });

    const selectionLine = document.createElement('div');
    Object.assign(selectionLine.style, {
        position: 'absolute',
        border: '2px solid #4361EE',
        backgroundColor: 'rgba(67, 97, 238, 0.1)',
        display: 'none',
        pointerEvents: 'none'
    });
    overlay.appendChild(selectionLine);

    let startX = 0, startY = 0;
    let isDragging = false;

    const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        selectionLine.style.display = 'block';
        selectionLine.style.left = `${startX}px`;
        selectionLine.style.top = `${startY}px`;
        selectionLine.style.width = '0px';
        selectionLine.style.height = '0px';
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const currentX = e.clientX;
        const currentY = e.clientY;

        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(startX - currentX);
        const height = Math.abs(startY - currentY);

        selectionLine.style.left = `${left}px`;
        selectionLine.style.top = `${top}px`;
        selectionLine.style.width = `${width}px`;
        selectionLine.style.height = `${height}px`;
    };

    const onMouseUp = async (e: MouseEvent) => {
        if (!isDragging) return;
        isDragging = false;

        const rect = selectionLine.getBoundingClientRect();
        overlay.remove();

        if (rect.width < 5 || rect.height < 5) return;

        // Give a tiny delay for overlay to disappear
        setTimeout(() => {
            chrome.runtime.sendMessage({ action: "CAPTURE_VISIBLE_TAB" }, (response) => {
                if (response && response.success && response.dataUrl) {
                    cropImage(response.dataUrl, rect);
                }
            });
        }, 100);
    };

    overlay.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    document.body.appendChild(overlay);

    // Escape listener
    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            overlay.remove();
            cleanup();
        }
    };
    window.addEventListener('keydown', onKeyDown);

    const cleanup = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('keydown', onKeyDown);
    };
};

const cropImage = (dataUrl: string, rect: DOMRect) => {
    const img = new Image();
    img.onload = () => {
        const dpr = window.devicePixelRatio || 1;
        const canvas = document.createElement('canvas');
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.drawImage(
                img,
                rect.left * dpr,
                rect.top * dpr,
                rect.width * dpr,
                rect.height * dpr,
                0,
                0,
                rect.width,
                rect.height
            );

            const croppedDataUrl = canvas.toDataURL('image/png');
            saveImageClipping(croppedDataUrl);
        }
    };
    img.src = dataUrl;
};

const saveImageClipping = (dataUrl: string) => {
    const newClip = {
        id: Date.now().toString(),
        type: 'image',
        text: 'Captured Image',
        imageData: dataUrl,
        sourceUrl: window.location.href,
        timestamp: Date.now()
    };

    chrome.storage.local.get(['clippings'], (result) => {
        const currentClippings = (result.clippings as any[]) || [];
        chrome.storage.local.set({ clippings: [...currentClippings, newClip] }, () => {
            console.log('Image saved via Region Capture');
            showToast('📸 이미지 수집 완료!');
        });
    });
};

const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#4361EE',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: '99999999',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
        opacity: '0'
    });
    document.body.appendChild(toast);

    // Fade in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.top = '30px';
    }, 10);

    // Fade out and remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.top = '20px';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
};

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
