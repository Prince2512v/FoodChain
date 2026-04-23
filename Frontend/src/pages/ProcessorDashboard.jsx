import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import KPICard from '../components/Dashboard/KPICard';
import OverviewChart from '../components/Dashboard/OverviewChart';
import ActivityFeed from '../components/Dashboard/ActivityFeed';
import IncomingProducts from '../components/Processor/IncomingProducts';
import ProcessingForm from '../components/Processor/ProcessingForm';
import QualityCheckForm from '../components/Processor/QualityCheckForm';
import PackagingForm from '../components/Processor/PackagingForm';
import api from '../services/api';

const ProcessorDashboard = () => {
    const { token, user } = useContext(AuthContext);
    const [summary, setSummary] = useState(null);
    const [performance, setPerformance] = useState([]);
    const [activities, setActivities] = useState([]);
    const [incomingProducts, setIncomingProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'process', 'quality', 'package'
    const navigate = useNavigate();

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const [summaryRes, perfRes, actRes, incomingRes] = await Promise.all([
                api.get('/dashboard/summary').catch(() => ({data: {}})),
                api.get('/dashboard/performance').catch(() => ({data: []})),
                api.get('/dashboard/recent-activities').catch(() => ({data: []})),
                api.get('/processor/incoming-products').catch(() => ({data: []}))
            ]);

            setSummary(summaryRes.data);
            setPerformance(perfRes.data);
            setActivities(actRes.data);
            setIncomingProducts(incomingRes.data || []);
        } catch (err) {
            console.error("Processor Dashboard error:", err);
            setSummary({});
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleSelectProduct = (product, selectedMode = 'process') => {
        setSelectedProduct(product);
        setViewMode(selectedMode);
    };

    const handleActionComplete = useCallback(async () => {
        setViewMode('list');
        setSelectedProduct(null);
        await fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading || !summary) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
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
                            <i className="bi bi-gear-wide-connected text-orange-500 text-xl"></i>
                            <span className="text-[0.7rem] font-bold text-orange-600 tracking-[0.2em] uppercase">
                                Manufacturing Node
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                            Processor Intel
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-3 pr-4 border border-slate-100 hidden md:flex">
                        <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-orange-200">
                            <i className="bi bi-cpu-fill text-xl"></i>
                        </div>
                        <div>
                            <div className="inline-block px-2 py-0.5 rounded text-[0.65rem] font-bold tracking-wider bg-orange-500 text-white shadow-sm shadow-orange-500/30 mb-1">
                                CORE ACTIVE
                            </div>
                            <p className="text-xs font-semibold text-slate-500 m-0">
                                Identity: <span className="text-orange-700 font-bold">{user?.name}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Metrics Grid (Tailwind) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <KPICard 
                        title="Queue Size" 
                        value={incomingProducts.length} 
                        icon="📥" 
                        color="#f97316" 
                        trend={+2} 
                        onClick={() => navigate('/queue-details')}
                    />
                    <KPICard 
                        title="In Process" 
                        value={summary.processing || 0} 
                        icon="⚙️" 
                        color="#3b82f6" 
                        trend={+5} 
                        onClick={() => navigate('/proc-processing-details')}
                    />
                    <KPICard 
                        title="Packaged" 
                        value={summary.packaged || 0} 
                        icon="📦" 
                        color="#10b981" 
                        trend={+9} 
                        onClick={() => navigate('/packaged-details')}
                    />
                    <KPICard 
                        title="Quality Alerts" 
                        value={summary.rejected || 0} 
                        icon="⚠️" 
                        color="#ef4444" 
                        trend={-1} 
                        onClick={() => navigate('/proc-quality-alerts')}
                    />
                </div>

                {/* Charts & Activity Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 h-full">
                        <OverviewChart data={performance} title="Operational Pipeline Throughput" />
                    </div>
                    <div className="lg:col-span-1 h-full">
                        <ActivityFeed activities={activities} />
                    </div>
                </div>

                {/* ── Dashboard Content ── */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl shadow-sm overflow-hidden min-h-[50vh]">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h4 className="text-xl font-extrabold text-slate-800 m-0 flex items-center gap-2">
                             <i className="bi bi-diagram-3-fill text-slate-400"></i> Production Line
                        </h4>
                        <div className="flex items-center gap-2">
                            <button 
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                    viewMode === 'list' 
                                    ? 'bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-500/30' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`} 
                                onClick={() => setViewMode('list')}
                            >
                                <i className="bi bi-list-ul mr-1"></i> QUEUE
                            </button>
                            {selectedProduct && selectedProduct.id && (
                                <button 
                                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold border border-slate-900 shadow-sm animate-fade-in flex items-center gap-2"
                                    onClick={() => setViewMode('process')}
                                >
                                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                    BATCH: #{String(selectedProduct.batchId || selectedProduct.id).substring(0, 8).toUpperCase()}
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="p-6">
                        {viewMode === 'list' && (
                            <IncomingProducts 
                                products={incomingProducts} 
                                onSelect={handleSelectProduct} 
                            />
                        )}

                        {viewMode === 'process' && selectedProduct && (
                            <ProcessingForm 
                                product={selectedProduct} 
                                onComplete={handleActionComplete}
                                onCancel={() => setViewMode('list')}
                            />
                        )}

                        {viewMode === 'quality' && selectedProduct && (
                            <QualityCheckForm 
                                product={selectedProduct} 
                                onComplete={handleActionComplete}
                                onCancel={() => setViewMode('list')}
                            />
                        )}

                        {viewMode === 'package' && selectedProduct && (
                            <PackagingForm 
                                product={selectedProduct} 
                                onComplete={handleActionComplete}
                                onCancel={() => setViewMode('list')}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProcessorDashboard;
