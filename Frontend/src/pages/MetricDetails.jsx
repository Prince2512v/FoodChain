import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import HarvestList from '../components/Farmer/HarvestList';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

const MetricDetails = (props) => {
    const { type: paramType } = useParams();
    const type = props.type || paramType;
    const { token, user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQR, setShowQR] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const navigate = useNavigate();

    const getMetricConfig = () => {
        let config = {
            title: 'Metric Details',
            icon: 'activity',
            color: 'emerald',
            status: '',
            description: 'Details for the selected metric.'
        };

        switch (type) {
            case 'processing':
                config = {
                    title: user?.role === 'Distributor' ? 'Active Shipments' : 'In Processing',
                    icon: user?.role === 'Distributor' ? 'truck-front' : 'building-gear',
                    color: 'sky',
                    status: 'Processing',
                    description: user?.role === 'Distributor' 
                        ? 'Batches currently in transit to their destination.' 
                        : 'Harvest batches currently being processed at the facility.'
                };
                break;
            case 'packaged':
                config = {
                    title: 'Packaged Inventory',
                    icon: 'box-seam',
                    color: 'emerald',
                    status: 'Packaged',
                    description: 'Batches that have been processed, checked, and packaged for distribution.'
                };
                break;
            case 'delivered':
                config = {
                    title: user?.role === 'Retailer' ? 'Current Stock' : 'Delivered Yield',
                    icon: user?.role === 'Retailer' ? 'shop' : 'truck',
                    color: 'violet',
                    status: 'Completed',
                    description: 'Harvest batches that have successfully reached their destination.'
                };
                break;
            case 'alerts':
                config = {
                    title: 'Quality Alerts',
                    icon: 'exclamation-triangle-fill',
                    color: 'red',
                    status: 'Rejected',
                    description: 'Batches that failed quality inspection and require attention.'
                };
                break;
        }
        return config;
    };

    const config = getMetricConfig();

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            let endpoint = '/Farmer/products';
            if (user?.role === 'Processor') endpoint = '/Processor/products';
            else if (user?.role === 'Distributor') endpoint = '/Distributor/products';
            else if (user?.role === 'Retailer') endpoint = '/Retailer/products';
            
            const res = await api.get(endpoint);
            const allProducts = res.data || [];
            
            // Map statuses for stakeholders if needed
            let targetStatuses = [config.status];
            if (type === 'delivered' && user?.role !== 'Retailer') {
                targetStatuses = ['Completed', 'Delivered'];
            }
            if (user?.role === 'Distributor' && type === 'processing') targetStatuses = ['In Transit'];
            else if (user?.role === 'Retailer') {
                if (type === 'delivered') targetStatuses = ['Received'];
                else if (type === 'processing') targetStatuses = ['Delivered'];
            }

            // Case-insensitive filtering to ensure matching
            const filtered = allProducts.filter(p => {
                const pStatus = (p.status || p.Status || '').toLowerCase();
                
                // Special case for alerts to match backend logic
                if (type === 'alerts') {
                    return p.isRejected || p.IsRejected || pStatus === 'rejected';
                }
                
                return targetStatuses.some(ts => ts.toLowerCase() === pStatus);
            });
            setProducts(filtered);
        } catch (err) {
            console.error("Error fetching metric details:", err);
        } finally {
            setLoading(false);
        }
    }, [config.status, user?.role, type]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleBackNavigation = () => {
        if (user?.role === 'Farmer') navigate('/farmer-dashboard');
        else if (user?.role === 'Processor') navigate('/processor-dashboard');
        else if (user?.role === 'Distributor') navigate('/distributor-dashboard');
        else if (user?.role === 'Retailer') navigate('/retailer-dashboard');
        else navigate(-1);
    };

    const handleShowQR = (batchId) => {
        setSelectedBatch(batchId);
        setShowQR(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
                {/* ── Header Section ── */}
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 mb-8 border border-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <button 
                            onClick={handleBackNavigation}
                            className={`flex items-center gap-2 text-${config.color}-600 font-bold text-sm mb-4 hover:gap-3 transition-all`}
                        >
                            <i className="bi bi-arrow-left"></i> BACK TO DASHBOARD
                        </button>
                        <div className="flex items-center gap-2 mb-2">
                            <i className={`bi bi-${config.icon} text-${config.color}-500 text-xl`}></i>
                            <span className={`text-[0.7rem] font-bold text-${config.color}-600 tracking-[0.2em] uppercase`}>
                                {config.title} Node
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                            {config.title}
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">
                            {config.description}
                        </p>
                    </div>
                    <div className={`bg-${config.color}-50 px-6 py-4 rounded-2xl border border-${config.color}-100 text-center`}>
                        <p className={`text-[0.65rem] font-bold text-${config.color}-600 uppercase tracking-widest mb-1`}>Filtered Batches</p>
                        <p className={`text-3xl font-black text-${config.color}-700 m-0`}>{products.length}</p>
                    </div>
                </div>

                {/* ── Details Grid ── */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6 md:p-8">
                    <HarvestList 
                        products={products} 
                        loading={loading}
                        onShowQR={handleShowQR}
                        onNavigateDetails={(id) => {
                            const product = products.find(p => p.id === id);
                            if (product) navigate(`/track/${product.batchId}`);
                        }}
                        onInitialize={() => {
                            if (user?.role === 'Farmer') navigate('/add-product');
                            else navigate('/processor-dashboard');
                        }}
                    />
                </div>
            </main>

            {/* QR Modal Overlay */}
            {showQR && (
                <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowQR(false)}>
                    <div className="bg-white border border-slate-200 shadow-2xl p-8 rounded-3xl text-center relative max-w-sm w-full transform scale-100 transition-transform" onClick={e => e.stopPropagation()}>
                        <button className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors focus:outline-none" onClick={() => setShowQR(false)}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                        <div className={`bg-${config.color}-50 p-4 border border-${config.color}-100 rounded-2xl inline-block mb-6 shadow-sm`}>
                            <QRCodeSVG value={`${window.location.origin}/track/${selectedBatch}`} size={200} level="H" includeMargin />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Batch Identity</h3>
                        <p className="text-slate-500 text-sm mb-6">Scan this code to verify the origin and authenticity of this harvesting batch on the blockchain.</p>
                        
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center mb-6">
                            <code className={`text-${config.color}-700 font-bold font-mono tracking-widest break-all`}>
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

export default MetricDetails;
