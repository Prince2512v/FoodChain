import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import KPICard from '../components/Dashboard/KPICard';
import OverviewChart from '../components/Dashboard/OverviewChart';
import ActivityFeed from '../components/Dashboard/ActivityFeed';
import HarvestList from '../components/Farmer/HarvestList';
import UniversalMetricModal from '../components/Dashboard/UniversalMetricModal';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';

const FarmerDashboard = () => {
    const { token, user } = useContext(AuthContext);
    const [summary, setSummary] = useState(null);
    const [performance, setPerformance] = useState([]);
    const [activities, setActivities] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQR, setShowQR] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [showMetricModal, setShowMetricModal] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState(null);
    const navigate = useNavigate();

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const [summaryRes, perfRes, actRes, prodRes] = await Promise.all([
                api.get('/dashboard/summary').catch(() => ({ data: {} })),
                api.get('/dashboard/performance').catch(() => ({ data: [] })),
                api.get('/dashboard/recent-activities').catch(() => ({ data: [] })),
                api.get('/Farmer/products').catch(() => ({ data: [] }))
            ]);

            setSummary(summaryRes.data);
            setPerformance(perfRes.data);
            setActivities(actRes.data);
            setProducts(prodRes.data || []);
        } catch (err) {
            console.error("Farmer Dashboard error:", err);
            setSummary({});
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleShowQR = (batchId) => {
        setSelectedBatch(batchId);
        setShowQR(true);
    };

    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (loading || !summary || !isClient) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
                <p className="text-emerald-700 font-bold animate-pulse tracking-widest uppercase text-xs">Synchronizing Nodes...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
                {/* ── Hero Section ── */}
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 mb-8 border border-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <i className="bi bi-flower1 text-emerald-500 text-xl"></i>
                            <span className="text-[0.7rem] font-bold text-emerald-600 tracking-[0.2em] uppercase">
                                Source Production Node
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                            Farmer Hub
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 hidden md:flex">
                        <button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 rounded-2xl font-bold shadow-sm shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 border border-emerald-500"
                            onClick={() => navigate('/add-product')}
                        >
                            <i className="bi bi-plus-circle-fill text-lg"></i>
                            LOG NEW HARVEST
                        </button>
                    </div>
                </div>

                {/* ── Metrics Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <KPICard
                        title="Total Yield"
                        value={summary.total || 0}
                        icon="🌾"
                        color="#10b981"
                        trend={0}
                        onClick={() => { setSelectedMetric('yield'); setShowMetricModal(true); }}
                    />
                    <KPICard
                        title="In Processing"
                        value={summary.processing || 0}
                        icon="🏭"
                        color="#3b82f6"
                        trend={0}
                        onClick={() => { setSelectedMetric('processing'); setShowMetricModal(true); }}
                    />
                    <KPICard
                        title="Delivered"
                        value={summary.delivered || 0}
                        icon="🚚"
                        color="#8b5cf6"
                        trend={0}
                        onClick={() => { setSelectedMetric('delivered'); setShowMetricModal(true); }}
                    />
                    <KPICard
                        title="Quality Alerts"
                        value={summary.rejected || 0}
                        icon="⚠️"
                        color="#ef4444"
                        trend={0}
                        onClick={() => { setSelectedMetric('alerts'); setShowMetricModal(true); }}
                    />
                </div>

                {/* Charts & Activity Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 h-full">
                        <OverviewChart data={performance} title="Harvest & Yield Performance" />
                    </div>
                    <div className="lg:col-span-1 h-full">
                        <ActivityFeed activities={activities} />
                    </div>
                </div>

                {/* ── Inventory List ── */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl shadow-sm overflow-hidden min-h-[40vh]">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h4 className="text-xl font-extrabold text-slate-800 m-0 flex items-center gap-2">
                            <i className="bi bi-box-seam-fill text-emerald-500"></i> My Farmed Batches
                        </h4>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold tracking-widest shadow-sm">
                            LIVE INVENTORY
                        </span>
                    </div>

                    <div className="p-6">
                        <HarvestList
                            products={products}
                            loading={false}
                            onShowQR={handleShowQR}
                            onNavigateDetails={(id) => {
                                const product = products.find(p => p.id === id);
                                if (product) navigate(`/track/${product.batchId}`);
                            }}
                            onInitialize={() => navigate('/add-product')}
                        />
                    </div>
                </div>

                <UniversalMetricModal 
                    isOpen={showMetricModal} 
                    onClose={() => setShowMetricModal(false)} 
                    type={selectedMetric}
                    role="Farmer"
                />
            </main>

            {/* QR Modal Overlay */}
            {showQR && (
                <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowQR(false)}>
                    <div className="bg-white border border-slate-200 shadow-2xl p-8 rounded-3xl text-center relative max-w-sm w-full transform scale-100 transition-transform" onClick={e => e.stopPropagation()}>
                        <button className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors focus:outline-none" onClick={() => setShowQR(false)}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                        <div className="bg-emerald-50 p-4 border border-emerald-100 rounded-2xl inline-block mb-6 shadow-sm">
                            <QRCodeSVG value={`${window.location.origin}/track/${selectedBatch}`} size={200} level="H" includeMargin />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Batch Identity</h3>
                        <p className="text-slate-500 text-sm mb-6">Scan this code to verify the origin and authenticity of this harvesting batch on the blockchain.</p>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center mb-6">
                            <code className="text-emerald-700 font-bold font-mono tracking-widest break-all">
                                {selectedBatch}
                            </code>
                        </div>

                        <button
                            className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
                            onClick={() => setShowQR(false)}
                        >
                            CLOSE PORTAL
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmerDashboard;
