import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

export const Terminal: React.FC = () => {
  const [history, setHistory] = useState<string[]>([
    "NexusOps Shell v2.1.0",
    "Подключено к local-sandbox...",
    "Введите 'help' для списка доступных команд.",
    ""
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    const newHistory = [...history, `user@nexus:~$ ${input}`];

    if (cmd === 'help') {
      newHistory.push(
        "Доступные команды:",
        "  status    - Проверить статус системы",
        "  clear     - Очистить терминал",
        "  connect   - Симуляция SSH подключения",
        "  whoami    - Показать текущего пользователя"
      );
    } else if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (cmd === 'status') {
      newHistory.push("Система РАБОТАЕТ НОРМАЛЬНО.", "Все системы в порядке.");
    } else if (cmd === 'whoami') {
      newHistory.push("admin");
    } else if (cmd.startsWith('connect')) {
      newHistory.push(`Попытка подключения...`, `Ошибка: Невозможно выполнить реальный SSH из песочницы браузера.`, `Используйте ИИ-ассистента для генерации скрипта Paramiko.`);
    } else {
      newHistory.push(`команда не найдена: ${cmd}`);
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 text-gray-400">
        <TerminalIcon className="w-5 h-5" />
        <span className="font-mono text-sm">/bin/zsh - nexus-server-01</span>
      </div>
      <div className="flex-1 bg-black rounded-lg border border-gray-700 font-mono text-sm p-4 overflow-hidden flex flex-col shadow-2xl">
        <div className="flex-1 overflow-y-auto space-y-1">
          {history.map((line, idx) => (
            <div key={idx} className={`${line.startsWith('user@') ? 'text-green-400' : 'text-gray-300'}`}>
              {line}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleCommand} className="mt-2 flex items-center gap-2 border-t border-gray-800 pt-2">
          <span className="text-green-500">➜</span>
          <span className="text-blue-400">~</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-600 focus:ring-0"
            placeholder="Введите команду..."
            autoFocus
          />
        </form>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        * Это симуляция терминала. Реальное выполнение команд отключено в данной среде.
      </p>
    </div>
  );
};