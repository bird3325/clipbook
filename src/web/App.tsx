import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';

const App = () => {
    const [activeTab, setActiveTab] = useState('capture');

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-500/20 flex">
            {/* Abstract Background Elements - Light Mode */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[150px]" />
            </div>

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
