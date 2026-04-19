import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const OverviewChart = ({ data, title }) => {
    // Mock data for the distribution pie if specific data isn't passed
    const distributionData = [
        { name: 'Harvested', value: 400, color: '#10b981' },
        { name: 'Processing', value: 300, color: '#6366f1' },
        { name: 'Shipped', value: 200, color: '#0ea5e9' },
        { name: 'In Store', value: 100, color: '#f59e0b' },
    ];

    return (
        <div className="glass-panel p-4 h-100 animate-fade-in">
            <h4 className="fw-bold mb-4 text-dark d-flex align-items-center">
                <i className="bi bi-graph-up-arrow me-2 text-primary"></i>
                {title}
            </h4>
            <Row className="g-4">
                <Col lg={8}>
                    <div style={{ height: '350px', width: '100%', background: 'rgba(255,255,255,0.3)', borderRadius: '16px', padding: '15px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backdropFilter: 'blur(8px)' }}
                                    itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#6366f1" 
                                    fillOpacity={1} 
                                    fill="url(#colorCount)" 
                                    strokeWidth={3} 
                                    animationDuration={1500}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="issues" 
                                    stroke="#ec4899" 
                                    fillOpacity={0} 
                                    strokeWidth={2} 
                                    strokeDasharray="5 5"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
                <Col lg={4}>
                    <div className="d-flex flex-column h-100 justify-content-center align-items-center p-3" style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '16px' }}>
                        <h6 className="fw-bold mb-3 text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Inventory Health</h6>
                        <div style={{ height: '250px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default OverviewChart;

