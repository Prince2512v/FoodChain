import React, { useState, useEffect } from 'react';

const NexusUserModal = ({ isOpen, onClose, token }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5160/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="nexus-modal-overlay" onClick={onClose}>
            <div className="nexus-modal max-w-4xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="nexus-modal-title m-0">
                        <i className="bi bi-diagram-3 text-cyan-400 mr-2"></i>
                        Authorized Supply Chain Nodes
                    </h2>
                    <button className="nexus-btn nexus-btn-ghost p-1" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="admin-panel-body p-0 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <table className="nexus-table">
                        <thead>
                            <tr>
                                <th>Participant</th>
                                <th>Protocol Role</th>
                                <th>Status</th>
                                <th>Auth Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-20">
                                        <div className="admin-spinner mx-auto scale-75"></div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-20 text-slate-500">
                                        No authorized nodes found.
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/20">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-200">{user.name}</div>
                                                    <div className="text-[0.7rem] text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`role-badge role-${user.role}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${user.status}`}>
                                                {user.status === 'Active' ? 'OPERATIONAL' : 'SUSPENDED'}
                                            </span>
                                        </td>
                                        <td className="text-slate-500 text-xs">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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

export default NexusUserModal;
