import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

const SalesAnalytics = ({ inventory = [] }) => {
    // Mock data for trends since we don't have a large historical sales table yet
    const data = [
        { name: 'Mon', sales: 12, Stock: 40 },
        { name: 'Tue', sales: 19, Stock: 35 },
        { name: 'Wed', sales: 3, Stock: 32 },
        { name: 'Thu', sales: 5, Stock: 28 },
        { name: 'Fri', sales: 2, Stock: 26 },
        { name: 'Sat', sales: 0, Stock: 26 },
        { name: 'Sun', sales: 15, Stock: 10 },
    ];

    return (
        <div className="sales-analytics glass-card p-4 rounded-4">
            <h4 className="fw-bold mb-4 text-warning"><i className="bi bi-graph-up-arrow me-2"></i>Market Trends & Inventory Health</h4>
            <div className="row">
                <div className="col-lg-6 mb-4">
                    <h6 className="text-muted mb-3 text-uppercase small">Weekly Sales Volume</h6>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip contentStyle={{ background: '#1c1c1c', border: 'none', borderRadius: '10px' }} />
                                <Legend />
                                <Bar dataKey="sales" fill="#fbbf24" radius={[5, 5, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="col-lg-6 mb-4">
                    <h6 className="text-muted mb-3 text-uppercase small">Stock Depletion Rate</h6>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip contentStyle={{ background: '#1c1c1c', border: 'none', borderRadius: '10px' }} />
                                <Legend />
                                <Line type="monotone" dataKey="Stock" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesAnalytics;
