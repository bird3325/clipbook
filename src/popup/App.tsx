
import React, { useState, useEffect } from 'react';
import CaptureTab from './components/CaptureTab';
import LibraryTab from './components/LibraryTab';
import PreviewModal from './components/PreviewModal';
import Toast from './components/Toast';
import { Clipping, SummaryMode, SavedItem } from './types';
import { generateAIContent } from './services/geminiService';
import { saveAsPDF } from './services/pdfService';
import { Icons } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'capture' | 'history'>('capture');
  const [clippings, setClippings] = useState<Clipping[]>([]);
  const [history, setHistory] = useState<SavedItem[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [notionToken, setNotionToken] = useState('');
  const [notionDbId, setNotionDbId] = useState('');
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<{ mode: SummaryMode; content: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };


  // Load history & clippings & apiKey from chrome.storage
  useEffect(() => {
    // 초기 로드
    chrome.storage.local.get(['history', 'clippings', 'apiKey', 'notionToken', 'notionDbId'], (result) => {
      if (result.history) setHistory(result.history);
      if (result.clippings) setClippings(result.clippings);
      if (result.apiKey) setApiKey(result.apiKey);
      if (result.notionToken) setNotionToken(result.notionToken);
      if (result.notionToken) setNotionToken(result.notionToken);
      if (result.notionDbId) setNotionDbId(result.notionDbId);
      if (result.showFloatingButton !== undefined) setShowFloatingButton(result.showFloatingButton);
    });

    // 변경 사항 감지
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.history) setHistory(changes.history.newValue || []);
      if (changes.clippings) setClippings(changes.clippings.newValue || []);
      if (changes.apiKey) setApiKey(changes.apiKey.newValue || '');
      if (changes.notionToken) setNotionToken(changes.notionToken.newValue || '');
      if (changes.notionDbId) setNotionDbId(changes.notionDbId.newValue || '');
      if (changes.showFloatingButton) setShowFloatingButton(changes.showFloatingButton.newValue);
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ history });
  }, [history]);

  const handleSaveSettings = () => {
    chrome.storage.local.set({
      apiKey,
      notionToken,
      notionDbId,
      showFloatingButton
    });
    setShowSettings(false);
    showToast('설정이 저장되었습니다.', 'success');
  };

  const handleAddClipping = (text: string) => {
    const newClip: Clipping = {
      id: Date.now().toString(),
      text,
      sourceUrl: window.location.href,
      timestamp: Date.now()
    };
    const updated = [...clippings, newClip];
    setClippings(updated);
    chrome.storage.local.set({ clippings: updated });
    showToast('텍스트가 수집되었습니다.', 'success');
  };

  const handleRemoveClipping = (id: string) => {
    const updated = clippings.filter(c => c.id !== id);
    setClippings(updated);
    chrome.storage.local.set({ clippings: updated });
  };

  const handleStartAI = async (mode: SummaryMode, instruction: string) => {
    if (clippings.length === 0) return;

    if (!apiKey && !process.env.API_KEY) {
      showToast("Gemini API Key가 필요합니다. 설정(⚙️)에서 입력해주세요.", 'error');
      setShowSettings(true);
      return;
    }

    setIsProcessing(true);
    try {
      const keyToUse = apiKey || process.env.API_KEY;
      const result = await generateAIContent(mode, clippings, instruction, keyToUse);
      setPreviewData({ mode, content: result });
    } catch (err) {
      showToast("AI 처리 중 오류가 발생했습니다. API 키를 확인해주세요.", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCaptureFromPage = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        chrome.tabs.sendMessage(activeTab.id, { action: "GET_SELECTION" }, (response) => {
          if (chrome.runtime.lastError) {
            showToast("페이지를 새로고침하거나 텍스트를 선택한 후 다시 시도해주세요.", 'error');
            return;
          }
          if (response && response.text) {
            handleAddClipping(response.text);
          } else {
            showToast("선택된 텍스트가 없습니다.", 'info');
          }
        });
      }
    });
  };

  const handleFinalSave = async (target: 'NOTION' | 'PDF', content: string, title: string) => {
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
        saveAsPDF(title, content);
        showToast('PDF 파일이 생성되었습니다.', 'success');
      } else {
        if (!notionToken || !notionDbId) {
          showToast('Notion 설정이 필요합니다. 설정 메뉴를 확인해주세요.', 'error');
          setShowSettings(true);
          return;
        }

        chrome.runtime.sendMessage({
          action: "SAVE_TO_NOTION",
          data: {
            token: notionToken,
            databaseId: notionDbId,
            title,
            content,
            url: clippings[0]?.sourceUrl || ''
          }
        }, (response) => {
          if (response && response.success) {
            showToast("노션 페이지에 성공적으로 저장되었습니다!", 'success');
            setHistory(prev => [newItem, ...prev]);
            setClippings([]);
            setPreviewData(null);
          } else {
            showToast("노션 저장 실패: " + (response?.error || '알 수 없는 오류'), 'error');
          }
        });
        return; // Async handling above
      }

      setHistory(prev => [newItem, ...prev]);
      setClippings([]);
      setPreviewData(null);
    } catch (e) {
      console.error(e);
      showToast('저장 중 오류가 발생했습니다.', 'error');
    }
  };

  return (
    <div className="h-full bg-[#f8f9fa] text-[#212529] flex flex-col overflow-hidden relative">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[80%] h-[80%] bg-indigo-200/20 blur-[100px] rounded-full mix-blend-multiply"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[80%] h-[80%] bg-purple-200/20 blur-[100px] rounded-full mix-blend-multiply"></div>
      </div>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 glass-morphism px-6 py-4 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 transform hover:scale-105 transition-transform duration-300">
            <Icons.Clip />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">ClipBook AI</h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-wide">Smart Researcher v1.0</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${showSettings ? 'bg-indigo-50 text-indigo-600 rotate-180 shadow-inner' : 'text-gray-400 hover:bg-white hover:text-gray-600 hover:shadow-sm'}`}
            title="설정"
          >
            <Icons.Settings />
          </button>
          <nav className="flex bg-gray-100/50 p-1 rounded-xl backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('capture')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${activeTab === 'capture'
                ? 'bg-white text-indigo-600 shadow-sm scale-100'
                : 'text-gray-400 hover:text-gray-600 scale-95'
                }`}
            >
              수집
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${activeTab === 'history'
                ? 'bg-white text-indigo-600 shadow-sm scale-100'
                : 'text-gray-400 hover:text-gray-600 scale-95'
                }`}
            >
              기록
            </button>
          </nav>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border-b border-gray-100 px-6 py-4 animate-in slide-in-from-top-2 max-h-[480px] overflow-y-auto custom-scrollbar shadow-inner">
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Gemini API 키</label>
              <input
                type="password"
                placeholder="API 키를 입력하세요"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Notion 통합 토큰</label>
              <input
                type="password"
                placeholder="secret_... (Notion 토큰)"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                value={notionToken}
                onChange={(e) => setNotionToken(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Notion 데이터베이스 ID</label>
              <input
                type="text"
                placeholder="데이터베이스 ID를 입력하세요"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                value={notionDbId}
                onChange={(e) => setNotionDbId(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-gray-700">텍스트 선택 시 저장 버튼 표시</span>
              <button
                onClick={() => setShowFloatingButton(!showFloatingButton)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${showFloatingButton ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <span
                  className={`${showFloatingButton ? 'translate-x-5' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                />
              </button>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full mt-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700"
            >
              설정 저장
            </button>
          </div>

          <hr className="my-4 border-gray-100" />

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1">
              <span>💡 도움말</span>
            </h3>

            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-indigo-500 mt-0.5">①</span>
                <div>
                  <p className="text-[11px] font-bold text-gray-700">Gemini API 키 발급</p>
                  <p className="text-[10px] text-gray-500 leading-snug">Google AI Studio에서 무료로 발급받을 수 있습니다.</p>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 underline hover:text-indigo-800">API 키 발급받기 →</a>
                </div>
              </div>

              <div className="flex items-start gap-2 border-t border-gray-200 pt-2">
                <span className="text-indigo-500 mt-0.5">②</span>
                <div>
                  <p className="text-[11px] font-bold text-gray-700">Notion 연동</p>
                  <p className="text-[10px] text-gray-500 leading-snug">새 통합을 만들고 토큰과 데이터베이스 ID를 입력하세요.</p>
                  <a href="https://developers.notion.com/docs/create-a-notion-integration" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 underline hover:text-indigo-800">Notion 통합 가이드 →</a>
                </div>
              </div>

              <div className="flex items-start gap-2 border-t border-gray-200 pt-2">
                <span className="text-indigo-500 mt-0.5">③</span>
                <div>
                  <p className="text-[11px] font-bold text-gray-700">단축키 안내</p>
                  <p className="text-[10px] text-gray-500 leading-snug">
                    <span className="inline-block bg-white border border-gray-200 rounded px-1">Ctrl</span>+<span className="inline-block bg-white border border-gray-200 rounded px-1">Enter</span> : 텍스트 즉시 수집<br />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 relative z-10 space-y-6">
        {activeTab === 'capture' ? (
          <CaptureTab
            clippings={clippings}
            onAddClipping={handleAddClipping}
            onRemoveClipping={handleRemoveClipping}
            onStartAI={handleStartAI}
            onCaptureFromPage={handleCaptureFromPage}
            isProcessing={isProcessing}
          />
        ) : (
          <LibraryTab history={history} />
        )}
      </main>

      {/* Floating Action Tooltip Simulator */}
      {clippings.length > 0 && activeTab === 'capture' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-indigo-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 z-50">
          <span className="text-xs font-bold">{clippings.length}개의 문장 선택됨</span>
          <div className="h-4 w-[1px] bg-white/20"></div>
          <button onClick={() => setClippings([])} className="text-xs font-medium text-indigo-200 hover:text-white transition-colors">초기화</button>
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

export default App;
