import React, { useState } from 'react';
import { LayoutDashboard, TerminalSquare, MessageSquare, Settings as SettingsIcon, Command, Menu } from 'lucide-react';
import { ViewState } from './types';
import { Dashboard } from './components/Dashboard';
import { Terminal } from './components/Terminal';
import { Assistant } from './components/Assistant';
import { Settings } from './components/Settings';

const App: React.FC = () => {
  // Default to Assistant view as the main "Platform"
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.AI_ASSISTANT);
  
  // In "Platform Mode", we hide the old sidebar if we are in the Assistant view
  // to let the Assistant component handle its own layout (Minimax style).
  const isPlatformMode = currentView === ViewState.AI_ASSISTANT;

  return (
    <div className="h-screen bg-[#101011] text-gray-100 overflow-hidden font-sans">
      {isPlatformMode ? (
        <Assistant onViewChange={setCurrentView} />
      ) : (
        <div className="flex h-full">
            {/* Legacy Sidebar for other views */}
            <aside className="w-64 bg-[#18181b] border-r border-zinc-800 flex flex-col">
                <div className="p-4 flex items-center gap-3 border-b border-zinc-800 h-16">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Command className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="font-bold text-lg text-white">NexusOps</h1>
                </div>
                <nav className="flex-1 p-3 space-y-2">
                    <button onClick={() => setCurrentView(ViewState.DASHBOARD)} className="w-full flex items-center gap-3 p-3 rounded-lg text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-all"><LayoutDashboard className="w-5 h-5" /> Дашборд</button>
                    <button onClick={() => setCurrentView(ViewState.AI_ASSISTANT)} className="w-full flex items-center gap-3 p-3 rounded-lg text-blue-400 bg-blue-500/10"><MessageSquare className="w-5 h-5" /> AI Платформа</button>
                    <button onClick={() => setCurrentView(ViewState.TERMINAL)} className="w-full flex items-center gap-3 p-3 rounded-lg text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-all"><TerminalSquare className="w-5 h-5" /> Терминал</button>
                    <button onClick={() => setCurrentView(ViewState.SETTINGS)} className="w-full flex items-center gap-3 p-3 rounded-lg text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-all"><SettingsIcon className="w-5 h-5" /> Настройки</button>
                </nav>
            </aside>
            <main className="flex-1 overflow-hidden relative bg-[#101011]">
                {currentView === ViewState.DASHBOARD && <Dashboard />}
                {currentView === ViewState.TERMINAL && <Terminal />}
                {currentView === ViewState.SETTINGS && <Settings />}
            </main>
        </div>
      )}
    </div>
  );
};

export default App;