
import React, { useState } from 'react';
import { SummaryMode, Clipping } from '../types';
import { Icons } from '../constants';

interface PreviewModalProps {
  mode: SummaryMode;
  content: string;
  clippings: Clipping[];
  onClose: () => void;
  onSave: (target: 'NOTION' | 'PDF', editedContent: string, title: string) => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ mode, content, clippings, onClose, onSave }) => {
  const [editedContent, setEditedContent] = useState(content);
  const [title, setTitle] = useState(`${mode} 정리본 - ${new Date().toLocaleDateString()}`);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAction = (target: 'NOTION' | 'PDF') => {
    setIsSaving(true);
    setTimeout(() => {
      onSave(target, editedContent, title);
      setIsSaving(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">정리 결과 미리보기</h2>
            <p className="text-sm text-gray-500 font-medium tracking-wide">내용을 검토하고 저장 위치를 선택하세요.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-600 hover:rotate-90 duration-300"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg font-bold border-none bg-indigo-50/50 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-400 uppercase">AI 정리본</label>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-80 p-5 bg-white border border-gray-200 rounded-2xl text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-400 uppercase">수집된 원문</label>
              <div className="h-80 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {clippings.map(c => (
                  <div key={c.id} className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 border border-gray-100">
                    "{c.text}"
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleSaveAction('NOTION')}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#111] text-white rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50"
          >
            <Icons.Notion /> 노션으로 저장
          </button>
          <button
            onClick={() => handleSaveAction('PDF')}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            <Icons.PDF /> PDF 파일 저장
          </button>
        </div>

        {isSaving && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-[60]">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-gray-800">문서를 전송 중입니다...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewModal;
