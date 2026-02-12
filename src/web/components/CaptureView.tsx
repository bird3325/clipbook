import React, { useState } from 'react';
import { Clipping, SummaryMode } from '../../popup/types';
import GlassCard from './GlassCard';
import { Icons } from '../../popup/constants';

interface CaptureViewProps {
    clippings: Clipping[];
    onAddClipping: (text: string) => void;
    onRemoveClipping: (id: string) => void;
    onStartAI: (mode: SummaryMode, instruction: string) => void;
    isProcessing: boolean;
}

const CaptureView: React.FC<CaptureViewProps> = ({
    clippings,
    onAddClipping,
    onRemoveClipping,
    onStartAI,
    isProcessing
}) => {
    const [instruction, setInstruction] = useState('');
    const [selectedMode, setSelectedMode] = useState<SummaryMode | null>(null);

    const handleManualAdd = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            const text = e.currentTarget.value.trim();
            if (text) {
                onAddClipping(text);
                e.currentTarget.value = '';
            }
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto pb-20">
            {/* Capture Area */}
            <GlassCard className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Icons.Clip /></span>
                        <span>텍스트 수집</span>
                    </h2>
                </div>

                <div className="relative group">
                    <textarea
                        id="manual-input"
                        placeholder="여기에 텍스트를 입력하거나 Ctrl+Enter로 수집하세요..."
                        className="w-full h-48 p-6 text-base bg-white/50 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none custom-scrollbar outline-none pb-12 shadow-inner"
                        onKeyDown={handleManualAdd}
                    />
                    <div className="absolute bottom-4 right-4">
                        <button
                            onClick={() => {
                                const textarea = document.getElementById('manual-input') as HTMLTextAreaElement;
                                if (textarea && textarea.value.trim()) {
                                    onAddClipping(textarea.value.trim());
                                    textarea.value = '';
                                }
                            }}
                            className="group flex items-center justify-center bg-white hover:bg-blue-600 text-gray-400 hover:text-white border border-gray-200 hover:border-blue-600 px-4 py-2 rounded-xl shadow-sm transition-all duration-300"
                        >
                            <div className="flex items-center gap-2 group-hover:hidden">
                                <kbd className="font-sans font-medium text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Ctrl</kbd>
                                <span className="text-xs">+</span>
                                <kbd className="font-sans font-medium text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Enter</kbd>
                            </div>
                            <span className="hidden group-hover:block text-sm font-bold animate-in fade-in zoom-in-95 duration-200">수집</span>
                        </button>
                    </div>
                </div>

                {clippings.length > 0 && (
                    <div className="mt-6 flex flex-col gap-3 max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {clippings.map((clip) => (
                            <div
                                key={clip.id}
                                className="group relative bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all w-full animate-in zoom-in-95 duration-200 flex items-center"
                            >
                                <span className="opacity-90 leading-relaxed font-medium">{clip.text}</span>
                                <button
                                    onClick={() => onRemoveClipping(clip.id)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>

            {/* AI Modes Area */}
            <GlassCard className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">⚡</span>
                    정리 방식 선택
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { id: SummaryMode.REPORT, label: '보고서형', icon: '📄', desc: '문서 요약' },
                        { id: SummaryMode.EMAIL, label: '메일형', icon: '✉️', desc: '메일 초안' },
                        { id: SummaryMode.NOTION, label: '노션 노트', icon: '📝', desc: '구조화 정리' },
                        { id: SummaryMode.CARD, label: '카드뉴스', icon: '📇', desc: '핵심 요약' },
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setSelectedMode(mode.id)}
                            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group text-center hover:scale-[1.02] ${selectedMode === mode.id
                                ? 'border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500/20'
                                : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-lg'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-colors shrink-0 ${selectedMode === mode.id ? 'bg-white shadow-md' : 'bg-gray-50 group-hover:bg-white'}`}>
                                {mode.icon}
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className={`text-sm font-bold ${selectedMode === mode.id ? 'text-blue-700' : 'text-gray-900'}`}>{mode.label}</span>
                                <span className="text-xs text-gray-400">{mode.desc}</span>
                            </div>

                            {selectedMode === mode.id && (
                                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">추가 요청사항 (Optional)</label>
                    <input
                        type="text"
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        placeholder="예: '팀 내 공유용으로 부드러운 말투로 요약해줘'"
                        className="w-full px-6 py-4 bg-white border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none shadow-sm"
                    />
                </div>

                <button
                    disabled={!selectedMode || clippings.length === 0 || isProcessing}
                    onClick={() => selectedMode && onStartAI(selectedMode, instruction)}
                    className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl transition-all transform active:scale-[0.99] flex items-center justify-center gap-3 relative overflow-hidden group ${!selectedMode || clippings.length === 0 || isProcessing
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-blue-500/30'
                        }`}
                >
                    {isProcessing ? (
                        <>
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>AI가 분석 중입니다...</span>
                        </>
                    ) : (
                        <>
                            <span>정리 시작하기</span>
                            <span className="opacity-70 group-hover:translate-x-1 transition-transform">→</span>
                        </>
                    )}

                    {!isProcessing && (!(!selectedMode || clippings.length === 0)) && (
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                    )}
                </button>
            </GlassCard>
        </div>
    );
};

export default CaptureView;
