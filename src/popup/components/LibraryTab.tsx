
import React, { useState } from 'react';
import { SavedItem } from '../types';
import { Icons } from '../constants';

interface LibraryTabProps {
  history: SavedItem[];
  onDelete: (id: string) => void;
  onExport: (target: 'NOTION' | 'PDF', item: SavedItem) => void;
}

const LibraryTab: React.FC<LibraryTabProps> = ({ history, onDelete, onExport }) => {
  const [search, setSearch] = useState('');

  const filteredHistory = history.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      <div className="relative">
        <input
          type="text"
          placeholder="저장된 메모 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-sm border border-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                const el = document.getElementById(`summary-${item.id}`);
                if (el) el.classList.toggle('line-clamp-2');
              }}
              className="premium-card p-5 cursor-pointer group hover:border-indigo-300 relative"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                title="삭제"
              >
                ✕
              </button>

              <div className="flex justify-between items-start mb-3 pr-8">
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold tracking-wider text-indigo-600 uppercase px-2 py-1 bg-indigo-50 rounded-md border border-indigo-100">
                    {item.mode}
                  </span>
                  {item.target && (
                    <span className="text-[10px] font-bold tracking-wider text-gray-600 uppercase px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                      via {item.target}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 font-medium">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
                {item.title}
              </h3>
              <div className="flex gap-4 mb-2">
                {item.clippings.find(c => c.type === 'image' && c.imageData) && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-100 shadow-sm">
                    <img
                      src={item.clippings.find(c => c.type === 'image')?.imageData}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <p id={`summary-${item.id}`} className="text-sm text-gray-600 line-clamp-3 leading-relaxed transition-all flex-1">
                  {item.summary}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <Icons.Clip /> {item.clippings.length} clips
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = item.clippings[0]?.sourceUrl;
                      if (url) window.open(url, '_blank');
                    }}
                    className="px-3 py-1.5 bg-gray-50 rounded-lg text-gray-600 font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-xs border border-gray-200 hover:border-indigo-200"
                  >
                    원문 ↗
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExport('NOTION', item);
                    }}
                    className="px-3 py-1.5 bg-white rounded-lg text-indigo-600 font-bold hover:bg-indigo-600 hover:text-white transition-all text-xs border border-indigo-200 shadow-sm"
                  >
                    Notion
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExport('PDF', item);
                    }}
                    className="px-3 py-1.5 bg-white rounded-lg text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all text-xs border border-red-200 shadow-sm"
                  >
                    PDF
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <Icons.History />
            </div>
            <p className="text-sm">기록이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryTab;
