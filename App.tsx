import React, { useState } from 'react';
import { LayoutDashboard, TerminalSquare, MessageSquare, Settings as SettingsIcon, Command, Menu } from 'lucide-react';
import { ViewState } from './types';
import { Dashboard } from './components/Dashboard';
import { Terminal } from './components/Terminal';
import { Assistant } from './components/Assistant';
import { Settings } from './components/Settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getPageTitle = (view: ViewState) => {
    switch(view) {
      case ViewState.DASHBOARD: return 'дашборд';
      case ViewState.TERMINAL: return 'терминал';
      case ViewState.AI_ASSISTANT: return 'ассистент';
      case ViewState.SETTINGS: return 'настройки';
      default: return 'дашборд';
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.TERMINAL:
        return <Terminal />;
      case ViewState.AI_ASSISTANT:
        return <Assistant />;
      case ViewState.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center gap-3 border-b border-gray-800 h-16">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Command className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && <h1 className="font-bold text-lg tracking-tight text-white">NexusOps</h1>}
        </div>

        <nav className="flex-1 p-3 space-y-2">
          <button
            onClick={() => setCurrentView(ViewState.DASHBOARD)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              currentView === ViewState.DASHBOARD ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Дашборд</span>}
          </button>

          <button
            onClick={() => setCurrentView(ViewState.TERMINAL)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              currentView === ViewState.TERMINAL ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <TerminalSquare className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Терминал</span>}
          </button>

          <button
            onClick={() => setCurrentView(ViewState.AI_ASSISTANT)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              currentView === ViewState.AI_ASSISTANT ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">ИИ Развертывание</span>}
          </button>

          <button
            onClick={() => setCurrentView(ViewState.SETTINGS)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              currentView === ViewState.SETTINGS ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Настройки</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-950">
        <header className="h-16 bg-gray-900/50 backdrop-blur border-b border-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm breadcrumbs text-gray-400">
             <span className="text-gray-600">nexus</span>
             <span className="text-gray-600">/</span>
             <span className="text-white font-medium capitalize">{getPageTitle(currentView)}</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-xs text-green-400 flex items-center gap-2 px-3 py-1.5 bg-green-900/20 rounded-full border border-green-900/50">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
               Система в норме
             </div>
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border border-white/10"></div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;