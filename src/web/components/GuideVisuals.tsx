import React from 'react';

export const BrowserMock = ({ url, children, highlightId = false }: { url: string, children?: React.ReactNode, highlightId?: boolean }) => (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white my-4 font-sans select-none">
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center gap-3">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-500 flex items-center overflow-hidden whitespace-nowrap">
                <span className="opacity-50 mr-2">🔒</span>
                {highlightId ? (
                    <>
                        notion.so/myworkspace/<span className="bg-red-100 text-red-600 font-bold px-1 rounded border border-red-200">a8aec43384f4...</span>?v=...
                        <div className="ml-auto text-[10px] text-red-500 font-bold animate-pulse">← 이 부분이 ID입니다</div>
                    </>
                ) : (
                    url
                )}
            </div>
        </div>
        <div className="p-0">
            {children}
        </div>
    </div>
);

export const ApiKeyMock = ({ service }: { service: 'openai' | 'gemini' | 'anthropic' }) => {
    const config = {
        openai: { name: 'OpenAI', color: 'bg-green-500', key: 'sk-proj-...' },
        gemini: { name: 'Google AI Studio', color: 'bg-blue-500', key: 'AIzaSy...' },
        anthropic: { name: 'Anthropic', color: 'bg-orange-500', key: 'sk-ant-...' },
    }[service];

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-100 font-mono text-xs">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                <span className="font-bold text-gray-700 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${config.color}`} /> {config.name}
                </span>
                <div className="flex gap-2">
                    <div className="h-2 w-12 bg-gray-100 rounded" />
                    <div className="h-2 w-4 bg-gray-100 rounded" />
                </div>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Name</span>
                    <span className="text-gray-400">Secret Key</span>
                    <span className="text-gray-400">Created</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
                    <span className="font-bold text-gray-600">My App Key</span>
                    <code className="text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">{config.key}</code>
                    <span className="text-gray-400">Just now</span>
                </div>
                <div className="flex justify-between items-center opacity-50">
                    <span>Test Key 1</span>
                    <code>sk-.......</code>
                    <span>2 days ago</span>
                </div>
            </div>
            <div className="mt-4 flex justify-end">
                <button className="bg-gray-900 text-white px-3 py-1.5 rounded text-[10px] font-bold">
                    + Create new key
                </button>
            </div>
        </div>
    );
};

export const NotionIntegrationMock = () => (
    <div className="bg-white p-4 font-sans text-xs">
        <div className="flex gap-4">
            <div className="w-1/4 space-y-2 border-r border-gray-100 pr-4">
                <div className="font-bold text-gray-800">Settings</div>
                <div className="text-gray-400">My account</div>
                <div className="text-gray-800 bg-gray-100 px-2 py-1 rounded font-bold">My connections</div>
                <div className="text-gray-400">Notification</div>
            </div>
            <div className="flex-1 space-y-4">
                <h3 className="font-bold text-lg text-gray-800">My connections</h3>
                <p className="text-gray-500">Manage your connections to third-party apps.</p>

                <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-lg">🤖</div>
                        <div>
                            <div className="font-bold text-gray-800">Clipbook</div>
                            <div className="text-[10px] text-gray-400">Internal integration</div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                        <div className="text-[10px] text-gray-400 mb-1">Internal Integration Token</div>
                        <div className="flex justify-between items-center">
                            <code className="text-blue-600 font-bold">secret_wk82...</code>
                            <span className="text-[10px] border border-gray-200 bg-white px-1.5 py-0.5 rounded text-gray-500">Copy</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
