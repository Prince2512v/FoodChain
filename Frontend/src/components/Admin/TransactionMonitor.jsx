import api from '../../services/api';

const TransactionMonitor = () => {
    const { token } = useContext(AuthContext);
    const [txs, setTxs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/Admin/transactions');
            setTxs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-4"><Spinner size="sm" /></div>;

    return (
        <div className="glass-card p-4 border-0 mb-4 h-100">
            <h4 className="fw-bold mb-4">🔗 Blockchain Monitor</h4>
            <div className="table-responsive" style={{ maxHeight: '400px' }}>
                <Table variant="dark" hover className="admin-table small">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Role</th>
                            <th>Action</th>
                            <th>Link</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {txs.map((tx, i) => (
                            <tr key={i}>
                                <td>{new Date(tx.createdAt).toLocaleTimeString()}</td>
                                <td><Badge bg="secondary">{tx.role}</Badge></td>
                                <td className="text-info fw-bold">{tx.action}</td>
                                <td>
                                    <a 
                                        href={`https://etherscan.io/tx/${tx.txHash}`} 
                                        target="_blank" 
                                        className="text-white-50 text-decoration-none"
                                        title={tx.txHash}
                                    >
                                        {tx.txHash.slice(0, 10)}...
                                    </a>
                                </td>
                                <td>
                                    <Badge bg={tx.status === 'Success' ? 'success' : 'danger'} pill>
                                        {tx.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default TransactionMonitor;
