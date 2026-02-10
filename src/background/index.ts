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
        const { token, databaseId, title, content, url } = request.data;

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
                children: [
                    {
                        object: "block",
                        type: "paragraph",
                        paragraph: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: content.substring(0, 2000) // Notion block limit
                                    }
                                }
                            ]
                        }
                    }
                ]
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
