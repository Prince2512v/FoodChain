import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import NexusEditUserModal from './NexusEditUserModal';
import api from '../../services/api';

const NexusUserManager = () => {
    const { token } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/Admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBlock = async (user) => {
        const action = user.status === 'Active' ? 'block' : 'unblock';
        if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) return;
        
        try {
            const res = await api.put(`/Admin/users/${user.id}/${action}`);
            if (res.status === 200) fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`PERMANENT DELETION: Are you sure you want to purge ${user.name} from the protocol? This cannot be undone.`)) return;
        
        try {
            const res = await api.delete(`/Admin/users/${user.id}`);
            if (res.status === 200) fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-panel">
            <div className="admin-panel-header">
                <div className="flex items-center gap-4">
                    <h3 className="admin-panel-title"><i className="bi bi-people"></i> Network Participants</h3>
                    <div className="nexus-input-wrapper w-64">
                        <i className="bi bi-search"></i>
                        <input 
                            type="text" 
                            className="nexus-input" 
                            placeholder="Filter nodes..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <button className="nexus-btn nexus-btn-primary" onClick={fetchUsers}>
                    <i className="bi bi-arrow-clockwise"></i> Refresh Sync
                </button>
            </div>
            
            <div className="admin-panel-body p-0">
                <div className="overflow-x-auto">
                    <table className="nexus-table">
                        <thead>
                            <tr>
                                <th>Participant</th>
                                <th>Protocol Role</th>
                                <th>Status</th>
                                <th>Auth Date</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-10">
                                        <div className="admin-spinner mx-auto scale-50"></div>
                                    </td>
                                </tr>
                            ) : filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{user.name}</div>
                                                <div className="text-[0.7rem] text-slate-400">{user.email}</div>
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
                                    <td>
                                        <div className="flex gap-3 justify-end items-center pr-2">
                                            <button 
                                                className="nexus-action-btn edit" 
                                                title="Edit Participant"
                                                onClick={() => { setEditingUser(user); setShowEditModal(true); }}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                            <button 
                                                className="nexus-action-btn warn" 
                                                title={user.status === 'Active' ? 'Restrict Access' : 'Restore Access'}
                                                onClick={() => handleToggleBlock(user)}
                                            >
                                                <i className={user.status === 'Active' ? "bi bi-shield-slash" : "bi bi-shield-check"}></i>
                                            </button>
                                            <button 
                                                className="nexus-action-btn delete" 
                                                title="Purge Identity"
                                                onClick={() => handleDelete(user)}
                                            >
                                                <i className="bi bi-trash3"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <NexusEditUserModal 
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                user={editingUser}
                token={token}
                onUpdate={fetchUsers}
            />
        </div>
    );
};

export default NexusUserManager;
