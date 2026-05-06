import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import KPICard from '../components/Dashboard/KPICard';
import NexusUserManager from '../components/Admin/NexusUserManager';
import NexusAuditLogs from '../components/Admin/NexusAuditLogs';
import NexusSecurityModal from '../components/Admin/NexusSecurityModal';
import NexusNetworkChart from '../components/Admin/NexusNetworkChart';
import FraudPanel from '../components/Admin/FraudPanel';
import UniversalMetricModal from '../components/Dashboard/UniversalMetricModal';
import api from '../services/api';

const AdminDashboard = () => {
    const { token } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [showMetricModal, setShowMetricModal] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeNodes: 0,
        txVolume: '0',
        threatLevel: 'Secure'
    });
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes, fraudRes] = await Promise.all([
                    api.get('/Admin/stats'),
                    api.get('/Admin/fraud-alerts')
                ]);

                const statsData = statsRes.data;
                const fraudData = fraudRes.data;

                const totalTxs = statsData.summary.totalTransactions || 0;
                const criticalThreats = fraudData.filter(a => a.severity === 'Critical').length;
                const highThreats = fraudData.filter(a => a.severity === 'High').length;

                setStats({
                    totalProducts: statsData.summary.totalProducts,
                    activeNodes: statsData.summary.totalUsers,
                    txVolume: totalTxs > 1000 ? (totalTxs / 1000).toFixed(1) + 'K' : totalTxs.toString(),
                    threatLevel: criticalThreats > 0 ? 'Critical' : (highThreats > 0 ? 'Elevated' : 'Secure')
                });
                setChartData(statsData.chartData || []);
            } catch (err) {
                console.error("Stats fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, [token]);

    if (loading) return (
        <div className="admin-root flex items-center justify-center">
            <div className="admin-spinner"></div>
        </div>
    );

    return (
        <div className="admin-root">
            <Navbar />
            
            <main className="admin-content">
                {/* ── Hero Section ── */}
                <div className="admin-hero">
                    <div>
                        <div className="admin-hero-eyebrow">
                            <i className="bi bi-shield-check"></i>
                            <span>Central Governance Node</span>
                        </div>
                        <h1 className="admin-hero-title">Admin Hub</h1>
                        <p className="admin-hero-subtitle">Unified administrative oversight for global food traceability and blockchain verification.</p>
                    </div>
                    <div className="hidden md:flex gap-4">
                        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 flex items-center gap-2 font-bold text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            PROTOCOL ACTIVE
                        </div>
                    </div>
                </div>

                {/* ── KPI Grid ── */}
                <div className="admin-kpi-grid">
                    <KPICard 
                        title="Global Product Flow" 
                        value={stats.totalProducts} 
                        icon="📦" 
                        color="#8b5cf6" 
                        trend={+5.2}
                        progress={Math.min(100, (stats.totalProducts / 2000) * 100)}
                        onClick={() => { setSelectedMetric('flow'); setShowMetricModal(true); }}
                    />
                    <KPICard 
                        title="Authorized Nodes" 
                        value={stats.activeNodes} 
                        icon="🏭" 
                        color="#06b6d4" 
                        trend={+1.8}
                        progress={Math.min(100, (stats.activeNodes / 100) * 100)}
                        onClick={() => { setSelectedMetric('nodes'); setShowMetricModal(true); }}
                    />
                    <KPICard 
                        title="Transaction Volume" 
                        value={stats.txVolume} 
                        icon="✅" 
                        color="#10b981" 
                        trend={+12.4}
                        progress={Math.min(100, (parseInt(stats.txVolume) / 500) * 100)}
                        onClick={() => { setSelectedMetric('volume'); setShowMetricModal(true); }}
                    />
                    <KPICard 
                        title="Threat Status" 
                        value={stats.threatLevel} 
                        icon="⚠️" 
                        color={stats.threatLevel === 'Secure' ? '#10b981' : (stats.threatLevel === 'Elevated' ? '#f59e0b' : '#f43f5e')} 
                        trend={stats.threatLevel === 'Secure' ? -100 : 0}
                        progress={stats.threatLevel === 'Secure' ? 5 : (stats.threatLevel === 'Elevated' ? 45 : 95)}
                        onClick={() => { setSelectedMetric('alerts'); setShowMetricModal(true); }}
                    />
                </div>

                {/* ── Tabs Navigation ── */}
                <div className="admin-tabs">
                    <button 
                        className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <i className="bi bi-grid-1x2"></i> Overview
                    </button>
                    <button 
                        className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <i className="bi bi-people"></i> Participants
                    </button>
                    <button 
                        className={`admin-tab ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <i className="bi bi-shield-lock"></i> Security
                    </button>
                </div>

                {/* ── Content Panels ── */}
                <div className="animate-fade-in">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div className="xl:col-span-2">
                                <NexusAuditLogs />
                            </div>
                            <div className="xl:col-span-1">
                                <NexusNetworkChart data={chartData} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <NexusUserManager />
                    )}

                    {activeTab === 'security' && (
                        <div className="grid grid-cols-1 gap-6">
                            <FraudPanel token={token} />
                        </div>
                    )}
                </div>

                <UniversalMetricModal 
                    isOpen={showMetricModal} 
                    onClose={() => setShowMetricModal(false)} 
                    type={selectedMetric}
                    role="Admin"
                />
            </main>
        </div>
    );
};

export default AdminDashboard;
