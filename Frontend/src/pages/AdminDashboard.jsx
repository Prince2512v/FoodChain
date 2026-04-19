import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import KPICard from '../components/Dashboard/KPICard';
import OverviewChart from '../components/Dashboard/OverviewChart';
import ActivityFeed from '../components/Dashboard/ActivityFeed';
import UserManager from '../components/Admin/UserManager';
import FraudPanel from '../components/Admin/FraudPanel';

const AdminDashboard = () => {
    const { token } = useContext(AuthContext);
    const [summary, setSummary] = useState(null);
    const [performance, setPerformance] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [summaryRes, perfRes, actRes] = await Promise.all([
                    fetch('http://localhost:5160/api/dashboard/summary', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('http://localhost:5160/api/dashboard/performance', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('http://localhost:5160/api/dashboard/recent-activities', { headers: { Authorization: `Bearer ${token}` } })
                ]);

                if (summaryRes.ok) setSummary(await summaryRes.json());
                if (perfRes.ok) setPerformance(await perfRes.json());
                if (actRes.ok) setActivities(await actRes.json());
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [token]);

    if (loading || !summary) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-800 border-t-transparent"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
                {/* ── Hero Section ── */}
                <div className="bg-slate-900 rounded-3xl p-6 md:p-8 mb-8 border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                    {/* Decorative cyber grid background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <i className="bi bi-shield-lock-fill text-sky-400 text-xl"></i>
                            <span className="text-[0.7rem] font-bold text-sky-400 tracking-[0.2em] uppercase mt-0.5">
                                Nexus Control Center
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white m-0">
                            Global Administrator
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 relative z-10 hidden md:flex">
                        <div className="text-right">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[0.65rem] font-bold tracking-widest shadow-sm mb-1 uppercase">
                                <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                Network Secure
                            </div>
                            <p className="text-xs font-semibold text-slate-400 m-0">
                                Node Status: <span className="text-slate-300 font-bold">Synchronized</span>
                            </p>
                        </div>
                        <div className="h-14 w-14 rounded-2xl bg-slate-800 text-sky-400 flex items-center justify-center flex-shrink-0 border border-slate-700 shadow-inner">
                            <i className="bi bi-cpu text-2xl"></i>
                        </div>
                    </div>
                </div>

                {/* ── Metrics Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <KPICard title="Total Products" value={summary.total || 0} icon="📦" color="#3b82f6" trend={+5} />
                    <KPICard title="In Transit" value={summary.inTransit || 0} icon="🚛" color="#0ea5e9" trend={+12} />
                    <KPICard title="Delivered" value={summary.delivered || 0} icon="✅" color="#10b981" trend={+8} />
                    <KPICard title="System Alerts" value={summary.rejected || 0} icon="⚠️" color="#ef4444" trend={-2} />
                </div>

                {/* Charts & Activity Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 h-full">
                        <OverviewChart data={performance} title="Chain Throughput & System Health" />
                    </div>
                    <div className="lg:col-span-1 h-full">
                        <ActivityFeed activities={activities} />
                    </div>
                </div>

                {/* ── Sub-Panels ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 h-full">
                        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 overflow-hidden h-full">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                <h4 className="text-xl font-extrabold text-slate-800 m-0 flex items-center gap-2">
                                     <i className="bi bi-shield-check text-slate-400"></i> Security Oversight
                                </h4>
                                <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[0.65rem] font-bold tracking-widest shadow-sm uppercase animate-pulse">
                                    LIVE THREAT SCAN
                                </span>
                            </div>
                            <FraudPanel token={token} />
                        </div>
                    </div>
                    <div className="lg:col-span-5 h-full">
                        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 overflow-hidden h-full">
                            <h4 className="text-xl font-extrabold text-slate-800 m-0 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                                <i className="bi bi-people-fill text-slate-400"></i> Node Authority
                            </h4>
                            <UserManager />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
