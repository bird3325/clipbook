import React, { useState, useEffect } from 'react';
import CaptureView from '../components/CaptureView';
import LibraryView from '../components/LibraryView';
import SettingsView from '../components/SettingsView';
import GuideView from '../components/GuideView';
import PreviewModal from '../../popup/components/PreviewModal';
import { Clipping, SummaryMode, SavedItem, AIModel } from '../../popup/types';
import { generateAIContent } from '../../popup/services/aiService';
import { saveAsPDF } from '../services/pdfService';
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
    const [aiModel, setAiModel] = useState<AIModel>('gemini-3-flash-preview');
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewData, setPreviewData] = useState<{ mode: SummaryMode; content: string } | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    // Initial Load
    useEffect(() => {
        const storedClippings = localStorage.getItem('clippings');
        const storedHistory = localStorage.getItem('history');
        const storedApiKey = localStorage.getItem('apiKey');
        const storedOpenaiApiKey = localStorage.getItem('openaiApiKey');
        const storedClaudeApiKey = localStorage.getItem('claudeApiKey');
        const storedNotionToken = localStorage.getItem('notionToken');
        const storedNotionDbId = localStorage.getItem('notionDbId');
        const storedAiModel = localStorage.getItem('aiModel');

        if (storedClippings) setClippings(JSON.parse(storedClippings));
        if (storedHistory) setHistory(JSON.parse(storedHistory));
        if (storedApiKey) setApiKey(storedApiKey);
        if (storedOpenaiApiKey) setOpenaiApiKey(storedOpenaiApiKey);
        if (storedClaudeApiKey) setClaudeApiKey(storedClaudeApiKey);
        if (storedNotionToken) setNotionToken(storedNotionToken);
        if (storedNotionDbId) setNotionDbId(storedNotionDbId);
        if (storedAiModel) setAiModel(storedAiModel as AIModel);
    }, []);

    // Persistence
    useEffect(() => { localStorage.setItem('clippings', JSON.stringify(clippings)); }, [clippings]);
    useEffect(() => { localStorage.setItem('history', JSON.stringify(history)); }, [history]);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type });
        // Auto dismiss logic handled by Toast component or we can add timeout here if mostly static
    };

    const handleSaveSettings = () => {
        localStorage.setItem('apiKey', apiKey);
        localStorage.setItem('openaiApiKey', openaiApiKey);
        localStorage.setItem('claudeApiKey', claudeApiKey);
        localStorage.setItem('notionToken', notionToken);
        localStorage.setItem('notionDbId', notionDbId);
        localStorage.setItem('aiModel', aiModel);
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
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">텍스트 수집 및 정리</h1>
                        <p className="text-gray-500">원하는 텍스트를 입력하고 AI로 요약/변환하세요.</p>
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
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">기록 보관함</h1>
                        <p className="text-gray-500">지금까지 정리한 노트와 요약본을 확인하세요.</p>
                    </header>
                    <LibraryView
                        history={history}
                        onDelete={handleDeleteHistory}
                        onExport={handleExport}
                    />
                </div>
            )}

            {activeTab === 'guide' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">이용 가이드</h1>
                        <p className="text-gray-500">API 키 발급 및 Notion 연동 방법을 확인하세요.</p>
                    </header>
                    <GuideView />
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">환경 설정</h1>
                        <p className="text-gray-500">AI 모델 및 API 키를 관리하세요.</p>
                    </header>
                    <SettingsView
                        apiKey={apiKey} setApiKey={setApiKey}
                        openaiApiKey={openaiApiKey} setOpenaiApiKey={setOpenaiApiKey}
                        claudeApiKey={claudeApiKey} setClaudeApiKey={setClaudeApiKey}
                        notionToken={notionToken} setNotionToken={setNotionToken}
                        notionDbId={notionDbId} setNotionDbId={setNotionDbId}
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
