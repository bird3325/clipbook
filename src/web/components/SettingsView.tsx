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
    aiModel, setAiModel,
    onSave
}) => {
    const [showGeminiKey, setShowGeminiKey] = useState(false);
    const [showOpenAIKey, setShowOpenAIKey] = useState(false);
    const [showClaudeKey, setShowClaudeKey] = useState(false);
    const [showNotionKey, setShowNotionKey] = useState(false);

    return (
        <div className="w-full max-w-2xl mx-auto pb-20">
            <GlassCard className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600"><Icons.Settings /></span>
                    환경 설정
                </h2>

                <div className="space-y-8">
                    {/* AI Configuration */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">AI 모델 설정</h3>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">사용할 AI 모델</label>
                            <div className="relative">
                                <select
                                    value={aiModel}
                                    onChange={(e) => setAiModel(e.target.value as any)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer outline-none"
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
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {aiModel.startsWith('gemini') && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Gemini API 키</label>
                                <div className="relative group">
                                    <input
                                        type={showGeminiKey ? "text" : "password"}
                                        placeholder="Gemini API 키를 입력하세요"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base pr-12 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                    />
                                    <button
                                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                                        className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600"
                                        tabIndex={-1}
                                    >
                                        {showGeminiKey ? <Icons.EyeOff /> : <Icons.Eye />}
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Google AI Studio에서 무료로 발급받을 수 있습니다. <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">키 발급받기 →</a>
                                </p>
                            </div>
                        )}

                        {aiModel.startsWith('gpt') && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-bold text-gray-700 mb-2">OpenAI API 키</label>
                                <div className="relative group">
                                    <input
                                        type={showOpenAIKey ? "text" : "password"}
                                        placeholder="sk-..."
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base pr-12 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        value={openaiApiKey}
                                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                                    />
                                    <button
                                        onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                                        className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600"
                                        tabIndex={-1}
                                    >
                                        {showOpenAIKey ? <Icons.EyeOff /> : <Icons.Eye />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {aiModel.startsWith('claude') && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Anthropic API 키</label>
                                <div className="relative group">
                                    <input
                                        type={showClaudeKey ? "text" : "password"}
                                        placeholder="sk-ant-..."
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base pr-12 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        value={claudeApiKey}
                                        onChange={(e) => setClaudeApiKey(e.target.value)}
                                    />
                                    <button
                                        onClick={() => setShowClaudeKey(!showClaudeKey)}
                                        className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600"
                                        tabIndex={-1}
                                    >
                                        {showClaudeKey ? <Icons.EyeOff /> : <Icons.Eye />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Notion Configuration */}
                    <section className="space-y-4 pt-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">Notion 연동 설정</h3>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Notion 통합 토큰</label>
                            <div className="relative group">
                                <input
                                    type={showNotionKey ? "text" : "password"}
                                    placeholder="secret_... (Notion 토큰)"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base pr-12 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    value={notionToken}
                                    onChange={(e) => setNotionToken(e.target.value)}
                                />
                                <button
                                    onClick={() => setShowNotionKey(!showNotionKey)}
                                    className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600"
                                    tabIndex={-1}
                                >
                                    {showNotionKey ? <Icons.EyeOff /> : <Icons.Eye />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Notion 데이터베이스 ID</label>
                            <input
                                type="text"
                                placeholder="데이터베이스 ID를 입력하세요"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                value={notionDbId}
                                onChange={(e) => setNotionDbId(e.target.value)}
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                <a href="https://developers.notion.com/docs/create-a-notion-integration" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">Notion 통합 가이드 확인하기 →</a>
                            </p>
                        </div>
                    </section>

                    <div className="pt-6">
                        <button
                            onClick={onSave}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all transform active:scale-[0.98]"
                        >
                            설정 저장하기
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4">
                            모든 키는 사용자의 로컬 브라우저에만 저장되며 서버로 전송되지 않습니다.
                        </p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default SettingsView;
