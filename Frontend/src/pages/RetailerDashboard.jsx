import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import KPICard from '../components/Dashboard/KPICard';
import OverviewChart from '../components/Dashboard/OverviewChart';
import ActivityFeed from '../components/Dashboard/ActivityFeed';
import InventoryList from '../components/Retailer/InventoryList';
import PendingShipments from '../components/Retailer/PendingShipments';
import VerificationModal from '../components/Retailer/VerificationModal';
import ManualStockModal from '../components/Retailer/ManualStockModal';
import api from '../services/api';

const RetailerDashboard = () => {
    const { token, user } = useContext(AuthContext);
    const [summary, setSummary] = useState(null);
    const [performance, setPerformance] = useState([]);
    const [activities, setActivities] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('inventory');
    const [verifyingShipment, setVerifyingShipment] = useState(null);
    const [showManualModal, setShowManualModal] = useState(false);
    const navigate = useNavigate();

    const handleManualEntry = (newProduct) => {
        setInventory(prev => [newProduct, ...prev]);
        setShowManualModal(false);
    };

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const [summaryRes, perfRes, actRes, invRes, shipRes] = await Promise.all([
                api.get('/dashboard/summary').catch(() => ({data: {}})),
                api.get('/dashboard/performance').catch(() => ({data: []})),
                api.get('/dashboard/recent-activities').catch(() => ({data: []})),
                api.get('/retailer/inventory').catch(() => ({data: []})),
                api.get('/retailer/pending-shipments').catch(() => ({data: []}))
            ]);

            setSummary(summaryRes.data);
            setPerformance(perfRes.data);
            setActivities(actRes.data);
            setInventory(invRes.data || []);
            setShipments(shipRes.data || []);
        } catch (err) {
            console.error("Retailer Dashboard error:", err);
            setSummary({});
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleReceiveProduct = async (receiptData) => {
        try {
            await api.post('/retailer/receive', {
                productId: verifyingShipment.productId,
                conditionStatus: receiptData.condition,
                remarks: receiptData.remarks,
                blockchainTxHash: receiptData.blockchainTxHash || ''
            });

            setVerifyingShipment(null);
            await fetchDashboardData();
        } catch (err) {
            console.error("Reception failed:", err.response?.data || err.message);
        }
    };

    if (loading || !summary) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
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
                            <i className="bi bi-shop text-amber-500 text-xl"></i>
                            <span className="text-[0.7rem] font-bold text-amber-600 tracking-[0.2em] uppercase">
                                Commercial Distribution Node
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                            Retailer Hub
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 bg-amber-50 rounded-2xl p-3 pr-4 border border-amber-100 hidden md:flex">
                        <div className="h-12 w-12 bg-white text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-200">
                            <i className="bi bi-patch-check-fill text-xl"></i>
                        </div>
                        <div>
                            <div className="inline-block px-2 py-0.5 rounded text-[0.65rem] font-bold tracking-wider bg-amber-500 text-white shadow-sm shadow-amber-500/30 mb-1 uppercase">
                                Verified Vendor
                            </div>
                            <p className="text-xs font-semibold text-slate-500 m-0">
                                Identity: <span className="text-amber-700 font-bold">{user?.name}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Metrics Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <KPICard 
                        title="Current Stock" 
                        value={inventory.length || 0} 
                        icon="📦" 
                        color="#f59e0b" 
                        trend={+3} 
                        onClick={() => navigate('/ret-stock')}
                    />
                    <KPICard 
                        title="Pending Arrival" 
                        value={shipments.length || 0} 
                        icon="🚚" 
                        color="#3b82f6" 
                        trend={+2} 
                        onClick={() => navigate('/ret-pending')}
                    />
                    <KPICard title="Sold Items" value="1,240" icon="✅" color="#10b981" trend={+15} />
                    <KPICard 
                        title="Active Alerts" 
                        value={summary.rejected || 0} 
                        icon="⚠️" 
                        color="#ef4444" 
                        trend={0} 
                        onClick={() => navigate('/ret-alerts')}
                    />
                </div>

                {/* Charts & Activity Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 h-full">
                        <OverviewChart data={performance} title="Store Sales & Inventory Flow" />
                    </div>
                    <div className="lg:col-span-1 h-full">
                        <ActivityFeed activities={activities} />
                    </div>
                </div>

                {/* ── Inventory Tab Switcher ── */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-2 inline-flex gap-2 mb-6 shadow-sm">
                    <button 
                        className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                            activeTab === 'inventory' 
                            ? 'bg-amber-100 text-amber-800 shadow-sm border border-amber-200' 
                            : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                        }`} 
                        onClick={() => setActiveTab('inventory')}
                    >
                        <i className="bi bi-box-seam"></i> STOCKED INVENTORY
                    </button>
                    <button 
                        className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                            activeTab === 'shipments' 
                            ? 'bg-amber-100 text-amber-800 shadow-sm border border-amber-200' 
                            : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                        }`} 
                        onClick={() => setActiveTab('shipments')}
                    >
                        <i className="bi bi-truck"></i> PENDING SHIPMENTS
                        {shipments.length > 0 && (
                            <span className="ml-1 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[0.6rem] shadow-sm">
                                {shipments.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* ── Dashboard Content ── */}
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden min-h-[40vh] p-6">
                    {activeTab === 'inventory' ? (
                        <InventoryList 
                            inventory={inventory} 
                            onUpdate={() => {}} 
                            onNewEntry={() => setShowManualModal(true)}
                        />
                    ) : (
                        <PendingShipments shipments={shipments} onReceive={(s) => setVerifyingShipment(s)} />
                    )}
                </div>
            </main>

            {verifyingShipment && (
                <VerificationModal 
                    shipment={verifyingShipment} 
                    onClose={() => setVerifyingShipment(null)}
                    onConfirm={handleReceiveProduct} 
                />
            )}

            <ManualStockModal 
                show={showManualModal} 
                onHide={() => setShowManualModal(false)}
                onConfirm={handleManualEntry}
            />
        </div>
    );
};

export default RetailerDashboard;
