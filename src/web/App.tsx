import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';

const App = () => {
    const [activeTab, setActiveTab] = useState('capture');

    return (
        <div className="min-h-screen bg-[#F8F9FC] text-slate-900 font-sans selection:bg-indigo-500/10 selection:text-indigo-900 flex tracking-tight">
            {/* Subtle Gradient Spot - Top Right */}
            <div className="fixed top-0 right-0 w-[800px] h-[600px] bg-indigo-50/50 rounded-full blur-[120px] pointer-events-none opacity-60" />
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-slate-100/50 rounded-full blur-[100px] pointer-events-none opacity-60" />

            {/* Navigation */}
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Main Content */}
            <div className="relative z-10 w-full flex flex-col h-screen">
                <Dashboard activeTab={activeTab} />
            </div>
        </div>
    );
};

export default App;
