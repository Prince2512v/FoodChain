import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const NexusAuditLogs = () => {
    const { token } = useContext(AuthContext);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            // Using the admin-specific transactions endpoint for richer data
            const res = await api.get('/Admin/transactions');
            // Take top 10 for the overview
            setLogs(res.data.slice(0, 10));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000);
        return () => clearInterval(interval);
    }, [token]);

    return (
        <div className="admin-panel h-full">
            <div className="admin-panel-header">
                <h3 className="admin-panel-title"><i className="bi bi-clock-history"></i> Global Audit Trail</h3>
                <div className="flex gap-2">
                    <div className="nexus-badge nexus-badge-cyan animate-pulse">
                        <i className="bi bi-broadcast mr-1"></i> LIVE MONITORING
                    </div>
                </div>
            </div>
            
            <div className="admin-panel-body p-0">
                <div className="audit-row header">
                    <div>TIMESTAMP</div>
                    <div>NODE</div>
                    <div>EVENT ACTION</div>
                    <div>BLOCK IDENTITY</div>
                    <div>STATUS</div>
                </div>
                
                {loading ? (
                    <div className="text-center py-20">
                        <div className="admin-spinner mx-auto scale-75"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 text-sm">
                        No recent transactions recorded on this node.
                    </div>
                ) : (
                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                        {logs.map((log, idx) => (
                            <div key={idx} className="audit-row">
                                <div className="text-[0.7rem] text-slate-500">
                                    <div className="font-bold text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</div>
                                    <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                                </div>
                                <div>
                                    <span className={`role-badge scale-75 origin-left role-${log.role}`}>
                                        {log.role}
                                    </span>
                                </div>
                                <td>
                                    <div className="flex flex-col">
                                        <span className="text-slate-800 font-bold">{log.action}</span>
                                        <span className="text-[0.6rem] text-slate-400 uppercase tracking-tighter">Blockchain Verified</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="font-mono text-emerald-600 text-[0.65rem] bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 inline-block">
                                        {log.txHash?.slice(0, 12)}...
                                    </div>
                                </td>
                                <td>
                                    <div className="flex justify-end">
                                        <span className="nexus-badge nexus-badge-green scale-75 origin-right">
                                            VERIFIED
                                        </span>
                                    </div>
                                </td>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <p className="text-[0.65rem] text-slate-400 font-medium m-0">Showing last {logs.length} global protocol events</p>
                <button className="text-[0.65rem] font-bold text-emerald-600 hover:text-emerald-500 transition-colors uppercase tracking-widest">
                    View Full Ledger <i className="bi bi-chevron-right ml-1"></i>
                </button>
            </div>
        </div>
    );
};

export default NexusAuditLogs;
