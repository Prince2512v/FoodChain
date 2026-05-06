import React, { useState, useEffect } from 'react';

const NexusEditUserModal = ({ isOpen, onClose, user, token, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        status: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                role: user.role,
                status: user.status
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5160/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                onUpdate();
                onClose();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="nexus-modal-overlay" onClick={onClose}>
            <div className="nexus-modal" onClick={e => e.stopPropagation()}>
                <h2 className="nexus-modal-title">
                    <i className="bi bi-pencil-square mr-2 text-purple-400"></i>
                    Update Node Credentials
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="nexus-form-group">
                        <label className="nexus-label">Participant Name</label>
                        <input 
                            type="text" 
                            className="nexus-text-input" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>

                    <div className="nexus-form-group">
                        <label className="nexus-label">Protocol Role</label>
                        <select 
                            className="nexus-select"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="Farmer">Farmer</option>
                            <option value="Processor">Processor</option>
                            <option value="Distributor">Distributor</option>
                            <option value="Retailer">Retailer</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <div className="nexus-form-group">
                        <label className="nexus-label">Operational Status</label>
                        <select 
                            className="nexus-select"
                            value={formData.status}
                            onChange={e => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="Active">Operational (Active)</option>
                            <option value="Blocked">Restricted (Blocked)</option>
                        </select>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button type="button" className="nexus-btn nexus-btn-ghost flex-1" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="nexus-btn nexus-btn-primary flex-1" disabled={loading}>
                            {loading ? 'Syncing...' : 'Update Node'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NexusEditUserModal;
