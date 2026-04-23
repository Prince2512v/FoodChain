import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Badge } from 'react-bootstrap';

const AuditLogs = () => {
    const { token } = useContext(AuthContext);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/dashboard/recent-activities?limit=0');
            console.log("Audit Logs Response:", res.data);
            setActivities(res.data || []);
        } catch (err) {
            console.error("Error fetching audit logs:", err);
            setError(err.response?.data?.message || err.message || "Failed to fetch logs");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const getRoleColor = (role) => {
        switch (role) {
            case 'Farmer': return '#10b981';
            case 'Processor': return '#6366f1';
            case 'Distributor': return '#0ea5e9';
            case 'Retailer': return '#f59e0b';
            default: return '#64748b';
        }
    }

    const getBadgeVariant = (role) => {
        switch (role) {
            case 'Farmer': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Processor': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'Distributor': return 'bg-sky-100 text-sky-700 border-sky-200';
            case 'Retailer': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
                {/* ── Header Section ── */}
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 mb-8 border border-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-4 hover:gap-3 transition-all"
                        >
                            <i className="bi bi-arrow-left"></i> BACK TO DASHBOARD
                        </button>
                        <div className="flex items-center gap-2 mb-2">
                            <i className="bi bi-clock-history text-indigo-500 text-xl"></i>
                            <span className="text-[0.7rem] font-bold text-indigo-600 tracking-[0.2em] uppercase">
                                Immutable Ledger
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                            Blockchain Audit Logs
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">
                            Full historical record of all transactions and state changes verified on the blockchain.
                        </p>
                    </div>
                    <div className="bg-indigo-50 px-6 py-4 rounded-2xl border border-indigo-100 text-center">
                        <p className="text-[0.65rem] font-bold text-indigo-600 uppercase tracking-widest mb-1">Total Logs</p>
                        <p className="text-3xl font-black text-indigo-700 m-0">{activities.length}</p>
                    </div>
                </div>

                {/* ── Logs List ── */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
                            <p className="font-bold text-slate-500">Retrieving Blockchain Data...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-500">
                            <i className="bi bi-exclamation-octagon fs-1 d-block mb-3 opacity-50"></i>
                            <p className="font-bold">{error}</p>
                            <button 
                                onClick={fetchLogs}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200"
                            >
                                Retry Sync
                            </button>
                        </div>
                    ) : activities.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                                        <th className="px-6 py-4 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Stakeholder</th>
                                        <th className="px-6 py-4 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                                        <th className="px-6 py-4 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Batch Identity</th>
                                        <th className="px-6 py-4 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest text-right">Verification</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activities.map((act, idx) => (
                                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-slate-700">
                                                    {new Date(act.timestamp).toLocaleDateString()}
                                                </div>
                                                <div className="text-[0.7rem] text-slate-400 font-medium">
                                                    {new Date(act.timestamp).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider border ${getBadgeVariant(act.role)}`}>
                                                    {act.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-slate-800">{act.action}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 font-mono text-[0.75rem] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 w-fit">
                                                    <i className="bi bi-hash text-slate-300"></i>
                                                    {act.batchId}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <a 
                                                    href={`https://sepolia.etherscan.io/tx/${act.txHash}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-100"
                                                >
                                                    <i className="bi bi-shield-check"></i> TXID
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-muted">
                            <i className="bi bi-inbox fs-1 d-block mb-3 opacity-20"></i>
                            <p className="font-bold">No activity logs found in the ledger.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AuditLogs;
