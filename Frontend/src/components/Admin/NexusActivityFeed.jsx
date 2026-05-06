import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const NexusActivityFeed = () => {
    const { token } = useContext(AuthContext);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchActivities = async () => {
        try {
            const res = await fetch('http://localhost:5160/api/admin/transactions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            // Take top 8 for the feed
            setActivities(data.slice(0, 8));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
        const interval = setInterval(fetchActivities, 10000);
        return () => clearInterval(interval);
    }, [token]);

    return (
        <div className="admin-panel h-full">
            <div className="admin-panel-header">
                <h3 className="admin-panel-title">
                    <i className="bi bi-lightning-charge"></i> Real-time Feed
                </h3>
            </div>
            <div className="admin-panel-body custom-scrollbar overflow-y-auto max-h-[600px]">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="admin-spinner scale-50"></div>
                    </div>
                ) : activities.length === 0 ? (
                    <p className="text-center text-slate-500 py-10 text-xs">No activity detected on the chain.</p>
                ) : (
                    <div className="space-y-4">
                        {activities.map((act, i) => (
                            <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10 group">
                                <div className={`w-2 h-2 rounded-full mt-2 animate-pulse ${
                                    act.action.includes('Harvest') ? 'bg-emerald-400' : 
                                    act.action.includes('Process') ? 'bg-cyan-400' : 'bg-purple-400'
                                }`}></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-xs font-bold text-slate-200 m-0 truncate pr-2">
                                            {act.role.toUpperCase()} {act.action}
                                        </p>
                                        <span className="text-[0.6rem] text-slate-600 font-mono">
                                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-[0.65rem] text-slate-500 m-0 font-mono truncate">
                                        TX: {act.txHash?.slice(0, 12)}...
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NexusActivityFeed;
