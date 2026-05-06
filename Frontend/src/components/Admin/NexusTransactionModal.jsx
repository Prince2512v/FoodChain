import React, { useState, useEffect } from 'react';

const NexusTransactionModal = ({ isOpen, onClose, token }) => {
    const [txs, setTxs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchTxs();
        }
    }, [isOpen]);

    const fetchTxs = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5160/api/admin/transactions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setTxs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="nexus-modal-overlay" onClick={onClose}>
            <div className="nexus-modal max-w-5xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="nexus-modal-title m-0">
                        <i className="bi bi-activity text-emerald-400 mr-2"></i>
                        Full Network Transaction Volume
                    </h2>
                    <button className="nexus-btn nexus-btn-ghost p-1" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="admin-panel-body p-0 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="audit-row header">
                        <div>TIMESTAMP</div>
                        <div>NODE</div>
                        <div>ACTION</div>
                        <div>TX HASH</div>
                        <div>STATUS</div>
                    </div>
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="admin-spinner mx-auto scale-75"></div>
                        </div>
                    ) : txs.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            No blockchain transactions recorded.
                        </div>
                    ) : (
                        txs.map((tx, idx) => (
                            <div key={idx} className="audit-row">
                                <div className="text-[0.7rem] text-slate-500">
                                    <div className="font-bold text-slate-400">{new Date(tx.timestamp).toLocaleDateString()}</div>
                                    <div>{new Date(tx.timestamp).toLocaleTimeString()}</div>
                                </div>
                                <div>
                                    <span className={`role-badge scale-75 origin-left role-${tx.role}`}>
                                        {tx.role}
                                    </span>
                                </div>
                                <div className="text-xs font-bold text-slate-300">
                                    {tx.action}
                                </div>
                                <div>
                                    <a 
                                        href={`https://etherscan.io/tx/${tx.txHash}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="tx-hash"
                                    >
                                        {tx.txHash?.slice(0, 14)}...
                                    </a>
                                </div>
                                <div>
                                    <div className="nexus-badge nexus-badge-green scale-75 origin-right">
                                        {tx.status?.toUpperCase() || 'SUCCESS'}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-8 flex justify-end">
                    <button className="nexus-btn nexus-btn-primary px-6" onClick={onClose}>
                        DISMISS TERMINAL
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NexusTransactionModal;
