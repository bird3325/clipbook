import React, { useState, useEffect, useRef } from 'react';
import CaptureView from '../components/CaptureView';
import LibraryView from '../components/LibraryView';
import SettingsView from '../components/SettingsView';
import GuideView from '../components/GuideView';
import PreviewModal from '../../popup/components/PreviewModal';
import { Clipping, SummaryMode, SavedItem, AIModel } from '../../popup/types';
import { generateAIContent } from '../../popup/services/aiService';
import { saveAsPDF } from '../services/pdfService';
import { StorageKey, storageService } from '../services/storage';
import Toast from '../../popup/components/Toast';

const Dashboard = ({ activeTab }: { activeTab: string }) => {
    // State
    const [clippings, setClippings] = useState<Clipping[]>([]);
    const [history, setHistory] = useState<SavedItem[]>([]);
    const [apiKey, setApiKey] = useState('');
    const [openaiApiKey, setOpenaiApiKey] = useState('');
    const [claudeApiKey, setClaudeApiKey] = useState('');
    const [notionToken, setNotionToken] = useState('');
    const [notionDbId, setNotionDbId] = useState('');
    const [showFloatingButton, setShowFloatingButton] = useState(true);
    const [aiModel, setAiModel] = useState<AIModel>('gemini-3-flash-preview');
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewData, setPreviewData] = useState<{ mode: SummaryMode; content: string } | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const isLoaded = useRef(false);

    // Initial Load & Real-time Sync (Unified with Popup)
    useEffect(() => {
        const loadSettings = async () => {
            const keys: StorageKey[] = ['clippings', 'history', 'apiKey', 'openaiApiKey', 'claudeApiKey', 'notionToken', 'notionDbId', 'showFloatingButton', 'aiModel'];
            const result = await storageService.get(keys);

            if (result.clippings) setClippings(result.clippings);
            if (result.history) setHistory(result.history);
            if (result.apiKey) setApiKey(result.apiKey);
            if (result.openaiApiKey) setOpenaiApiKey(result.openaiApiKey);
            if (result.claudeApiKey) setClaudeApiKey(result.claudeApiKey);
            if (result.notionToken) setNotionToken(result.notionToken);
            if (result.notionDbId) setNotionDbId(result.notionDbId);
            if (result.showFloatingButton !== undefined) setShowFloatingButton(result.showFloatingButton === 'true' || result.showFloatingButton === true);

            // Unified model migration logic
            let initialModel = (result.aiModel as string) || 'gemini-3-flash-preview';
            const deprecatedGemini = ['gemini-1.5-flash', 'gemini-1.5-flash-001', 'gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-2.0-flash-lite-preview-02-05', 'gemini-2.0-flash-lite', 'gemini-1.0-pro'];
            const deprecatedPro = ['gemini-1.5-pro-001', 'gemini-pro', 'gemini-1.5-pro-002', 'gemini-1.5-pro', 'gemini-2.0-pro-exp'];

            if (deprecatedGemini.includes(initialModel) || deprecatedPro.includes(initialModel)) {
                initialModel = deprecatedPro.includes(initialModel) ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
                storageService.set({ aiModel: initialModel });
            }

            setAiModel(initialModel as AIModel);
            isLoaded.current = true;
        };

        loadSettings();

        // Subscribe to changes from Popup/Storage
        const unsubscribe = storageService.onChange((changes) => {
            if (changes.apiKey !== undefined) setApiKey(changes.apiKey);
            if (changes.openaiApiKey !== undefined) setOpenaiApiKey(changes.openaiApiKey);
            if (changes.claudeApiKey !== undefined) setClaudeApiKey(changes.claudeApiKey);
            if (changes.notionToken !== undefined) setNotionToken(changes.notionToken);
            if (changes.notionDbId !== undefined) setNotionDbId(changes.notionDbId);
            if (changes.showFloatingButton !== undefined) setShowFloatingButton(changes.showFloatingButton === 'true' || changes.showFloatingButton === true);
            if (changes.aiModel !== undefined) setAiModel(changes.aiModel);
            if (changes.history !== undefined) setHistory(changes.history);
            if (changes.clippings !== undefined) setClippings(changes.clippings);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    // Persistence (Write back to unified storage)
    useEffect(() => {
        if (isLoaded.current) {
            storageService.set({ clippings });
        }
    }, [clippings]);

    useEffect(() => {
        if (isLoaded.current) {
            storageService.set({ history });
        }
    }, [history]);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type });
    };

    const handleSaveSettings = async () => {
        await storageService.set({
            apiKey,
            openaiApiKey,
            claudeApiKey,
            notionToken,
            notionDbId,
            showFloatingButton,
            aiModel
        });
        showToast('설정이 성공적으로 저장되었습니다.', 'success');
    };

    const handleAddClipping = (text: string) => {
        const newClip: Clipping = {
            id: Date.now().toString(),
            text,
            sourceUrl: 'Manual Input (Web)',
            timestamp: Date.now()
        };
        setClippings(prev => [...prev, newClip]);
        showToast('텍스트가 수집되었습니다.', 'success');
    };

    const handleRemoveClipping = (id: string) => {
        setClippings(prev => prev.filter(c => c.id !== id));
    };

    const handleDeleteHistory = (id: string) => {
        if (window.confirm('정말로 이 기록을 삭제하시겠습니까?')) {
            setHistory(prev => prev.filter(item => item.id !== id));
            showToast('기록이 삭제되었습니다.', 'info');
        }
    };

    const handleStartAI = async (mode: SummaryMode, instruction: string) => {
        const isGemini = aiModel.startsWith('gemini');
        const isOpenAI = aiModel.startsWith('gpt');
        const isClaude = aiModel.startsWith('claude');

        let currentKey = '';
        if (isGemini) currentKey = apiKey;
        if (isOpenAI) currentKey = openaiApiKey;
        if (isClaude) currentKey = claudeApiKey;

        if (!currentKey) {
            showToast('선택한 모델의 API Key가 필요합니다. 설정 메뉴에서 입력해주세요.', 'error');
            return;
        }

        setIsProcessing(true);
        try {
            const result = await generateAIContent(mode, clippings, instruction, currentKey, aiModel);
            setPreviewData({ mode, content: result });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "AI 처리 중 오류가 발생했습니다.";
            showToast(errorMessage, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFinalSave = async (target: 'NOTION' | 'PDF' | 'HISTORY', content: string, title: string) => {
        if (!previewData) return;

        const newItem: SavedItem = {
            id: Date.now().toString(),
            title,
            summary: content,
            clippings: [...clippings],
            mode: previewData.mode,
            target,
            timestamp: Date.now(),
            collection: '전체'
        };

        try {
            if (target === 'PDF') {
                saveAsPDF(title, content, previewData.mode);
                showToast('PDF 파일이 생성되었습니다.', 'success');
            } else if (target === 'NOTION') {
                showToast("웹 버전에서는 Notion 직접 저장이 제한될 수 있습니다. (CORS)", 'error');
            } else if (target === 'HISTORY') {
                showToast('기록보관함에 저장되었습니다.', 'success');
            }

            setHistory(prev => [newItem, ...prev]);
            setClippings([]);
            setPreviewData(null);

        } catch (e) {
            console.error(e);
            showToast('저장 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleExport = (target: 'NOTION' | 'PDF', item: SavedItem) => {
        if (target === 'PDF') {
            saveAsPDF(item.title, item.summary, item.mode);
            showToast('PDF 다운로드가 시작되었습니다.', 'success');
        } else {
            showToast('웹 버전에서는 아직 지원하지 않는 기능입니다.', 'info');
        }
    };

    return (
        <div className="flex-1 p-8 ml-64 overflow-y-auto h-full custom-scrollbar relative">
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-8 right-8 z-[100]">
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}

            {activeTab === 'capture' && (
                <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">텍스트 수집 및 정리</h1>
                        <p className="text-slate-500">원하는 텍스트를 입력하고 AI로 요약/변환하세요.</p>
                    </header>
                    <CaptureView
                        clippings={clippings}
                        onAddClipping={handleAddClipping}
                        onRemoveClipping={handleRemoveClipping}
                        onStartAI={handleStartAI}
                        isProcessing={isProcessing}
                    />
                </div>
            )}

            {activeTab === 'library' && (
                <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">기록 보관함</h1>
                        <p className="text-slate-500">지금까지 정리한 노트와 요약본을 확인하세요.</p>
                    </header>
                    <LibraryView
                        history={history}
                        onDelete={handleDeleteHistory}
                        onExport={handleExport}
                    />
                </div>
            )}

            {activeTab === 'guide' && (
                <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">이용 가이드</h1>
                        <p className="text-slate-500">API 키 발급 및 Notion 연동 방법을 확인하세요.</p>
                    </header>
                    <GuideView />
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">환경 설정</h1>
                        <p className="text-slate-500">AI 모델 및 API 키를 관리하세요.</p>
                    </header>
                    <SettingsView
                        apiKey={apiKey} setApiKey={setApiKey}
                        openaiApiKey={openaiApiKey} setOpenaiApiKey={setOpenaiApiKey}
                        claudeApiKey={claudeApiKey} setClaudeApiKey={setClaudeApiKey}
                        notionToken={notionToken} setNotionToken={setNotionToken}
                        notionDbId={notionDbId} setNotionDbId={setNotionDbId}
                        showFloatingButton={showFloatingButton} setShowFloatingButton={setShowFloatingButton}
                        aiModel={aiModel} setAiModel={setAiModel}
                        onSave={handleSaveSettings}
                    />
                </div>
            )}

            {/* Preview Modal */}
            {previewData && (
                <PreviewModal
                    mode={previewData.mode}
                    content={previewData.content}
                    clippings={clippings}
                    onClose={() => setPreviewData(null)}
                    onSave={handleFinalSave}
                />
            )}
        </div>
    );
};

export default Dashboard;
