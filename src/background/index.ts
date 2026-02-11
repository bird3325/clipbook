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

        // 마크다운을 노션 블록으로 파싱하는 간단한 분석기
        const parseToBlocks = (text: string, m: string) => {
            const lines = text.split('\n');
            const blocks: any[] = [];
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

                // Headers
                if (trimmed.startsWith('### ')) {
                    flushList();
                    blocks.push({
                        object: 'block',
                        type: 'heading_3',
                        heading_3: { rich_text: [{ type: 'text', text: { content: trimmed.replace('### ', '') } }] }
                    });
                } else if (trimmed.startsWith('## ')) {
                    flushList();
                    const headerText = trimmed.replace('## ', '');
                    // Notion 모드에서 특정 헤더는 Callout으로 변환
                    if (m === 'NOTION' && (headerText.includes('인사이트') || headerText.includes('Insight'))) {
                        blocks.push({
                            object: 'block',
                            type: 'callout',
                            callout: {
                                icon: { type: 'emoji', emoji: '💡' },
                                color: 'blue_background',
                                rich_text: [{ type: 'text', text: { content: headerText } }]
                            }
                        });
                    } else {
                        blocks.push({
                            object: 'block',
                            type: 'heading_2',
                            heading_2: { rich_text: [{ type: 'text', text: { content: headerText } }] }
                        });
                    }
                } else if (trimmed.startsWith('# ')) {
                    flushList();
                    blocks.push({
                        object: 'block',
                        type: 'heading_1',
                        heading_1: { rich_text: [{ type: 'text', text: { content: trimmed.replace('# ', '') } }] }
                    });
                }
                // Lists
                else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    const listText = trimmed.replace(/^[-*]\s/, '');
                    // CARD 모드에서는 리스트를 체크리스트로 표시하여 시각적 임팩트 부여
                    if (m === 'CARD' || m === 'REPORT') {
                        currentList.push({
                            object: 'block',
                            type: 'bulleted_list_item',
                            bulleted_list_item: { rich_text: [{ type: 'text', text: { content: listText } }] }
                        });
                    } else {
                        currentList.push({
                            object: 'block',
                            type: 'bulleted_list_item',
                            bulleted_list_item: { rich_text: [{ type: 'text', text: { content: listText } }] }
                        });
                    }
                }
                // Blockquotes
                else if (trimmed.startsWith('> ')) {
                    flushList();
                    blocks.push({
                        object: 'block',
                        type: 'quote',
                        quote: { rich_text: [{ type: 'text', text: { content: trimmed.replace('> ', '') } }] }
                    });
                }
                // Checkbox (Action items)
                else if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
                    flushList();
                    blocks.push({
                        object: 'block',
                        type: 'to_do',
                        to_do: {
                            checked: trimmed.startsWith('- [x] '),
                            rich_text: [{ type: 'text', text: { content: trimmed.replace(/- \[[ x]\] /, '') } }]
                        }
                    });
                }
                // Standard Paragraph
                else {
                    flushList();
                    blocks.push({
                        object: 'block',
                        type: 'paragraph',
                        paragraph: { rich_text: [{ type: 'text', text: { content: trimmed } }] }
                    });
                }
            });

            flushList();

            // 구분선 추가 (디자인 포인트)
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

            return blocks.slice(0, 100); // Notion child limit
        };

        const notionBlocks = parseToBlocks(content, mode);

        fetch("https://api.notion.com/v1/pages", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28"
            },
            body: JSON.stringify({
                parent: { database_id: databaseId },
                properties: {
                    title: {
                        title: [
                            {
                                text: {
                                    content: title
                                }
                            }
                        ]
                    },
                    URL: {
                        url: url
                    }
                },
                children: notionBlocks
            })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.message || response.statusText); });
                }
                return response.json();
            })
            .then(data => sendResponse({ success: true, data }))
            .catch(error => sendResponse({ success: false, error: error.message }));

        return true; // 비동기 응답을 위해 true 반환
    }
});
