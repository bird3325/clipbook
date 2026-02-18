import React, { useState } from 'react';
import GlassCard from './GlassCard';
import { Icons } from '../../popup/constants';
import { AIModel } from '../../popup/types';

interface SettingsViewProps {
    apiKey: string;
    setApiKey: (key: string) => void;
    openaiApiKey: string;
    setOpenaiApiKey: (key: string) => void;
    claudeApiKey: string;
    setClaudeApiKey: (key: string) => void;
    notionToken: string;
    setNotionToken: (token: string) => void;
    notionDbId: string;
    setNotionDbId: (id: string) => void;
    showFloatingButton: boolean;
    setShowFloatingButton: (show: boolean) => void;
    aiModel: AIModel;
    setAiModel: (model: AIModel) => void;
    onSave: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
    apiKey, setApiKey,
    openaiApiKey, setOpenaiApiKey,
    claudeApiKey, setClaudeApiKey,
    notionToken, setNotionToken,
    notionDbId, setNotionDbId,
    showFloatingButton, setShowFloatingButton,
    aiModel, setAiModel,
    onSave
}) => {
    const [showGeminiKey, setShowGeminiKey] = useState(false);
    const [showOpenAIKey, setShowOpenAIKey] = useState(false);
    const [showClaudeKey, setShowClaudeKey] = useState(false);
    const [showNotionKey, setShowNotionKey] = useState(false);

    return (
        <div className="w-full max-w-5xl mx-auto pb-24">
            <GlassCard className="p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shadow-sm"><Icons.Settings /></span>
                    환경 설정
                </h2>

                <div className="space-y-8">
                    {/* AI Configuration */}
                    <section className="space-y-5">
                        <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-100 pb-2">AI 모델 설정</h3>

                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">사용할 AI 모델</label>
                            <div className="relative group">
                                <select
                                    value={aiModel}
                                    onChange={(e) => setAiModel(e.target.value as any)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm appearance-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer outline-none text-slate-900 hover:bg-slate-50"
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
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {aiModel.startsWith('gemini') && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                <label className="block text-sm font-bold text-slate-900 mb-2">Gemini API 키</label>
                                <div className="relative group">
                                    <input
                                        type={showGeminiKey ? "text" : "password"}
                                        placeholder="Gemini API 키를 입력하세요"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm pr-12 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 placeholder-slate-400 font-mono"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                    />
                                    <button
                                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                                        className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showGeminiKey ? <Icons.Eye /> : <Icons.EyeOff />}
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-slate-500 font-medium ml-1">
                                    Google AI Studio에서 무료로 발급받을 수 있습니다. <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-bold">키 발급받기 →</a>
                                </p>
                            </div>
                        )}

                        {aiModel.startsWith('gpt') && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                <label className="block text-sm font-bold text-slate-900 mb-2">OpenAI API 키</label>
                                <div className="relative group">
                                    <input
                                        type={showOpenAIKey ? "text" : "password"}
                                        placeholder="sk-..."
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm pr-12 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 placeholder-slate-400 font-mono"
                                        value={openaiApiKey}
                                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                                    />
                                    <button
                                        onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                                        className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showOpenAIKey ? <Icons.Eye /> : <Icons.EyeOff />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {aiModel.startsWith('claude') && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                <label className="block text-sm font-bold text-slate-900 mb-2">Anthropic API 키</label>
                                <div className="relative group">
                                    <input
                                        type={showClaudeKey ? "text" : "password"}
                                        placeholder="sk-ant-..."
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm pr-12 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 placeholder-slate-400 font-mono"
                                        value={claudeApiKey}
                                        onChange={(e) => setClaudeApiKey(e.target.value)}
                                    />
                                    <button
                                        onClick={() => setShowClaudeKey(!showClaudeKey)}
                                        className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showClaudeKey ? <Icons.Eye /> : <Icons.EyeOff />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Notion Configuration */}
                    <section className="space-y-5 pt-2">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Notion 연동 설정</h3>

                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">Notion 통합 토큰</label>
                            <div className="relative group">
                                <input
                                    type={showNotionKey ? "text" : "password"}
                                    placeholder="secret_... (Notion 토큰)"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm pr-12 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 placeholder-slate-400 font-mono"
                                    value={notionToken}
                                    onChange={(e) => setNotionToken(e.target.value)}
                                />
                                <button
                                    onClick={() => setShowNotionKey(!showNotionKey)}
                                    className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showNotionKey ? <Icons.Eye /> : <Icons.EyeOff />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">Notion 데이터베이스 ID</label>
                            <input
                                type="text"
                                placeholder="데이터베이스 ID를 입력하세요"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 placeholder-slate-400 font-mono"
                                value={notionDbId}
                                onChange={(e) => setNotionDbId(e.target.value)}
                            />
                            <p className="mt-2 text-xs text-slate-500 font-medium ml-1">
                                <a href="https://developers.notion.com/docs/create-a-notion-integration" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-bold">Notion 통합 가이드 확인하기 →</a>
                            </p>
                        </div>
                    </section>

                    {/* Feature Configuration */}
                    <section className="space-y-5 pt-2">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">기능 설정</h3>

                        <div className="flex items-center justify-between py-2 px-1">
                            <div>
                                <label className="block text-sm font-bold text-slate-900">위젯 내 저장 버튼 표시</label>
                                <p className="text-xs text-slate-500 mt-1 font-medium">웹페이지에서 텍스트를 드래그할 때 ClipBook 저장 버튼을 표시합니다.</p>
                            </div>
                            <button
                                onClick={() => setShowFloatingButton(!showFloatingButton)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 cursor-pointer ${showFloatingButton ? 'bg-indigo-600' : 'bg-slate-200'}`}
                            >
                                <span
                                    className={`${showFloatingButton ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300`}
                                />
                            </button>
                        </div>
                    </section>

                    <div className="pt-6">
                        <button
                            onClick={onSave}
                            className="w-full py-4 bg-indigo-600 text-white font-bold text-base rounded-xl shadow-sm hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all transform active:scale-[0.99] cursor-pointer"
                        >
                            설정 저장하기
                        </button>
                        <p className="text-center text-xs text-slate-400 mt-4 font-medium">
                            모든 키는 사용자의 로컬 브라우저에만 저장되며 서버로 전송되지 않습니다.
                        </p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default SettingsView;
