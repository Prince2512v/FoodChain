import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import HarvestList from '../components/Farmer/HarvestList';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

const YieldDetails = () => {
    const { token } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQR, setShowQR] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const navigate = useNavigate();

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/Farmer/products');
            setProducts(res.data || []);
        } catch (err) {
            console.error("Error fetching yield details:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

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
                            onClick={() => navigate('/farmer-dashboard')}
                            className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-4 hover:gap-3 transition-all"
                        >
                            <i className="bi bi-arrow-left"></i> BACK TO DASHBOARD
                        </button>
                        <div className="flex items-center gap-2 mb-2">
                            <i className="bi bi-flower1 text-emerald-500 text-xl"></i>
                            <span className="text-[0.7rem] font-bold text-emerald-600 tracking-[0.2em] uppercase">
                                Production Inventory
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                            Total Yield Details
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">
                            Comprehensive list of all harvest batches recorded on the blockchain.
                        </p>
                    </div>
                    <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 text-center">
                        <p className="text-[0.65rem] font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Batches</p>
                        <p className="text-3xl font-black text-emerald-700 m-0">{products.length}</p>
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
                        onInitialize={() => navigate('/add-product')}
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

export default YieldDetails;
