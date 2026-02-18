
import React, { useState, useEffect } from 'react';
import CaptureTab from './components/CaptureTab';
import LibraryTab from './components/LibraryTab';
import PreviewModal from './components/PreviewModal';
import Toast from './components/Toast';
import { Clipping, SummaryMode, SavedItem, AIModel } from './types';
import { generateAIContent } from './services/aiService';
import { saveAsPDF } from './services/pdfService';
import { Icons } from './constants';
import { storageService, StorageKey } from '../web/services/storage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'capture' | 'history'>('capture');
  const [clippings, setClippings] = useState<Clipping[]>([]);
  const [history, setHistory] = useState<SavedItem[]>([]);
  const isLoaded = React.useRef(false);
  const [apiKey, setApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [notionToken, setNotionToken] = useState('');
  const [notionDbId, setNotionDbId] = useState('');
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const [aiModel, setAiModel] = useState<AIModel>('gemini-3-flash-preview');
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<{ mode: SummaryMode; content: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Password visibility states
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [showNotionKey, setShowNotionKey] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };


  // Load history & clippings & apiKey from storageService
  useEffect(() => {
    // 초기 로드
    const loadSettings = async () => {
      const keys: StorageKey[] = ['history', 'clippings', 'apiKey', 'openaiApiKey', 'claudeApiKey', 'notionToken', 'notionDbId', 'showFloatingButton', 'aiModel'];
      const result = await storageService.get(keys);

      if (result.history) setHistory(result.history);
      if (result.clippings) setClippings(result.clippings);
      if (result.apiKey) setApiKey(result.apiKey);
      if (result.openaiApiKey) setOpenaiApiKey(result.openaiApiKey);
      if (result.claudeApiKey) setClaudeApiKey(result.claudeApiKey);
      if (result.notionToken) setNotionToken(result.notionToken);
      if (result.notionDbId) setNotionDbId(result.notionDbId);
      if (result.showFloatingButton !== undefined) setShowFloatingButton(result.showFloatingButton);

      let initialModel = (result.aiModel as string) || 'gemini-3-flash-preview';
      // Migration for all older Gemini models to new 3.0 versions
      const deprecatedGemini = ['gemini-1.5-flash', 'gemini-1.5-flash-001', 'gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-2.0-flash-lite-preview-02-05', 'gemini-2.0-flash-lite', 'gemini-1.0-pro'];
      const deprecatedPro = ['gemini-1.5-pro-001', 'gemini-pro', 'gemini-1.5-pro-002', 'gemini-1.5-pro', 'gemini-2.0-pro-exp'];

      const isDeprecated = deprecatedGemini.includes(initialModel) || deprecatedPro.includes(initialModel);

      if (isDeprecated) {
        if (deprecatedPro.includes(initialModel)) {
          initialModel = 'gemini-3-pro-preview';
        } else {
          initialModel = 'gemini-3-flash-preview';
        }
        storageService.set({ aiModel: initialModel });
      }
      console.log(`[Storage] Loaded AI Model: ${initialModel}`);
      setAiModel(initialModel as AIModel);
      isLoaded.current = true;
    };

    loadSettings();

    // 변경 사항 감지
    const unsubscribe = storageService.onChange((changes) => {
      if (changes.history !== undefined) setHistory(changes.history);
      if (changes.clippings !== undefined) setClippings(changes.clippings);
      if (changes.apiKey !== undefined) setApiKey(changes.apiKey);
      if (changes.openaiApiKey !== undefined) setOpenaiApiKey(changes.openaiApiKey);
      if (changes.claudeApiKey !== undefined) setClaudeApiKey(changes.claudeApiKey);
      if (changes.notionToken !== undefined) setNotionToken(changes.notionToken);
      if (changes.notionDbId !== undefined) setNotionDbId(changes.notionDbId);
      if (changes.showFloatingButton !== undefined) {
        setShowFloatingButton(changes.showFloatingButton === 'true' || changes.showFloatingButton === true);
      }
      if (changes.aiModel !== undefined) setAiModel(changes.aiModel);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoaded.current) {
      storageService.set({ history });
    }
  }, [history]);

  const handleDeleteHistory = (id: string) => {
    if (window.confirm('정말로 이 기록을 삭제하시겠습니까?')) {
      setHistory(prev => prev.filter(item => item.id !== id));
      showToast('기록이 삭제되었습니다.', 'info');
    }
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
    storageService.set({ clippings: updated });
    showToast('텍스트가 수집되었습니다.', 'success');
  };

  const handleRemoveClipping = (id: string) => {
    const updated = clippings.filter(c => c.id !== id);
    setClippings(updated);
    storageService.set({ clippings: updated });
  };

  const handleStartAI = async (mode: SummaryMode, instruction: string) => {
    if (clippings.length === 0) return;

    const isGemini = aiModel.startsWith('gemini');
    const isOpenAI = aiModel.startsWith('gpt');
    const isClaude = aiModel.startsWith('claude');

    let currentKey = '';
    if (isGemini) currentKey = apiKey || process.env.API_KEY || '';
    if (isOpenAI) currentKey = openaiApiKey;
    if (isClaude) currentKey = claudeApiKey;

    if (!currentKey) {
      const providerName = isGemini ? 'Gemini' : isOpenAI ? 'OpenAI' : 'Anthropic';
      showToast(`${providerName} API Key가 필요합니다. 설정(⚙️)에서 입력해주세요.`, 'error');
      setShowSettings(true);
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
            url: clippings[0]?.sourceUrl || '',
            mode: previewData.mode
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
        return;
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

  const handleExportFromHistory = async (target: 'NOTION' | 'PDF', item: SavedItem) => {
    try {
      if (target === 'PDF') {
        saveAsPDF(item.title, item.summary, item.mode);
        showToast('PDF 파일이 생성되었습니다.', 'success');
      } else if (target === 'NOTION') {
        if (!notionToken || !notionDbId) {
          showToast('Notion 설정이 필요합니다.', 'error');
          setShowSettings(true);
          return;
        }

        chrome.runtime.sendMessage({
          action: "SAVE_TO_NOTION",
          data: {
            token: notionToken,
            databaseId: notionDbId,
            title: item.title,
            content: item.summary,
            url: item.clippings[0]?.sourceUrl || '',
            mode: item.mode
          }
        }, (response) => {
          if (response && response.success) {
            showToast("노션 페이지에 성공적으로 저장되었습니다!", 'success');
          } else {
            showToast("노션 저장 실패: " + (response?.error || '알 수 없는 오류'), 'error');
          }
        });
      }
    } catch (e) {
      console.error(e);
      showToast('내보내기 중 오류가 발생했습니다.', 'error');
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
      <header className={`sticky top-0 z-40 glass-morphism px-6 py-4 flex items-center justify-between transition-all duration-300 ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 transform hover:scale-105 transition-transform duration-300">
            <Icons.Clip />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">ClipBook AI</h1>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-gray-500 font-medium tracking-wide">Smart Researcher v1.0</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => !isProcessing && setShowSettings(!showSettings)}
            disabled={isProcessing}
            className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${showSettings ? 'bg-indigo-50 text-indigo-600 rotate-180 shadow-inner' : 'text-gray-400 hover:bg-white hover:text-gray-600 hover:shadow-sm'}`}
            title="설정"
          >
            <Icons.Settings />
          </button>
          <nav className="flex bg-gray-100/50 p-1 rounded-xl backdrop-blur-sm">
            <button
              onClick={() => !isProcessing && setActiveTab('capture')}
              disabled={isProcessing}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${activeTab === 'capture'
                ? 'bg-white text-indigo-600 shadow-sm scale-100'
                : 'text-gray-400 hover:text-gray-600 scale-95'
                }`}
            >
              수집
            </button>
            <button
              onClick={() => !isProcessing && setActiveTab('history')}
              disabled={isProcessing}
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

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center glass-morphism animate-in fade-in duration-500">
          <div className="relative mb-8">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[40px] opacity-20 animate-pulse-glow"></div>

            {/* Spinning Rings */}
            <div className="w-24 h-24 border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute top-2 left-2 w-20 h-20 border-b-4 border-purple-500 rounded-full animate-spin-slow opacity-60"></div>

            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center text-indigo-600 scale-125 animate-float">
              <Icons.Clip />
            </div>
          </div>

          <div className="text-center space-y-3 px-10">
            <h3 className="text-xl font-black text-gray-900 tracking-tight animate-in slide-in-from-bottom-2 duration-500">AI 분석 진행 중...</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              최첨단 Gemini 3.0 모델이 수집된 텍스트를<br />
              <span className="text-indigo-600 font-bold">깊이 있게 분석하고 구조화</span>하고 있습니다.
            </p>
          </div>

          <div className="mt-12 w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 w-full rounded-full animate-shimmer scale-x-[0.6] origin-left"></div>
          </div>
        </div>
      )}


      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border-b border-gray-100 px-6 py-4 animate-in slide-in-from-top-2 max-h-[480px] overflow-y-auto custom-scrollbar shadow-inner">
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">AI 모델 선택</label>
              <div className="relative">
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <optgroup label="Google Gemini (3.0 Preview)">
                    <option value="gemini-3-flash-preview">Gemini 3.0 Flash (최신 프리뷰)</option>
                    <option value="gemini-3-pro-preview">Gemini 3.0 Pro (최신 프리뷰)</option>
                  </optgroup>
                  <optgroup label="OpenAI (GPT)">
                    <option value="gpt-4o">GPT-4o (Omni)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  </optgroup>
                  <optgroup label="Anthropic (Claude)">
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  </optgroup>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {aiModel.startsWith('gemini') && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Gemini API 키</label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    placeholder="Gemini API 키를 입력하세요"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm pr-10"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <button
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showGeminiKey ? <Icons.Eye /> : <Icons.EyeOff />}
                  </button>
                </div>
              </div>
            )}

            {aiModel.startsWith('gpt') && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">OpenAI API 키</label>
                <div className="relative">
                  <input
                    type={showOpenAIKey ? "text" : "password"}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm pr-10"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                  />
                  <button
                    onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showOpenAIKey ? <Icons.Eye /> : <Icons.EyeOff />}
                  </button>
                </div>
              </div>
            )}

            {aiModel.startsWith('claude') && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Anthropic API 키</label>
                <div className="relative">
                  <input
                    type={showClaudeKey ? "text" : "password"}
                    placeholder="sk-ant-..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm pr-10"
                    value={claudeApiKey}
                    onChange={(e) => setClaudeApiKey(e.target.value)}
                  />
                  <button
                    onClick={() => setShowClaudeKey(!showClaudeKey)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showClaudeKey ? <Icons.Eye /> : <Icons.EyeOff />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Notion 통합 토큰</label>
              <div className="relative">
                <input
                  type={showNotionKey ? "text" : "password"}
                  placeholder="secret_... (Notion 토큰)"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm pr-10"
                  value={notionToken}
                  onChange={(e) => setNotionToken(e.target.value)}
                />
                <button
                  onClick={() => setShowNotionKey(!showNotionKey)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showNotionKey ? <Icons.Eye /> : <Icons.EyeOff />}
                </button>
              </div>
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

            <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl transition-all hover:bg-indigo-50/80 group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-extrabold text-slate-800 tracking-tight">텍스트 선택 시 저장 버튼 표시</span>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    웹페이지에서 텍스트를 드래그할 때 <br />
                    <span className="text-indigo-600 font-bold decoration-indigo-200 decoration-2 underline-offset-2">ClipBook 저장 버튼</span>을 표시합니다.
                  </p>
                </div>
                <button
                  onClick={() => setShowFloatingButton(!showFloatingButton)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 ${showFloatingButton ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-slate-200'}`}
                >
                  <span
                    className={`${showFloatingButton ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out`}
                  />
                </button>
              </div>
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
                <span className="text-green-500 mt-0.5">Op</span>
                <div>
                  <p className="text-[11px] font-bold text-gray-700">OpenAI API 키 발급</p>
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 underline hover:text-indigo-800">OpenAI 키 발급 →</a>
                </div>
              </div>

              <div className="flex items-start gap-2 border-t border-gray-200 pt-2">
                <span className="text-orange-500 mt-0.5">An</span>
                <div>
                  <p className="text-[11px] font-bold text-gray-700">Anthropic API 키 발급</p>
                  <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 underline hover:text-indigo-800">Anthropic 키 발급 →</a>
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
      )
      }

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
          <LibraryTab
            history={history}
            onDelete={handleDeleteHistory}
            onExport={handleExportFromHistory}
          />
        )}
      </main>

      {/* Floating Action Tooltip Simulator */}
      {
        clippings.length > 0 && activeTab === 'capture' && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-indigo-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 z-50">
            <span className="text-xs font-bold">{clippings.length}개의 문장 선택됨</span>
            <div className="h-4 w-[1px] bg-white/20"></div>
            <button onClick={() => setClippings([])} className="text-xs font-medium text-indigo-200 hover:text-white transition-colors">초기화</button>
          </div>
        )
      }

      {/* Preview Modal */}
      {
        previewData && (
          <PreviewModal
            mode={previewData.mode}
            content={previewData.content}
            clippings={clippings}
            onClose={() => setPreviewData(null)}
            onSave={handleFinalSave}
          />
        )
      }

    </div >
  );
};

export default App;
