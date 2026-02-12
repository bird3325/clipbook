import React, { useState } from 'react';
import { SavedItem } from '../../popup/types';
import GlassCard from './GlassCard';
import { Icons } from '../../popup/constants';

interface LibraryViewProps {
    history: SavedItem[];
    onDelete: (id: string) => void;
    onExport: (target: 'NOTION' | 'PDF', item: SavedItem) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ history, onDelete, onExport }) => {
    const [search, setSearch] = useState('');

    const filteredHistory = history.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.summary.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto pb-20">
            <div className="relative">
                <input
                    type="text"
                    placeholder="저장된 메모 검색..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none text-lg"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredHistory.length > 0 ? (
                    filteredHistory.map((item) => (
                        <GlassCard
                            key={item.id}
                            hoverEffect
                            className="group cursor-pointer p-8 transition-all hover:bg-white/90"
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(item.id);
                                }}
                                className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                title="삭제"
                            >
                                ✕
                            </button>

                            <div className="flex justify-between items-start mb-4 pr-10">
                                <div className="flex gap-3">
                                    <span className="text-xs font-bold tracking-wider text-blue-600 uppercase px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                                        {item.mode}
                                    </span>
                                    {item.target && (
                                        <span className="text-xs font-bold tracking-wider text-gray-500 uppercase px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                                            via {item.target}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400 font-medium bg-white/50 px-3 py-1 rounded-full">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="font-bold text-gray-900 mb-3 text-xl group-hover:text-blue-600 transition-colors">
                                {item.title}
                            </h3>

                            <div className="prose prose-sm max-w-none text-gray-600 mb-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                                {item.summary}
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 font-medium">
                                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"><Icons.Clip /></span>
                                    {item.clippings.length} clips
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const url = item.clippings[0]?.sourceUrl;
                                            if (url) window.open(url, '_blank');
                                        }}
                                        className="px-4 py-2 bg-white rounded-xl text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm border border-gray-200 hover:border-blue-200 shadow-sm"
                                    >
                                        원문 보기 ↗
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onExport('NOTION', item);
                                        }}
                                        className="px-4 py-2 bg-white rounded-xl text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all text-sm border border-blue-200 shadow-sm flex items-center gap-2"
                                    >
                                        <Icons.Notion /> Notion
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onExport('PDF', item);
                                        }}
                                        className="px-4 py-2 bg-white rounded-xl text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all text-sm border border-red-200 shadow-sm flex items-center gap-2"
                                    >
                                        <Icons.PDF /> PDF
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-3xl">
                            <Icons.History />
                        </div>
                        <p className="text-lg font-medium">저장된 기록이 없습니다.</p>
                        <p className="text-sm opacity-60 mt-2">새로운 텍스트를 수집하고 정리해보세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibraryView;
