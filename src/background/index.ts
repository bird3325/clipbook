console.log('ClipBook Background Service Started (클립북 백그라운드 서비스 시작)');

// 확장 프로그램 설치 시 리스너
chrome.runtime.onInstalled.addListener(() => {
    console.log('ClipBook AI Extension installed (설치 완료)');

    // 컨텍스트 메뉴 생성
    chrome.contextMenus.create({
        id: "save-clip",
        title: "ClipBook에 저장 (Save to ClipBook)",
        contexts: ["selection"] // 텍스트 선택 시에만 표시
    });
});

// 컨텍스트 메뉴 클릭 핸들러
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "save-clip" && info.selectionText) {
        console.log("Saving selection (선택 내용 저장):", info.selectionText);

        // 저장할 데이터 객체 생성
        const newClip = {
            id: Date.now().toString(),
            text: info.selectionText,
            sourceUrl: tab?.url || '',
            timestamp: Date.now()
        };

        // chrome.storage.local에 저장 (기존 데이터 세트 유지)
        chrome.storage.local.get(['clippings'], (result) => {
            const currentClippings = (result.clippings as any[]) || [];
            const updatedClippings = [...currentClippings, newClip];

            chrome.storage.local.set({ clippings: updatedClippings }, () => {
                console.log('Selection saved to storage (스토리지 저장 완료)');
            });
        });
    }
});

// 메시지 리스너 (Notion API 호출 등)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SAVE_TO_NOTION") {
        const { token, databaseId, title, content, url, mode } = request.data;

        // Database ID 정제 (URL 전체를 입력했을 경우 ID만 추출)
        const cleanDbId = (id: string) => {
            if (id.includes('/')) {
                const parts = id.split('/');
                const lastPart = parts[parts.length - 1];
                return lastPart.split('?')[0]; // ?v= 등 쿼리 파라미터 제거
            }
            return id.trim();
        };

        const sanitizedDbId = cleanDbId(databaseId);

        // 마크다운을 노션 블록으로 파싱
        const parseToBlocks = (text: string, m: string, sourceUrl: string) => {
            const lines = text.split('\n');
            const blocks: any[] = [];

            // 상단에 출처 URL 추가 (속성 불일치 대비)
            if (sourceUrl) {
                blocks.push({
                    object: 'block',
                    type: 'bookmark',
                    bookmark: { url: sourceUrl }
                });
                blocks.push({ object: 'block', type: 'divider', divider: {} });
            }

            let currentList: any[] = [];
            const flushList = () => {
                if (currentList.length > 0) {
                    currentList.forEach(item => blocks.push(item));
                    currentList = [];
                }
            };

            lines.forEach((line) => {
                const trimmed = line.trim();
                if (!trimmed) {
                    flushList();
                    return;
                }

                // Headers, Lists, Quotes, etc. (Existing logic remains)
                if (trimmed.startsWith('### ')) {
                    flushList();
                    blocks.push({ object: 'block', type: 'heading_3', heading_3: { rich_text: [{ type: 'text', text: { content: trimmed.replace('### ', '') } }] } });
                } else if (trimmed.startsWith('## ')) {
                    flushList();
                    const headerText = trimmed.replace('## ', '');
                    if (m === 'NOTION' && (headerText.includes('인사이트') || headerText.includes('Insight'))) {
                        blocks.push({ object: 'block', type: 'callout', callout: { icon: { type: 'emoji', emoji: '💡' }, color: 'blue_background', rich_text: [{ type: 'text', text: { content: headerText } }] } });
                    } else {
                        blocks.push({ object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: headerText } }] } });
                    }
                } else if (trimmed.startsWith('# ')) {
                    flushList();
                    blocks.push({ object: 'block', type: 'heading_1', heading_1: { rich_text: [{ type: 'text', text: { content: trimmed.replace('# ', '') } }] } });
                } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    currentList.push({ object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: trimmed.replace(/^[-*]\s/, '') } }] } });
                } else if (trimmed.startsWith('> ')) {
                    flushList();
                    blocks.push({ object: 'block', type: 'quote', quote: { rich_text: [{ type: 'text', text: { content: trimmed.replace('> ', '') } }] } });
                } else if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
                    flushList();
                    blocks.push({ object: 'block', type: 'to_do', to_do: { checked: trimmed.startsWith('- [x] '), rich_text: [{ type: 'text', text: { content: trimmed.replace(/- \[[ x]\] /, '') } }] } });
                } else {
                    flushList();
                    blocks.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: trimmed } }] } });
                }
            });

            flushList();
            blocks.push({ object: 'block', type: 'divider', divider: {} });
            blocks.push({
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{
                        type: 'text',
                        text: { content: `Generated by ClipBook AI (${m} Mode)` },
                        annotations: { italic: true, color: 'gray' }
                    }]
                }
            });

            return blocks.slice(0, 100);
        };

        const notionBlocks = parseToBlocks(content, mode, url);

        // 노션 API 호출 - 속성(properties)을 최소화하여 성공률 제고
        fetch("https://api.notion.com/v1/pages", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28"
            },
            body: JSON.stringify({
                parent: { database_id: sanitizedDbId },
                properties: {
                    // 대부분의 DB에서 기본 제목 컬럼 명칭은 'title' 또는 '이름'이지만, 
                    // API에서는 'title' 타입을 가진 속성을 자동으로 매칭하는 경우가 많음.
                    // 만약 실패한다면 사용자가 DB 컬럼명을 '제목' 또는 'title'로 맞춰야 함.
                    title: {
                        title: [{ text: { content: title } }]
                    }
                    // URL 속성은 DB마다 이름이 다를 수 있어 제거하고 본문에 Bookmark로 삽입
                },
                children: notionBlocks
            })
        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    let errorMsg = data.message || response.statusText;
                    if (data.code === 'object_not_found') {
                        errorMsg = "데이터베이스를 찾을 수 없습니다. (ID 확인 및 통합 기능 공유 여부 확인 필요)";
                    } else if (data.code === 'unauthorized') {
                        errorMsg = "토큰이 유효하지 않습니다.";
                    }
                    throw new Error(errorMsg);
                }
                return data;
            })
            .then(data => sendResponse({ success: true, data }))
            .catch(error => sendResponse({ success: false, error: error.message }));

        return true;
    }

    if (request.action === "DOWNLOAD_FILE") {
        const { url, filename } = request.data;
        chrome.downloads.download({
            url: url,
            filename: filename,
            saveAs: true // 폴더 선택 창 표시
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ success: true, downloadId });
            }
        });
        return true;
    }
});
