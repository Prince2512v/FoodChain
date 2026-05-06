import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import KPICard from '../components/Dashboard/KPICard';
import OverviewChart from '../components/Dashboard/OverviewChart';
import ActivityFeed from '../components/Dashboard/ActivityFeed';
import AvailableShipments from '../components/Distributor/AvailableShipments';
import ShipmentDetailsForm from '../components/Distributor/ShipmentDetailsForm';
import LocationUpdateForm from '../components/Distributor/LocationUpdateForm';
import StorageConditionForm from '../components/Distributor/StorageConditionForm';
import DeliveryStatusTracker from '../components/Distributor/DeliveryStatusTracker';
import IssueReportForm from '../components/Distributor/IssueReportForm';
import LogisticsMap from '../components/Distributor/LogisticsMap';
import api from '../services/api';

const DistributorDashboard = () => {
    const { token, user } = useContext(AuthContext);
    const [summary, setSummary] = useState(null);
    const [performance, setPerformance] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('available');
    const [selectedShipment, setSelectedShipment] = useState(null);
    const [shipmentLogs, setShipmentLogs] = useState([]);
    const [showMetricModal, setShowMetricModal] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchShipmentLogs = async () => {
            if (!selectedShipment) return;
            try {
                const response = await api.get(`/distributor/logs/${selectedShipment.productId}`);
                setShipmentLogs(response.data);
            } catch (err) {
                console.error("Failed to fetch shipment logs:", err);
            }
        };
        fetchShipmentLogs();
    }, [selectedShipment, token]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [summaryRes, perfRes, actRes] = await Promise.all([
                    api.get('/dashboard/summary').catch(() => ({data: {}})),
                    api.get('/dashboard/performance').catch(() => ({data: []})),
                    api.get('/dashboard/recent-activities').catch(() => ({data: []}))
                ]);

                setSummary(summaryRes.data);
                setPerformance(perfRes.data);
                setActivities(actRes.data);
            } catch (err) {
                console.error("Distributor Dashboard error:", err);
                setSummary({});
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [token]);

    const handleShipmentAccepted = (shipment) => {
        setSelectedShipment(shipment);
        setActiveTab('track');
    };

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
                            <i className="bi bi-truck text-sky-500 text-xl"></i>
                            <span className="text-[0.7rem] font-bold text-sky-600 tracking-[0.2em] uppercase">
                                Logistics Intelligence Node
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                            Distributor Terminal
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-3 pr-4 border border-slate-100 hidden md:flex">
                        <div className="h-12 w-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-sky-200">
                            <i className="bi bi-geo-fill text-xl"></i>
                        </div>
                        <div>
                            <div className="inline-block px-2 py-0.5 rounded text-[0.65rem] font-bold tracking-wider bg-sky-500 text-white shadow-sm shadow-sky-500/30 mb-1">
                                NETWORK ACTIVE
                            </div>
                            <p className="text-xs font-semibold text-slate-500 m-0">
                                Identity: <span className="text-sky-700 font-bold">{user?.name}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Metrics Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <KPICard 
                        title="Active Shipments" 
                        value={summary.inTransit || 0} 
                        icon="🚛" 
                        color="#0ea5e9" 
                        trend={0} 
                        onClick={() => { setSelectedMetric('active'); setShowMetricModal(true); }}
                    />
                    <KPICard 
                        title="Queue" 
                        value={summary.packaged || 0} 
                        icon="📦" 
                        color="#10b981" 
                        trend={0} 
                        onClick={() => { setSelectedMetric('queue'); setShowMetricModal(true); }}
                    />
                    <KPICard 
                        title="Delivery Rate" 
                        value={summary.delivered ? `${Math.round((summary.delivered / (summary.total || 1)) * 100)}%` : '0%'} 
                        icon="✅" 
                        color="#f59e0b" 
                        trend={0} 
                        onClick={() => { setSelectedMetric('delivered'); setShowMetricModal(true); }}
                    />
                    <KPICard 
                        title="Active Alerts" 
                        value={summary.rejected || 0} 
                        icon="⚠️" 
                        color="#ef4444" 
                        trend={0} 
                        onClick={() => { setSelectedMetric('alerts'); setShowMetricModal(true); }}
                    />
                </div>

                {/* ── Tabs Navigation ── */}
                <div className="flex flex-wrap gap-2 mb-6 p-1.5 bg-white backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 inline-flex">
                    <button 
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'available' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-sky-600'
                        }`}
                        onClick={() => setActiveTab('available')}
                    >
                        <i className="bi bi-box-arrow-in-right"></i> AVAILABLE
                    </button>
                    <button 
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'track' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-sky-600'
                        }`}
                        onClick={() => setActiveTab('track')}
                    >
                        <i className="bi bi-map"></i> LIVE TRACKING
                    </button>
                    <button 
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'issues' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-sky-600'
                        }`}
                        onClick={() => setActiveTab('issues')}
                    >
                        <i className="bi bi-exclamation-octagon"></i> ALERTS
                    </button>
                </div>

                {/* ── Main Content Area ── */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-6 rounded-3xl shadow-sm min-h-[50vh]">
                    
                    {/* AVAIABLE TAB */}
                    {activeTab === 'available' && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-xl font-extrabold text-slate-800">Open Cargo Assignments</h4>
                                <span className="px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold tracking-widest shadow-sm">
                                    SCANNING NETWORKS
                                </span>
                            </div>
                            <AvailableShipments onAccepted={handleShipmentAccepted} />
                        </div>
                    )}

                    {/* TRACK TAB */}
                    {activeTab === 'track' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                            <div className="lg:col-span-2 space-y-6">
                                <LocationUpdateForm shipment={selectedShipment} />
                                <StorageConditionForm shipment={selectedShipment} />
                                <ShipmentDetailsForm shipment={selectedShipment} />
                            </div>
                            <div className="lg:col-span-1 border-l border-slate-100 pl-4 lg:pl-8">
                                <div className="sticky top-[100px]">
                                    <h5 className="font-bold text-lg text-sky-700 mb-4 flex items-center gap-2">
                                        <i className="bi bi-geo-alt-fill text-sky-500"></i> Live Route Tracking
                                    </h5>
                                    <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 mb-6 bg-slate-100 h-[300px]">
                                        <LogisticsMap logs={shipmentLogs} />
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm">
                                        <DeliveryStatusTracker shipment={selectedShipment} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ISSUES TAB */}
                    {activeTab === 'issues' && (
                        <div className="animate-fade-in w-full">
                            <IssueReportForm shipment={selectedShipment} />
                        </div>
                    )}
                </div>
                
                <UniversalMetricModal 
                    isOpen={showMetricModal} 
                    onClose={() => setShowMetricModal(false)} 
                    type={selectedMetric}
                    role="Distributor"
                />
            </main>
        </div>
    );
};

export default DistributorDashboard;
