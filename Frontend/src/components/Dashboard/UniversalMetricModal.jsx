import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const UniversalMetricModal = ({ isOpen, onClose, type, role }) => {
    const { token } = useContext(AuthContext);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && type) {
            fetchData();
        }
    }, [isOpen, type, role]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            // Determine endpoint based on role and type
            if (role === 'Admin') {
                switch (type.toLowerCase()) {
                    case 'nodes': endpoint = '/Admin/users'; break;
                    case 'volume': endpoint = '/Admin/transactions'; break;
                    case 'alerts': endpoint = '/Admin/fraud-alerts'; break;
                    default: endpoint = '/Product';
                }
            } else {
                switch (role) {
                    case 'Farmer': endpoint = '/Farmer/products'; break;
                    case 'Processor': endpoint = '/Processor/products'; break;
                    case 'Distributor': endpoint = '/Distributor/products'; break;
                    case 'Retailer': endpoint = '/Retailer/products'; break;
                    default: endpoint = '/Product';
                }
            }

            const res = await api.get(endpoint);
            const rawData = res.data || [];
            
            // Filtering logic
            let filtered = [];
            const targetType = type.toLowerCase();

            if (role === 'Admin' && (targetType === 'nodes' || targetType === 'volume' || targetType === 'alerts')) {
                // For these types, the endpoint already returns the specific data we need
                filtered = rawData;
            } else {
                filtered = rawData.filter(p => {
                    const status = (p.status || p.Status || '').toLowerCase();
                    
                    if (targetType === 'alerts' || targetType === 'rejected') {
                        return p.isRejected || status === 'rejected' || status === 'issue reported' || status === 'delayed';
                    }
                    
                    if (role === 'Farmer') {
                        if (targetType === 'yield' || targetType === 'total') return true;
                        if (targetType === 'processing') return status === 'processing' || status === 'packaged';
                        if (targetType === 'delivered') return status === 'delivered' || status === 'received' || status === 'completed';
                    }
                    
                    if (role === 'Processor') {
                        if (targetType === 'queue') return status === 'created' || status === 'processing';
                        if (targetType === 'processing') return status === 'processing';
                        if (targetType === 'packaged') return status === 'packaged';
                    }
                    
                    if (role === 'Distributor') {
                        if (targetType === 'active') return status === 'in transit' || status === 'out for delivery';
                        if (targetType === 'queue') return status === 'packaged';
                        if (targetType === 'delivered') return status === 'delivered' || status === 'received' || status === 'completed';
                    }
                    
                    if (role === 'Retailer') {
                        if (targetType === 'stock' || targetType === 'delivered') return status === 'received';
                        if (targetType === 'pending') return status === 'delivered' || status === 'in transit';
                    }

                    if (role === 'Admin') {
                        if (targetType === 'products' || targetType === 'flow') return true;
                    }

                    return status.includes(targetType);
                });
            }
            
            setData(filtered);
        } catch (err) {
            console.error("Error fetching metric details:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getTitle = () => {
        const t = type.toLowerCase();
        if (t === 'alerts' || t === 'rejected') return 'Network Alerts & Issues';
        if (t === 'processing') return 'Active Production Line';
        if (t === 'delivered' || t === 'stock') return 'Successful Deliveries';
        if (t === 'queue') return 'Cargo Queue Ledger';
        if (t === 'yield' || t === 'total') return 'Total Production Yield';
        if (t === 'nodes') return 'Authorized Network Nodes';
        if (t === 'volume') return 'Blockchain Transaction Ledger';
        return `${type.charAt(0).toUpperCase() + type.slice(1)} Details`;
    };

    const getIcon = () => {
        const t = type.toLowerCase();
        if (t === 'alerts' || t === 'rejected') return 'exclamation-triangle-fill';
        if (t === 'processing') return 'gear-wide-connected';
        if (t === 'delivered' || t === 'stock') return 'check-circle-fill';
        if (t === 'queue') return 'box-seam';
        return 'activity';
    };

    const getColorClass = () => {
        const t = type.toLowerCase();
        if (t === 'alerts' || t === 'rejected') return 'text-red-500';
        if (t === 'processing') return 'text-amber-500';
        if (t === 'delivered' || t === 'stock') return 'text-emerald-500';
        if (t === 'queue') return 'text-sky-500';
        return 'text-slate-500';
    };

    return (
        <div className="universal-modal-overlay" onClick={onClose}>
            <div className="universal-modal max-w-4xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <i className={`bi bi-${getIcon()} ${getColorClass()} text-xl`}></i>
                            <span className={`text-[0.65rem] font-bold ${getColorClass()} tracking-[0.2em] uppercase`}>
                                Intelligence Node Feed
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
                                    {type.toLowerCase() === 'nodes' ? (
                                        <>
                                            <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">User ID</th>
                                            <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Full Name</th>
                                            <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Email Address</th>
                                            <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Network Role</th>
                                            <th className="px-6 py-4 text-right text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Access Status</th>
                                        </>
                                    ) : type.toLowerCase() === 'volume' ? (
                                        <>
                                            <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">TX Hash</th>
                                            <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Batch ID</th>
                                            <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Origin Role</th>
                                            <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Blockchain Action</th>
                                            <th className="px-6 py-4 text-right text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Timestamp</th>
                                        </>
                                    ) : type.toLowerCase() === 'alerts' && role === 'Admin' ? (
                                        <>
                                            <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Batch ID</th>
                                            <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Severity</th>
                                            <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Issue Type</th>
                                            <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Description</th>
                                            <th className="px-6 py-4 text-right text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Batch ID</th>
                                            <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Product Name</th>
                                            <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Category</th>
                                            <th className="px-6 py-4 text-left text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Quantity</th>
                                            <th className="px-6 py-4 text-right text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={type.toLowerCase() === 'nodes' || type.toLowerCase() === 'volume' ? "5" : "5"} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent"></div>
                                                <p className="text-xs font-bold text-emerald-600 tracking-widest animate-pulse">SYNCHRONIZING...</p>
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
                                ) : type.toLowerCase() === 'nodes' ? (
                                    data.map((u) => (
                                        <tr key={u.id} className="group hover:bg-white transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold font-mono text-slate-500">#{u.id}</td>
                                            <td className="px-6 py-4 font-bold text-slate-900 text-sm">{u.name}</td>
                                            <td className="px-6 py-4 text-xs font-semibold text-slate-500">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-sky-50 text-sky-700 rounded-lg text-[0.65rem] font-bold uppercase border border-sky-100">
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-3 py-1 rounded-full text-[0.6rem] font-black tracking-wider uppercase border ${
                                                    u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                    {u.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : type.toLowerCase() === 'volume' ? (
                                    data.map((tx) => (
                                        <tr key={tx.id} className="group hover:bg-white transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="px-2 py-1 bg-slate-100 rounded-lg text-[0.65rem] font-bold font-mono text-slate-500 inline-block border border-slate-200 truncate max-w-[120px]" title={tx.txHash}>
                                                    {tx.txHash ? `${tx.txHash.substring(0, 10)}...` : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900 text-sm">{tx.batchId}</td>
                                            <td className="px-6 py-4 text-xs font-semibold text-slate-500">{tx.role}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-slate-700">{tx.action}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-[0.65rem] font-bold text-slate-400">
                                                {new Date(tx.timestamp).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : type.toLowerCase() === 'alerts' && role === 'Admin' ? (
                                    data.map((f) => (
                                        <tr key={f.id} className="group hover:bg-white transition-colors">
                                            <td className="px-6 py-4 font-mono text-[0.65rem] font-bold text-slate-500">{f.batchId}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[0.6rem] font-black uppercase ${
                                                    f.severity === 'Critical' ? 'bg-red-500 text-white' : (f.severity === 'High' ? 'bg-orange-500 text-white' : 'bg-yellow-400 text-black')
                                                }`}>
                                                    {f.severity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-900">{f.issueType}</td>
                                            <td className="px-6 py-4 text-[0.65rem] text-slate-500 max-w-[200px] truncate" title={f.description}>{f.description}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-2 py-1 rounded-full text-[0.6rem] font-black uppercase border ${
                                                    f.isResolved ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                                }`}>
                                                    {f.isResolved ? 'RESOLVED' : 'UNRESOLVED'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    data.map((p) => (
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
                                                    (p.status || '').toLowerCase() === 'delivered' || (p.status || '').toLowerCase() === 'completed' || (p.status || '').toLowerCase() === 'received' 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                                    (p.isRejected || (p.status || '').toLowerCase() === 'rejected' || (p.status || '').toLowerCase() === 'issue reported' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100')
                                                }`}>
                                                    {(p.status || 'Active').toUpperCase()}
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
                .universal-modal-overlay {
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
                .universal-modal {
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

export default UniversalMetricModal;
