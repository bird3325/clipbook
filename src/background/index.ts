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
        const { token, databaseId, title, content, url, mode, clippings } = request.data;

        // Database ID 정제 (URL에서 32자리 UUID 추출 강화)
        const cleanDbId = (id: string): string => {
            const trimmed = id.trim();
            // 32자리 hex ID 패턴 (하이픈 제외)
            const idPattern = /[a-f0-9]{32}/i;
            const match = trimmed.match(idPattern);
            if (match) return match[0];

            // 만약 하이픈이 포함된 포맷인 경우 대비
            if (trimmed.includes('-')) {
                const hyphenIdPattern = /[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}/i;
                const hMatch = trimmed.match(hyphenIdPattern);
                if (hMatch) return hMatch[0].replace(/-/g, '');
            }

            return trimmed;
        };

        const sanitizedDbId = cleanDbId(databaseId);

        // 마크다운을 노션 블록으로 파싱
        const parseToBlocks = (text: string, m: string, sourceUrl: string, clipData: any[]) => {
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
                } else if (trimmed.includes('[IMAGE_ID:')) {
                    flushList();
                    // [IMAGE_ID: xxxx] 패턴 분리 및 처리
                    const parts = trimmed.split(/(\[IMAGE_ID:\s*\d+\])/);
                    parts.forEach(part => {
                        const match = part.match(/\[IMAGE_ID:\s*(\d+)\]/);
                        if (match) {
                            const imageId = match[1];
                            const clipping = clipData.find(c => c.id === imageId);
                            if (clipping && clipping.imageData) {
                                // Notion API requires external URL or file stored on their servers usually.
                                // But some integrations can handle base64 via internal methods or we might need a workaround.
                                // Actually, Notion API 2022-06-28 external images MUST be a URL.
                                // Since we have base64, this is tricky. We'll skip for now or try to use a data URL if supported.
                                // Note: Notion doesn't support data URLs in the 'external' field.
                                // To truly support this, we'd need to upload the image somewhere or use another method.
                                // For now, we'll add a callout or note about the image if we can't embed it directly.
                                blocks.push({
                                    object: 'block',
                                    type: 'callout',
                                    callout: {
                                        icon: { type: 'emoji', emoji: '🖼️' },
                                        rich_text: [{ type: 'text', text: { content: `수집된 이미지 (ID: ${imageId})` } }]
                                    }
                                });
                            }
                        } else if (part.trim()) {
                            blocks.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: part.trim() } }] } });
                        }
                    });
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

        // 1단계: 데이터베이스 정보 조회 (스키마 확인 및 연결 검증)
        fetch(`https://api.notion.com/v1/databases/${sanitizedDbId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Notion-Version": "2022-06-28"
            }
        })
            .then(async dbResponse => {
                const dbData = await dbResponse.json();
                if (!dbResponse.ok) {
                    let errorMsg = dbData.message || dbResponse.statusText;
                    if (dbData.code === 'object_not_found') {
                        errorMsg = "데이터베이스를 찾을 수 없습니다. (ID가 정확한지, 통합 기능이 공유되었는지 확인해주세요)";
                    } else if (dbData.code === 'unauthorized') {
                        errorMsg = "토큰이 유효하지 않습니다.";
                    } else if (dbData.code === 'restricted_resource' || dbResponse.status === 403) {
                        errorMsg = "접근 권한이 없습니다. (통합 기능 공유 설정을 확인해주세요)";
                    }
                    throw new Error(errorMsg);
                }

                // 제목(title) 타입의 프로퍼티 이름 찾기
                let titlePropertyName = 'title'; // 기본값
                const properties = dbData.properties;
                for (const key in properties) {
                    if (properties[key].type === 'title') {
                        titlePropertyName = key;
                        break;
                    }
                }

                // 2단계: 실제 페이지 생성
                const notionBlocks = parseToBlocks(content, mode, url, clippings);

                return fetch("https://api.notion.com/v1/pages", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                        "Notion-Version": "2022-06-28"
                    },
                    body: JSON.stringify({
                        parent: { database_id: sanitizedDbId },
                        properties: {
                            [titlePropertyName]: {
                                title: [{ text: { content: title } }]
                            }
                        },
                        children: notionBlocks
                    })
                });
            })
            .then(async response => {
                if (response instanceof Response) {
                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.message || "페이지 생성 실패");
                    }
                    sendResponse({ success: true, data });
                }
            })
            .catch(error => {
                console.error('Notion Error:', error);
                sendResponse({ success: false, error: error.message });
            });

        return true;
    }

    if (request.action === "DOWNLOAD_FILE") {
        const { base64, url: directUrl, filename } = request.data;

        let downloadUrl = directUrl;

        // base64로 전달된 경우 Data URL로 변환하여 다운로드
        if (base64) {
            downloadUrl = `data:application/pdf;base64,${base64}`;
        }

        chrome.downloads.download({
            url: downloadUrl,
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

    if (request.action === "CAPTURE_VISIBLE_TAB") {
        chrome.tabs.captureVisibleTab(undefined, { format: 'png' }, (dataUrl) => {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ success: true, dataUrl });
            }
        });
        return true;
    }
});
