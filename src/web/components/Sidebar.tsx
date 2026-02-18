import React from 'react';

// Simple icon placeholders (SVG)
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
);
const LibraryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 6 4 14" /><path d="M12 6v14" /><path d="M8 8v12" /><path d="M4 4v16" /></svg>
);
const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
);
const GuideIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
);

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
    return (
        <aside className="w-64 h-screen fixed left-0 top-0 flex flex-col z-50 bg-[#F8F9FC]">
            {/* Logo Area */}
            <div className="px-6 py-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                    <img src="/icons/icon48.png" alt="Logo" className="w-5 h-5 object-contain" />
                </div>
                <span className="text-lg font-bold text-slate-900 tracking-tight">
                    Clipbook
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1">
                <NavItem
                    icon={<HomeIcon />}
                    label="수집 및 정리"
                    active={activeTab === 'capture'}
                    onClick={() => onTabChange('capture')}
                />
                <NavItem
                    icon={<LibraryIcon />}
                    label="기록 보관함"
                    active={activeTab === 'library'}
                    onClick={() => onTabChange('library')}
                />
                <NavItem
                    icon={<GuideIcon />}
                    label="이용 가이드"
                    active={activeTab === 'guide'}
                    onClick={() => onTabChange('guide')}
                />
                <NavItem
                    icon={<SettingsIcon />}
                    label="환경 설정"
                    active={activeTab === 'settings'}
                    onClick={() => onTabChange('settings')}
                />
            </nav>

            {/* Profile Area */}
            <div className="p-4 mx-3 mb-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:border-indigo-200 transition-colors cursor-pointer group">
                    <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                        U
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-900 truncate">User</p>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">PRO</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">Free Plan</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group font-medium text-[14px] cursor-pointer
        ${active
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                }
      `}
        >
            <span className={`transition-colors duration-200 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {React.cloneElement(icon as React.ReactElement, {
                    width: 18,
                    height: 18,
                    strokeWidth: active ? 2.5 : 2
                })}
            </span>
            {label}
        </button>
    );
};

export default Sidebar;
