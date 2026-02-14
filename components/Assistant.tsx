import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Database, Globe, Zap, Terminal, Copy, Plus, Trash2 } from 'lucide-react';
import { generateDevOpsAdvice } from '../services/gemini';
import { ChatMessage, KnowledgeItem } from '../types';

export const Assistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'deploy' | 'knowledge'>('chat');
  
  // --- Chat State ---
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Привет! Я NexusOps 2.0 с доступом в Интернет. \n\nЯ могу:\n1. Гуглить актуальные решения.\n2. Генерировать полные скрипты деплоя (Git -> Server).\n3. Запоминать детали вашего проекта в Базе Знаний.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // --- Knowledge Base State (Self-Learning Simulation) ---
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);
  const [newKnowledge, setNewKnowledge] = useState('');

  // --- Deploy State ---
  const [repoUrl, setRepoUrl] = useState('');
  const [deployType, setDeployType] = useState('docker');

  // Load Knowledge and Settings on Mount
  useEffect(() => {
    const savedKnowledge = localStorage.getItem('nexus_knowledge');
    if (savedKnowledge) {
      setKnowledgeBase(JSON.parse(savedKnowledge));
    }
    
    const settings = localStorage.getItem('nexus_ssh_settings');
    if (settings) {
      // Pre-fill context if needed, though mostly handled in Settings
    }
  }, []);

  // Save Knowledge when changed
  useEffect(() => {
    localStorage.setItem('nexus_knowledge', JSON.stringify(knowledgeBase));
  }, [knowledgeBase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // --- Handlers ---

  const handleSend = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Prepare history for API
    const historyForModel = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));
    historyForModel.push({ role: 'user', parts: [{ text: userMsg.text }] });

    // Call API with Knowledge Base injected
    const response = await generateDevOpsAdvice(userMsg.text, historyForModel, knowledgeBase);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: response.text,
      sources: response.sources,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, modelMsg]);
    setLoading(false);
  };

  const addKnowledge = () => {
    if (!newKnowledge.trim()) return;
    const item: KnowledgeItem = {
      id: Date.now().toString(),
      category: 'project',
      content: newKnowledge,
      addedAt: new Date()
    };
    setKnowledgeBase([...knowledgeBase, item]);
    setNewKnowledge('');
  };

  const removeKnowledge = (id: string) => {
    setKnowledgeBase(knowledgeBase.filter(k => k.id !== id));
  };

  const handleAutoDeploy = () => {
    // Construct a prompt that asks for a full script based on settings
    const settings = JSON.parse(localStorage.getItem('nexus_ssh_settings') || '{}');
    const host = settings.host || 'SERVER_IP';
    const user = settings.username || 'root';
    
    const prompt = `Мне нужно развернуть проект.
    Репозиторий: ${repoUrl}
    Тип деплоя: ${deployType}
    Целевой сервер: ${user}@${host}
    
    Пожалуйста, напиши ПОЛНЫЙ, ЕДИНЫЙ bash-скрипт (setup_deploy.sh), который я могу запустить на своем локальном компьютере.
    Скрипт должен:
    1. Подключаться по SSH (используя paramiko или ssh command).
    2. Устанавливать Docker и Git на удаленном сервере, если их нет.
    3. Клонировать репо (или делать git pull).
    4. Собирать и запускать контейнер.
    
    Ничего лишнего, только код скрипта и краткая инструкция как запустить.`;
    
    setActiveTab('chat');
    handleSend(undefined, prompt);
  };

  // --- Render Helpers ---

  const formatMessage = (text: string) => {
    return text.split('```').map((part, index) => {
      if (index % 2 === 1) {
        return (
          <div key={index} className="relative group my-2">
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => navigator.clipboard.writeText(part.trim())}
                className="p-1 bg-gray-700 rounded text-gray-300 hover:text-white"
                title="Скопировать код"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <pre className="bg-[#0d1117] p-4 rounded-lg overflow-x-auto text-xs font-mono border border-gray-700 text-gray-300">
              {part.trim()}
            </pre>
          </div>
        );
      }
      return <div key={index} className="whitespace-pre-wrap mb-2">{part}</div>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Tabs Header */}
      <div className="flex items-center border-b border-gray-800 bg-gray-900/50 backdrop-blur z-10">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 p-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'chat' ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Bot className="w-4 h-4" /> Чат с ИИ
        </button>
        <button
          onClick={() => setActiveTab('deploy')}
          className={`flex-1 p-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'deploy' ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/5' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Zap className="w-4 h-4" /> Авто-Деплой
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex-1 p-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'knowledge' ? 'text-green-400 border-b-2 border-green-500 bg-green-500/5' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Database className="w-4 h-4" /> База Знаний
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative bg-[#0f1115]">
        
        {/* VIEW: CHAT */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${
                    msg.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-600 to-indigo-600'
                  }`}>
                    {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                  </div>
                  
                  <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-4 text-sm leading-relaxed shadow-lg ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-2xl rounded-tl-sm'
                    }`}>
                      {formatMessage(msg.text)}
                    </div>
                    
                    {/* Sources / Grounding */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.sources.map((src, idx) => (
                          <a 
                            key={idx} 
                            href={src.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs text-blue-400 hover:border-blue-500 transition-colors"
                          >
                            <Globe className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-1 text-[10px] text-gray-500">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-gray-800"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-800 rounded w-3/4"></div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-900 border-t border-gray-800">
              <form onSubmit={(e) => handleSend(e)} className="relative max-w-4xl mx-auto">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Спроси о деплое, ошибках или попроси написать скрипт..."
                  className="w-full bg-[#1c2128] text-white placeholder-gray-500 border border-gray-700 rounded-xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW: AUTO DEPLOY */}
        {activeTab === 'deploy' && (
          <div className="h-full overflow-y-auto p-8 max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-2">Генератор Деплоя</h2>
              <p className="text-gray-400">ИИ создаст executable-скрипт для автоматического развертывания.</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 space-y-6 shadow-xl">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Git Repository URL</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/project.git"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <Globe className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Стратегия</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setDeployType('docker')}
                    className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${deployType === 'docker' ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                  >
                    <div className="font-bold">Docker Compose</div>
                    <div className="text-xs text-center opacity-70">Build & Up container</div>
                  </button>
                  <button 
                    onClick={() => setDeployType('nginx')}
                    className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${deployType === 'nginx' ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                  >
                    <div className="font-bold">Nginx + Static</div>
                    <div className="text-xs text-center opacity-70">Build React & Copy to /var/www</div>
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleAutoDeploy}
                  disabled={!repoUrl}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Terminal className="w-5 h-5" />
                  Сгенерировать Скрипт Деплоя
                </button>
                <p className="text-xs text-center text-gray-500 mt-4">
                  ИИ проанализирует конфигурацию и создаст скрипт в чате, который можно запустить локально.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: KNOWLEDGE BASE */}
        {activeTab === 'knowledge' && (
          <div className="h-full overflow-y-auto p-8 max-w-4xl mx-auto">
             <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">База Знаний (Self-Learning)</h2>
                <p className="text-gray-400">Факты, которые ИИ будет "помнить" и использовать в каждом ответе.</p>
              </div>
              <div className="px-3 py-1 bg-green-900/30 border border-green-800 text-green-400 rounded-full text-xs font-mono">
                {knowledgeBase.length} записей
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <input 
                type="text" 
                value={newKnowledge}
                onChange={(e) => setNewKnowledge(e.target.value)}
                placeholder="Например: Сервер prod-01 использует порт 8080 для API..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && addKnowledge()}
              />
              <button 
                onClick={addKnowledge}
                className="bg-green-600 hover:bg-green-500 text-white px-6 rounded-lg font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Добавить
              </button>
            </div>

            <div className="space-y-3">
              {knowledgeBase.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-gray-800/50 rounded-xl border border-gray-800 border-dashed">
                  База знаний пуста. Добавьте информацию о проекте, чтобы ИИ стал умнее.
                </div>
              ) : (
                knowledgeBase.map(item => (
                  <div key={item.id} className="bg-gray-800 border border-gray-700 p-4 rounded-lg flex items-start justify-between group hover:border-green-500/50 transition-colors">
                    <div className="flex gap-3">
                      <div className="mt-1 w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                      <div>
                        <p className="text-gray-200">{item.content}</p>
                        <p className="text-xs text-gray-500 mt-1">Добавлено: {new Date(item.addedAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeKnowledge(item.id)}
                      className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};