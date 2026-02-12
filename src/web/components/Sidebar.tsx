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
const LogoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
);

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
    return (
        <aside className="w-64 h-screen fixed left-0 top-0 bg-white/80 backdrop-blur-md border-r border-gray-200 flex flex-col z-50 shadow-sm">
            <div className="p-6 flex items-center gap-3">
                <LogoIcon />
                <span className="text-xl font-bold text-blue-600">
                    Clipbook
                </span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
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

            <div className="p-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">사용자</span>
                        <span className="text-xs text-gray-500">프로 요금제</span>
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
                flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group font-medium
                ${active
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }
            `}
        >
            {React.cloneElement(icon as React.ReactElement, {
                className: `transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110 text-gray-400 group-hover:text-blue-500'}`
            })}
            <span>{label}</span>
        </button>
    )
}

export default Sidebar;
