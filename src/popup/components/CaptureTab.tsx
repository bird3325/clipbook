
import React, { useState } from 'react';
import { Clipping, SummaryMode } from '../types';
import { Icons, COLORS } from '../constants';

interface CaptureTabProps {
  clippings: Clipping[];
  onAddClipping: (text: string) => void;
  onRemoveClipping: (id: string) => void;
  onStartAI: (mode: SummaryMode, instruction: string) => void;
  onCaptureFromPage: () => void;
  onCaptureImage: () => void;
  isProcessing: boolean;
  interference: number;
  onInterferenceChange: (value: number) => void;
}

const CaptureTab: React.FC<CaptureTabProps> = ({
  clippings,
  onAddClipping,
  onRemoveClipping,
  onStartAI,
  onCaptureFromPage,
  onCaptureImage,
  isProcessing,
  interference,
  onInterferenceChange
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
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Capture Area */}
      <section className="premium-card p-6">
        <div className="flex flex-col gap-4 mb-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <Icons.Clip />
              </span>
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent whitespace-nowrap">
                텍스트 수집
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onCaptureFromPage}
              className="text-[11px] font-bold py-2.5 rounded-xl transition-all bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:shadow-md active:scale-95 border border-indigo-100 flex items-center justify-center gap-1.5"
            >
              <span>✨</span>
              <span>텍스트 가져오기</span>
            </button>
            <button
              onClick={onCaptureImage}
              className="text-[11px] font-bold py-2.5 rounded-xl transition-all bg-purple-50 text-purple-600 hover:bg-purple-100 hover:shadow-md active:scale-95 border border-purple-100 flex items-center justify-center gap-1.5"
            >
              <Icons.Camera />
              <span>이미지 캡처</span>
            </button>
          </div>
        </div>

        <div className="relative group">
          <textarea
            id="manual-input"
            placeholder="여기에 직접 텍스트를 입력하거나 Ctrl+Enter로 수집하세요..."
            className="w-full h-36 p-5 text-sm bg-gray-50/50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none custom-scrollbar outline-none pb-12"
            onKeyDown={handleManualAdd}
          />
          <div className="absolute bottom-3 right-3">
            <button
              onClick={() => {
                const textarea = document.getElementById('manual-input') as HTMLTextAreaElement;
                if (textarea && textarea.value.trim()) {
                  onAddClipping(textarea.value.trim());
                  textarea.value = '';
                }
              }}
              className="group flex items-center justify-center bg-white/80 hover:bg-indigo-600 text-gray-400 hover:text-white border border-gray-100 hover:border-indigo-600 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm transition-all duration-300 min-w-[100px]"
            >
              <div className="flex items-center gap-1 group-hover:hidden">
                <kbd className="font-sans font-medium text-[10px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">Ctrl</kbd>
                <span className="text-[10px]">+</span>
                <kbd className="font-sans font-medium text-[10px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">Enter</kbd>
              </div>
              <span className="hidden group-hover:block text-xs font-bold animate-in fade-in zoom-in-95 duration-200">수집</span>
            </button>
          </div>
        </div>

        {clippings.length > 0 && (
          <div className="mt-5 flex flex-col gap-2 p-1">
            {clippings.map((clip) => (
              <div
                key={clip.id}
                className="group relative bg-white border border-gray-200 text-gray-600 text-xs py-2 px-3 pr-8 rounded-lg shadow-sm hover:shadow-md hover:border-indigo-200 transition-all w-full animate-in zoom-in-95 duration-200 flex items-center gap-2"
              >
                {clip.type === 'image' && clip.imageData ? (
                  <div className="w-10 h-10 rounded border border-gray-100 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
                    <img src={clip.imageData} alt="Captured" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-4 h-4 text-indigo-400 shrink-0"><Icons.Clip /></div>
                )}
                <span className="truncate opacity-80 flex-1">{clip.text}</span>
                <button
                  onClick={() => onRemoveClipping(clip.id)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI Modes Area */}
      <section className="premium-card p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">⚡</span>
          정리 방식 선택
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { id: SummaryMode.REPORT, label: '보고서형', icon: '📄', desc: '문서 요약' },
            { id: SummaryMode.EMAIL, label: '메일형', icon: '✉️', desc: '메일 초안' },
            { id: SummaryMode.NOTION, label: '노션 노트', icon: '📝', desc: '구조화 정리' },
            { id: SummaryMode.CARD, label: '카드뉴스', icon: '📇', desc: '핵심 요약' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 relative overflow-hidden group text-left ${selectedMode === mode.id
                ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-1 ring-indigo-500/20'
                : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50 hover:shadow-sm'
                }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors shrink-0 ${selectedMode === mode.id ? 'bg-white shadow-sm' : 'bg-gray-100 group-hover:bg-white'}`}>
                {mode.icon}
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-bold ${selectedMode === mode.id ? 'text-indigo-700' : 'text-gray-700'}`}>{mode.label}</span>
                <span className="text-[10px] text-gray-400 mt-0.5">{mode.desc}</span>
              </div>

              {selectedMode === mode.id && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
              )}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Optional Instruction</label>
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="예: '팀 내 공유용으로 부드러운 말투로 요약해줘'"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
          />
        </div>

        <div className="mb-8 p-4 bg-gray-50/50 border border-gray-100 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-700">AI 간섭 정도 (AI Interference)</span>
              <span className="text-[10px] text-gray-400 mt-0.5">
                {interference === 0 ? '원문에 매우 충실함' : interference <= 40 ? '정교한 요약 중심' : interference <= 70 ? '자연스러운 문장 재구성' : '창의적인 확장 및 변형'}
              </span>
            </div>
            <span className={`text-sm font-black ${interference > 70 ? 'text-purple-600' : 'text-indigo-600'}`}>{interference}%</span>
          </div>
          <div className="relative flex items-center group">
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={interference}
              onChange={(e) => onInterferenceChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none transition-all"
            />
            {/* Range markers */}
            <div className="absolute top-5 left-0 w-full flex justify-between px-0.5 pointer-events-none">
              <span className="text-[8px] font-bold text-gray-400">0%</span>
              <span className="text-[8px] font-bold text-gray-400">50%</span>
              <span className="text-[8px] font-bold text-gray-400">100%</span>
            </div>
          </div>
        </div>

        <button
          disabled={!selectedMode || clippings.length === 0 || isProcessing}
          onClick={() => selectedMode && onStartAI(selectedMode, instruction)}
          className={`w-full py-4 rounded-2xl font-bold text-base shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden group ${!selectedMode || clippings.length === 0 || isProcessing
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-500/30'
            }`}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>AI가 분석 중입니다...</span>
            </>
          ) : (
            <>
              <span>정리 시작하기</span>
              <span className="opacity-70 group-hover:translate-x-1 transition-transform">→</span>
            </>
          )}

          {/* Shine effect */}
          {!isProcessing && (!(!selectedMode || clippings.length === 0)) && (
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
          )}
        </button>
      </section>
    </div>
  );
};

export default CaptureTab;
