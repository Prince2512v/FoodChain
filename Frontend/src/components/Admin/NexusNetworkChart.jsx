import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const NexusNetworkChart = ({ data }) => {
    return (
        <div className="admin-panel h-full">
            <div className="admin-panel-header">
                <h3 className="admin-panel-title">
                    <i className="bi bi-graph-up-arrow text-emerald-500"></i> Protocol Throughput
                </h3>
            </div>
            <div className="admin-panel-body" style={{ height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid rgba(0,0,0,0.05)', 
                                borderRadius: '16px',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                fontSize: '12px',
                                color: '#1e293b'
                            }}
                            itemStyle={{ fontWeight: 'bold' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="transactions" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="products" 
                            stroke="#8b5cf6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorProducts)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
                
                <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                        <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Transactions</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_#8b5cf6]"></div>
                        <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Inventory</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NexusNetworkChart;
