import React, { useState, useEffect } from 'react';
import { Save, Server, Shield, Key, Terminal, Eye, EyeOff } from 'lucide-react';

export const Settings: React.FC = () => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('22');
  const [username, setUsername] = useState('');
  const [passwordOrKey, setPasswordOrKey] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('nexus_ssh_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setHost(parsed.host || '');
        setPort(parsed.port || '22');
        setUsername(parsed.username || '');
        setPasswordOrKey(parsed.passwordOrKey || '');
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const handleSave = () => {
    const settings = { host, port, username, passwordOrKey };
    localStorage.setItem('nexus_ssh_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 h-full overflow-y-auto max-w-5xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Конфигурация</h2>
        <p className="text-gray-400">Управление деталями подключения и настройками.</p>
      </header>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Server className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Детали SSH подключения</h3>
            <p className="text-sm text-gray-400">
              Эти данные сохраняются в локальном хранилище браузера для удобства.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Host */}
          <div className="md:col-span-8 space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              Хост / IP-адрес
            </label>
            <div className="relative">
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                placeholder="например 192.168.1.50 или example.com"
              />
              <Server className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Port */}
          <div className="md:col-span-4 space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              Порт
            </label>
            <div className="relative">
               <input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                placeholder="22"
              />
              <Terminal className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Username */}
          <div className="md:col-span-6 space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              Имя пользователя
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                placeholder="root"
              />
              <Shield className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Password / Key */}
          <div className="md:col-span-12 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                Приватный ключ / Пароль
              </label>
              <button 
                onClick={() => setShowSecret(!showSecret)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {showSecret ? <EyeOff className="w-3 h-3"/> : <Eye className="w-3 h-3"/>}
                {showSecret ? 'Скрыть' : 'Показать'}
              </button>
            </div>
            <div className="relative">
              <textarea
                value={passwordOrKey}
                onChange={(e) => setPasswordOrKey(e.target.value)}
                className={`w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pl-10 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${showSecret ? '' : 'text-gray-500'}`}
                placeholder="-----BEGIN OPENSSH PRIVATE KEY-----..."
                rows={5}
                style={showSecret ? {} : { WebkitTextSecurity: 'disc' } as any}
              />
              <Key className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
            </div>
             <p className="text-xs text-yellow-600/80 mt-1 flex items-center gap-1">
              Примечание: Учетные данные хранятся локально в вашем браузере. Не используйте реальные секреты в этой песочнице.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg ${
              saved 
                ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? 'Настройки сохранены' : 'Сохранить конфигурацию'}
          </button>
        </div>
      </div>
    </div>
  );
};