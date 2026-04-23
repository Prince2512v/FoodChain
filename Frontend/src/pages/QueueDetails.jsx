import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import IncomingProducts from '../components/Processor/IncomingProducts';
import api from '../services/api';

const QueueDetails = () => {
    const { token } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchQueue = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/processor/incoming-products');
            setProducts(res.data || []);
        } catch (err) {
            console.error("Error fetching queue details:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
                {/* ── Header Section ── */}
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 mb-8 border border-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <button 
                            onClick={() => navigate('/processor-dashboard')}
                            className="flex items-center gap-2 text-orange-600 font-bold text-sm mb-4 hover:gap-3 transition-all"
                        >
                            <i className="bi bi-arrow-left"></i> BACK TO DASHBOARD
                        </button>
                        <div className="flex items-center gap-2 mb-2">
                            <i className="bi bi-inbox-fill text-orange-500 text-xl"></i>
                            <span className="text-[0.7rem] font-bold text-orange-600 tracking-[0.2em] uppercase">
                                Production Pipeline
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                            Queue Details
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">
                            Comprehensive view of all active batches in the manufacturing queue.
                        </p>
                    </div>
                    <div className="bg-orange-50 px-6 py-4 rounded-2xl border border-orange-100 text-center">
                        <p className="text-[0.65rem] font-bold text-orange-600 uppercase tracking-widest mb-1">Queue Size</p>
                        <p className="text-3xl font-black text-orange-700 m-0">{products.length}</p>
                    </div>
                </div>

                {/* ── Details Grid ── */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6 md:p-8">
                    {loading ? (
                         <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
                            <p className="font-bold text-slate-500">Syncing Production Queue...</p>
                        </div>
                    ) : (
                        <IncomingProducts 
                            products={products} 
                            onSelect={(product) => {
                                // For now, we just navigate back to dashboard to process, 
                                // or we could handle it here. The requirement was just redirection.
                                navigate('/processor-dashboard');
                            }} 
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default QueueDetails;
