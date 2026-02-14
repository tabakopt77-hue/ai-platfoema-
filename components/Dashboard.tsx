import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ServerNode } from '../types';
import { Server, Activity, HardDrive, Cpu, AlertCircle } from 'lucide-react';

const mockServers: ServerNode[] = [
  { id: '1', name: 'prod-api-01', status: 'online', ip: '10.0.1.42', region: 'us-east-1' },
  { id: '2', name: 'prod-db-01', status: 'online', ip: '10.0.1.45', region: 'us-east-1' },
  { id: '3', name: 'staging-worker', status: 'warning', ip: '10.0.2.12', region: 'us-west-2' },
  { id: '4', name: 'dev-sandbox', status: 'offline', ip: '192.168.1.5', region: 'eu-central-1' },
];

const generateData = () => {
  const data = [];
  const now = new Date();
  for (let i = 0; i < 20; i++) {
    const time = new Date(now.getTime() - (20 - i) * 60000);
    data.push({
      time: time.getHours() + ':' + time.getMinutes().toString().padStart(2, '0'),
      cpu: Math.floor(Math.random() * 40) + 20,
      memory: Math.floor(Math.random() * 30) + 40,
      network: Math.floor(Math.random() * 80) + 10,
    });
  }
  return data;
};

export const Dashboard: React.FC = () => {
  const [data, setData] = useState(generateData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const next = [...prev.slice(1)];
        const lastTime = new Date();
        next.push({
          time: lastTime.getHours() + ':' + lastTime.getMinutes().toString().padStart(2, '0'),
          cpu: Math.floor(Math.random() * 40) + 20 + (Math.random() > 0.8 ? 30 : 0), // Occasional spike
          memory: Math.floor(Math.random() * 20) + 50,
          network: Math.floor(Math.random() * 60) + 20,
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusText = (status: string) => {
    switch(status) {
      case 'online': return 'В сети';
      case 'warning': return 'Внимание';
      case 'offline': return 'Оффлайн';
      default: return status;
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Обзор системы</h2>
        <p className="text-gray-400">Мониторинг узлов инфраструктуры в реальном времени.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Активные узлы</span>
            <Server className="text-blue-500 w-5 h-5" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">3/4</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Ср. нагрузка</span>
            <Activity className="text-green-500 w-5 h-5" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">42%</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Хранилище</span>
            <HardDrive className="text-purple-500 w-5 h-5" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">1.2 TB</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Оповещения</span>
            <AlertCircle className="text-red-500 w-5 h-5" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">1 Критич.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" /> Использование ресурсов кластера
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" tick={{fontSize: 12}} />
                <YAxis stroke="#9ca3af" tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" name="CPU %" />
                <Area type="monotone" dataKey="memory" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMem)" name="Mem %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Server List */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg overflow-hidden flex flex-col">
           <h3 className="text-lg font-semibold text-white mb-4">Узлы</h3>
           <div className="flex-1 overflow-y-auto pr-2 space-y-3">
             {mockServers.map(server => (
               <div key={server.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-700 hover:border-gray-500 transition-colors">
                 <div>
                   <div className="font-mono text-sm text-white font-bold">{server.name}</div>
                   <div className="text-xs text-gray-500">{server.ip} • {server.region}</div>
                 </div>
                 <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-bold uppercase
                   ${server.status === 'online' ? 'bg-green-900/30 text-green-400 border border-green-800' : 
                     server.status === 'warning' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800' :
                     'bg-red-900/30 text-red-400 border border-red-800'}`}>
                    <div className={`w-2 h-2 rounded-full ${server.status === 'online' ? 'bg-green-400' : server.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                    {getStatusText(server.status)}
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};