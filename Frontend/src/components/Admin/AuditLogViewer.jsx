import api from '../../services/api';

const AuditLogViewer = () => {
    const { token } = useContext(AuthContext);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/Admin/audit-logs');
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(l => 
        l.action.toLowerCase().includes(filter.toLowerCase()) || 
        l.details.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) return <div className="text-center py-4"><Spinner size="sm" /></div>;

    return (
        <div className="glass-card p-4 border-0 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">📜 Security Audit Logs</h4>
                <Form.Control 
                    size="sm"
                    className="custom-input w-25" 
                    placeholder="Filter logs..." 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
            <div className="table-responsive" style={{ maxHeight: '400px' }}>
                <Table variant="dark" hover className="admin-table small">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th>IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map((log, i) => (
                            <tr key={i}>
                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="fw-bold text-warning">{log.action}</td>
                                <td className="text-muted">{log.details}</td>
                                <td className="text-white-50">{log.ipAddress}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default AuditLogViewer;
