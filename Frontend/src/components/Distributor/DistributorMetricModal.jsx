import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DistributorMetricModal = ({ isOpen, onClose, type, token }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && type) {
            fetchData();
        }
    }, [isOpen, type]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/Distributor/products');
            const allProducts = res.data || [];
            
            let filtered = [];
            if (type === 'active') {
                filtered = allProducts.filter(p => p.status === 'In Transit' || p.status === 'Out for Delivery');
            } else if (type === 'queue') {
                filtered = allProducts.filter(p => p.status === 'Packaged');
            } else if (type === 'delivered') {
                filtered = allProducts.filter(p => p.status === 'Delivered' || p.status === 'Received' || p.status === 'Completed');
            } else if (type === 'alerts') {
                filtered = allProducts.filter(p => p.isRejected || p.status === 'Rejected' || p.status === 'Delayed' || p.status === 'Issue Reported');
            }
            
            setData(filtered);
        } catch (err) {
            console.error("Error fetching distributor metric details:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getTitle = () => {
        switch (type) {
            case 'active': return 'Active Logistics Feed';
            case 'queue': return 'Cargo Queue Ledger';
            case 'delivered': return 'Successful Deliveries';
            case 'alerts': return 'Network Alerts & Issues';
            default: return 'Metric Details';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'active': return 'truck-front';
            case 'queue': return 'box-seam';
            case 'delivered': return 'check-circle-fill';
            case 'alerts': return 'exclamation-triangle-fill';
            default: return 'activity';
        }
    };

    const getColorClass = () => {
        switch (type) {
            case 'active': return 'text-sky-400';
            case 'queue': return 'text-emerald-400';
            case 'delivered': return 'text-amber-400';
            case 'alerts': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="dist-modal-overlay" onClick={onClose}>
            <div className="dist-modal max-w-4xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className={`flex items-center gap-2 mb-1`}>
                            <i className={`bi bi-${getIcon()} ${getColorClass()} text-xl`}></i>
                            <span className={`text-[0.65rem] font-bold ${getColorClass()} tracking-[0.2em] uppercase`}>
                                Data Intelligence Feed
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 m-0 tracking-tight">
                            {getTitle()}
                        </h2>
                    </div>
                    <button className="h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shadow-sm border border-slate-200" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden shadow-inner">
                    <div className="max-h-[55vh] overflow-y-auto custom-scrollbar p-1">
                        <table className="w-full border-separate border-spacing-0">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Batch ID</th>
                                    <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Product Name</th>
                                    <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Category</th>
                                    <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Quantity</th>
                                    <th className="px-6 py-4 text-right text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-20">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent"></div>
                                                <p className="text-xs font-bold text-sky-600 tracking-widest animate-pulse">SYNCHRONIZING...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-20">
                                            <div className="flex flex-col items-center gap-3">
                                                <i className="bi bi-inbox text-4xl text-slate-200"></i>
                                                <p className="text-sm font-bold text-slate-400">No active records found in this sector.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((p, idx) => (
                                        <tr key={p.id} className="group hover:bg-white transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="px-2 py-1 bg-slate-100 rounded-lg text-[0.65rem] font-bold font-mono text-slate-500 inline-block border border-slate-200">
                                                    {p.batchId}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900 text-sm">{p.productName}</td>
                                            <td className="px-6 py-4 text-xs font-semibold text-slate-500">{p.cropType}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-slate-700">{p.quantity}</span>
                                                <span className="ml-1 text-[0.6rem] font-bold text-slate-400 uppercase">{p.unit}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-3 py-1 rounded-full text-[0.6rem] font-black tracking-wider uppercase border ${
                                                    p.status === 'Delivered' || p.status === 'Completed' || p.status === 'Received' 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                                    (p.status === 'Rejected' || p.status === 'Issue Reported' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-sky-50 text-sky-700 border-sky-100')
                                                }`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button 
                        className="px-8 py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0" 
                        onClick={onClose}
                    >
                        CLOSE TERMINAL
                    </button>
                </div>
            </div>
            
            <style jsx>{`
                .dist-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(12px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .dist-modal {
                    background: rgba(255, 255, 255, 0.95);
                    border: 1px solid rgba(255, 255, 255, 1);
                    border-radius: 3rem;
                    width: 90%;
                    padding: 2.5rem;
                    box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.02);
                    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(40px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default DistributorMetricModal;
