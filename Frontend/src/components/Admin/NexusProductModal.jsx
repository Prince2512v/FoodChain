import api from '../../services/api';

const NexusProductModal = ({ isOpen, onClose, token }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/Product');
            setProducts(res.data);
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
                        <i className="bi bi-box-seam text-purple-400 mr-2"></i>
                        Supply Chain Inventory Ledger
                    </h2>
                    <button className="nexus-btn nexus-btn-ghost p-1" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="admin-panel-body p-0 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <table className="nexus-table">
                        <thead>
                            <tr>
                                <th>Batch ID</th>
                                <th>Product Name</th>
                                <th>Farmer</th>
                                <th>Status</th>
                                <th>Blockchain Hash</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-20">
                                        <div className="admin-spinner mx-auto scale-75"></div>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-20 text-slate-500">
                                        No products found in the current node.
                                    </td>
                                </tr>
                            ) : (
                                products.map(p => (
                                    <tr key={p.id}>
                                        <td className="font-mono text-cyan-400 text-xs">{p.batchId}</td>
                                        <td className="font-bold text-slate-200">{p.productName}</td>
                                        <td className="text-slate-400 text-xs">{p.farmerName || 'Registered Farmer'}</td>
                                        <td>
                                            <span className={`status-badge status-${p.status === 'Completed' || p.status === 'Delivered' ? 'Active' : 'Pending'}`}>
                                                {p.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            {p.blockchainTxHash ? (
                                                <a 
                                                    href={`https://etherscan.io/tx/${p.blockchainTxHash}`} 
                                                    target="_blank" 
                                                    className="tx-hash text-[0.6rem]"
                                                >
                                                    {p.blockchainTxHash.slice(0, 10)}...
                                                </a>
                                            ) : (
                                                <span className="text-slate-600 text-[0.6rem]">UNRECORDED</span>
                                            )}
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

export default NexusProductModal;
