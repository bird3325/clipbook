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
        <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-24">
            {/* Capture Area */}
            <GlassCard className="p-0 overflow-visible">
                <div className="p-8 pb-0 flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100/50"><Icons.Clip /></span>
                        <span>텍스트 수집</span>
                    </h2>
                </div>

                <div className="px-8 pb-8">
                    <div className="relative group">
                        <textarea
                            id="manual-input"
                            placeholder="내용을 입력하세요..."
                            className="w-full h-52 p-6 text-lg bg-white rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none custom-scrollbar outline-none pb-16 shadow-sm text-slate-900 placeholder-slate-400 leading-relaxed"
                            onKeyDown={handleManualAdd}
                        />
                        <div className="absolute bottom-6 right-6">
                            <button
                                onClick={() => {
                                    const textarea = document.getElementById('manual-input') as HTMLTextAreaElement;
                                    if (textarea && textarea.value.trim()) {
                                        onAddClipping(textarea.value.trim());
                                        textarea.value = '';
                                    }
                                }}
                                className="group flex items-center justify-center bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
                            >
                                <div className="flex items-center gap-2 group-hover:hidden">
                                    <kbd className="font-sans font-medium text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">Ctrl</kbd>
                                    <span className="text-xs text-slate-400">+</span>
                                    <kbd className="font-sans font-medium text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">Enter</kbd>
                                </div>
                                <span className="hidden group-hover:block text-sm font-semibold animate-in fade-in zoom-in-95 duration-200">수집하기</span>
                            </button>
                        </div>
                    </div>

                    {clippings.length > 0 && (
                        <div className="mt-8 flex flex-col gap-3 max-h-80 overflow-y-auto custom-scrollbar p-1">
                            {clippings.map((clip) => (
                                <div
                                    key={clip.id}
                                    className="group relative bg-white border border-slate-200 text-slate-900 py-4 px-6 pr-12 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-indigo-200 transition-all w-full animate-in zoom-in-95 duration-200 flex items-center"
                                >
                                    <span className="opacity-90 leading-relaxed font-medium text-base">{clip.text}</span>
                                    <button
                                        onClick={() => onRemoveClipping(clip.id)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* AI Modes Area */}
            <GlassCard>
                <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100/50">⚡</span>
                    정리 방식 선택
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {[
                        { id: SummaryMode.REPORT, label: '보고서형', icon: '📄', desc: '공식 문서 요약' },
                        { id: SummaryMode.EMAIL, label: '메일형', icon: '✉️', desc: '비즈니스 메일' },
                        { id: SummaryMode.NOTION, label: '노션 노트', icon: '📝', desc: '구조화된 정리' },
                        { id: SummaryMode.CARD, label: '카드뉴스', icon: '📇', desc: '핵심 요약 카드' },
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setSelectedMode(mode.id)}
                            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-200 relative overflow-hidden group text-center cursor-pointer ${selectedMode === mode.id
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600/20'
                                : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5'
                                }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 shrink-0 ${selectedMode === mode.id ? 'bg-white shadow-md scale-110' : 'bg-surface group-hover:bg-white group-hover:shadow-sm'}`}>
                                {mode.icon}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className={`text-base font-bold transition-colors ${selectedMode === mode.id ? 'text-primary' : 'text-text-main group-hover:text-primary'}`}>{mode.label}</span>
                                <span className="text-xs text-text-sub font-medium">{mode.desc}</span>
                            </div>

                            {selectedMode === mode.id && (
                                <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(67,97,238,0.5)] animate-pulse"></div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="mb-10">
                    <label className="block text-sm font-bold text-text-sub uppercase tracking-wider mb-3 ml-1">추가 요청사항 (Optional)</label>
                    <input
                        type="text"
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        placeholder="예: '팀 내 공유용으로 부드러운 말투로 요약해줘'"
                        className="w-full px-6 py-4 bg-surface/50 border border-gray-200 rounded-2xl text-base focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none shadow-sm text-text-main placeholder-text-sub/50"
                    />
                </div>

                <button
                    onClick={() => selectedMode && onStartAI(selectedMode, instruction)}
                    disabled={isProcessing || clippings.length === 0 || !selectedMode}
                    className="w-full py-5 bg-indigo-600 text-white font-bold text-lg rounded-xl shadow-sm hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer"
                >
                    {isProcessing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>AI가 문서를 분석하고 있습니다...</span>
                        </>
                    ) : (
                        <>
                            <span>AI 정리 시작하기</span>
                            <span className="opacity-90">→</span>
                        </>
                    )}
                </button>
            </GlassCard>
        </div>
    );
};

export default CaptureView;
