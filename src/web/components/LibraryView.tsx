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
        <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-24">
            <div className="relative">
                <input
                    type="text"
                    placeholder="저장된 메모 검색..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl shadow-sm border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-lg text-slate-900 placeholder-slate-400"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
                {filteredHistory.length > 0 ? (
                    filteredHistory.map((item) => (
                        <GlassCard
                            key={item.id}
                            hoverEffect
                            className="group cursor-pointer p-0 transition-all hover:bg-white overflow-hidden"
                        >
                            <div className="p-7">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(item.id);
                                    }}
                                    className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="삭제"
                                >
                                    ✕
                                </button>

                                <div className="flex justify-between items-start mb-4 pr-10">
                                    <div className="flex gap-2">
                                        <span className="text-[11px] font-bold tracking-wider text-indigo-600 uppercase px-2.5 py-1 bg-indigo-50 rounded border border-indigo-100">
                                            {item.mode}
                                        </span>
                                        {item.target && (
                                            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase px-2.5 py-1 bg-slate-50 rounded border border-slate-200">
                                                via {item.target}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="font-bold text-slate-900 mb-3 text-lg leading-snug group-hover:text-indigo-600 transition-colors">
                                    {item.title}
                                </h3>

                                <div className="prose prose-sm max-w-none text-slate-600 mb-6 line-clamp-2 group-hover:line-clamp-none transition-all duration-300 leading-relaxed">
                                    {item.summary}
                                </div>

                                <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                        <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500"><Icons.Clip /></span>
                                        {item.clippings.length} clips
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform translate-y-1 group-hover:translate-y-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const url = item.clippings[0]?.sourceUrl;
                                                if (url) window.open(url, '_blank');
                                            }}
                                            className="px-3 py-1.5 bg-white rounded-lg text-slate-600 font-medium hover:bg-slate-50 hover:text-indigo-600 transition-colors text-xs border border-slate-200 hover:border-indigo-200 shadow-sm cursor-pointer"
                                        >
                                            원문
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onExport('NOTION', item);
                                            }}
                                            className="px-3 py-1.5 bg-white rounded-lg text-slate-700 font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all text-xs border border-slate-200 hover:border-indigo-200 shadow-sm flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Icons.Notion /> Notion
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onExport('PDF', item);
                                            }}
                                            className="px-3 py-1.5 bg-white rounded-lg text-slate-700 font-bold hover:bg-red-50 hover:text-red-600 transition-all text-xs border border-slate-200 hover:border-red-200 shadow-sm flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Icons.PDF /> PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 text-4xl text-gray-300">
                            <Icons.History />
                        </div>
                        <p className="text-xl font-bold text-gray-400">저장된 기록이 없습니다.</p>
                        <p className="text-sm text-gray-400 mt-2">새로운 텍스트를 수집하고 정리해보세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibraryView;
