import api from '../../services/api';

const UserManager = () => {
    const { token } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEdit, setShowEdit] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

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

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/Admin/users/${selectedUser.id}`, selectedUser);
            if (res.status === 200) {
                setShowEdit(false);
                fetchUsers();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleBlock = async (user) => {
        const action = user.status === 'Blocked' ? 'unblock' : 'block';
        try {
            const res = await api.put(`/Admin/users/${user.id}/${action}`);
            if (res.status === 200) fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/Admin/users/${id}`);
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="text-center py-5">
            <Spinner animation="alternate" variant="primary" className="mb-3" />
            <p className="fw-bold text-muted">Accessing Identity Mainframe...</p>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4 px-3">
                <h5 className="fw-bold mb-0 text-dark">
                    <i className="bi bi-people-fill text-primary me-2"></i>
                    Network Participants <span className="text-muted small fw-normal ms-2">({users.length} total)</span>
                </h5>
                <div className="d-flex gap-3">
                    <InputGroup style={{ maxWidth: '300px' }}>
                        <InputGroup.Text className="bg-white border-end-0 rounded-start-4">
                            <i className="bi bi-search text-muted"></i>
                        </InputGroup.Text>
                        <Form.Control 
                            placeholder="Filter by name/email..." 
                            className="border-start-0 rounded-end-4 py-2" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </div>
            </div>

            <div className="table-responsive">
                <table className="quantum-table">
                    <thead>
                        <tr>
                            <th style={{ width: '25%' }}>Identity</th>
                            <th style={{ width: '15%' }}>Node Role</th>
                            <th style={{ width: '15%' }}>Status</th>
                            <th style={{ width: '15%' }}>Authorization Date</th>
                            <th style={{ width: '30%', textAlign: 'right' }}>Management</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-2 rounded-circle bg-primary-subtle text-primary fw-bold px-3 py-2" style={{ fontSize: '0.8rem' }}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark">{user.name}</div>
                                            <div className="text-muted small text-truncate" style={{ maxWidth: '180px' }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <Badge bg="primary-subtle" className="text-primary rounded-pill px-3 py-2 border-0 shadow-none">
                                        {user.role.toUpperCase()}
                                    </Badge>
                                </td>
                                <td>
                                    <Badge bg={user.status === 'Active' ? 'success-subtle' : 'danger-subtle'} className={`rounded-pill px-3 py-2 border-0 shadow-none ${user.status === 'Active' ? 'text-success' : 'text-danger'}`}>
                                        {user.status.toUpperCase()}
                                    </Badge>
                                </td>
                                <td className="small fw-bold text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <div className="d-flex gap-2 justify-content-end">
                                        <button className="btn btn-sm btn-light border rounded-pill px-3 fw-bold" onClick={() => { setSelectedUser(user); setShowEdit(true); }}>
                                            <i className="bi bi-pencil-square"></i>
                                        </button>
                                        <button 
                                            className={`btn btn-sm rounded-pill px-3 fw-bold ${user.status === 'Active' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                            onClick={() => toggleBlock(user)}
                                        >
                                            {user.status === 'Active' ? <i className="bi bi-shield-lock"></i> : <i className="bi bi-shield-check"></i>}
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold" onClick={() => deleteUser(user.id)}>
                                            <i className="bi bi-trash3"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            <Modal show={showEdit} onHide={() => setShowEdit(false)} contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
                <Modal.Header closeButton className="bg-light border-0 py-4 px-4">
                    <Modal.Title className="fw-bold text-dark">
                        <i className="bi bi-person-gear me-2 text-primary"></i>
                        Administrative Edit
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdateUser} className="p-3">
                    <Modal.Body className="px-4">
                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-muted text-uppercase">Legal Alias</Form.Label>
                            <Form.Control 
                                type="text" className="py-2 rounded-3"
                                value={selectedUser?.name || ''} 
                                onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                            />
                        </Form.Group>
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-muted text-uppercase">Access Level</Form.Label>
                                    <Form.Select 
                                        className="py-2 rounded-3"
                                        value={selectedUser?.role || ''} 
                                        onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                                    >
                                        <option value="Farmer">Farmer</option>
                                        <option value="Processor">Processor</option>
                                        <option value="Distributor">Distributor</option>
                                        <option value="Retailer">Retailer</option>
                                        <option value="Admin">Admin</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-muted text-uppercase">Operation Hub</Form.Label>
                                    <Form.Select 
                                        className="py-2 rounded-3"
                                        value={selectedUser?.status || ''} 
                                        onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value})}
                                    >
                                        <option value="Active">Operational</option>
                                        <option value="Blocked">Suspended</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-0 px-4 pb-4 pt-0">
                        <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setShowEdit(false)}>DISCARD</button>
                        <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" type="submit">COMMIT CHANGES</button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManager;
