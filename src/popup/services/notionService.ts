export const saveToNotion = async (
    token: string,
    databaseId: string,
    title: string,
    content: string,
    url: string
) => {
    if (!token) throw new Error("Notion API Token이 필요합니다.");
    if (!databaseId) throw new Error("Notion Database ID가 필요합니다.");

    // Note: Direct calls to Notion API from extension might fail due to CORS.
    // In a real production extension, this should be proxied via a background script or an external backend.
    // However, for this MVP, we will try a fetch call. If CORS blocks it, we might need a workaround.
    // A common workaround in extensions is to use fetch in background.js.
    // But let's try to implement the logic here first.

    const response = await fetch("https://api.notion.com/v1/pages", {
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
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Notion API Error: ${errorData.message || response.statusText}`);
    }

    return await response.json();
};
