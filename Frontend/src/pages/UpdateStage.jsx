import { useAuth } from '../context/AuthContext';

const UpdateStage = () => {
    const { user } = useAuth();
    const role = user?.role;
    
    const [productId, setProductId] = useState('');
    const [stage, setStage] = useState('');
    const [locationInput, setLocationInput] = useState('');
    const [temperature, setTemperature] = useState(20.0);
    const [actionDetails, setActionDetails] = useState('');
    const [qualityStatus, setQualityStatus] = useState('Pending');
    const [isRejected, setIsRejected] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const query = new URLSearchParams(useLocation().search);

    useEffect(() => {
        const id = query.get('id');
        if (id) setProductId(id);
        
        // Auto-select stage based on role to guide the user
        if (role === 'Processor') setStage('Processor');
        else if (role === 'Distributor') setStage('Distributor');
        else if (role === 'Retailer') setStage('Retailer');
    }, [role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const payload = { 
                productId: parseInt(productId), 
                stage, 
                location: locationInput, 
                temperature: parseFloat(temperature),
                actionDetails,
                qualityStatus: role === 'Processor' ? qualityStatus : null,
                isRejected: role === 'Processor' ? isRejected : false
            };
            const response = await api.post('/supplychain/update', payload);
            setMessage(`Step verified! Blockchain Tx: ${response.data.txHash}`);
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data || 'Failed to update stage. Access Denied or Network Error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-light min-vh-100">
            <Navbar />
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
                            <div className="bg-primary p-4 text-white d-flex align-items-center">
                                <i className="bi bi-shield-check fs-2 me-3"></i>
                                <div>
                                    <h3 className="fw-bold mb-0">Record Lifecycle Update</h3>
                                    <p className="mb-0 opacity-75 small text-uppercase fw-bold">Role: {role}</p>
                                </div>
                            </div>
                            <Card.Body className="p-5">
                                {message && <Alert variant={message.includes('verified') ? 'success' : 'danger'} className="rounded-3 shadow-sm mb-4">{message}</Alert>}
                                
                                <Form onSubmit={handleSubmit}>
                                    <Row className="g-4">
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold small text-muted text-uppercase">Tracking ID</Form.Label>
                                                <Form.Control type="number" placeholder="Enter Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} required className="rounded-3 px-4 py-2 border-light shadow-sm bg-light" />
                                            </Form.Group>
                                        </Col>
                                        
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold small text-muted text-uppercase">Milestone Stage</Form.Label>
                                                <Form.Select value={stage} onChange={(e) => setStage(e.target.value)} required className="rounded-3 px-4 py-2 border-light shadow-sm">
                                                    <option value="">Select Next Stage</option>
                                                    {role === 'Farmer' && <option value="Farmer">Initial Harvest</option>}
                                                    {role === 'Processor' && <option value="Processor">Processing & Quality</option>}
                                                    {role === 'Distributor' && <option value="Distributor">Logistics & Storage</option>}
                                                    {role === 'Retailer' && <option value="Retailer">Retail Acceptance</option>}
                                                    {role === 'Admin' && (
                                                        <>
                                                            <option value="Processor">Processor</option>
                                                            <option value="Distributor">Distributor</option>
                                                            <option value="Retailer">Retailer</option>
                                                        </>
                                                    )}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold small text-muted text-uppercase">Current Location</Form.Label>
                                                <Form.Control type="text" placeholder="e.g. Warehouse A-12" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} required className="rounded-3 px-4 py-2 border-light shadow-sm" />
                                            </Form.Group>
                                        </Col>

                                        {role === 'Processor' && (
                                            <>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-bold small text-muted text-uppercase text-primary">Quality Result</Form.Label>
                                                        <Form.Select value={qualityStatus} onChange={(e) => setQualityStatus(e.target.value)} className="rounded-3 px-4 py-2 border-primary shadow-sm">
                                                            <option value="Pending">Pending</option>
                                                            <option value="Passed">Passed</option>
                                                            <option value="Failed">Failed</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6} className="d-flex align-items-end">
                                                    <Form.Check type="switch" label="Reject this product?" checked={isRejected} onChange={(e) => setIsRejected(e.target.checked)} className="fw-bold text-danger mb-2" />
                                                </Col>
                                            </>
                                        )}

                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold small text-muted text-uppercase">Activity Details</Form.Label>
                                                <Form.Control as="textarea" rows={2} placeholder="What actions were performed?" value={actionDetails} onChange={(e) => setActionDetails(e.target.value)} required className="rounded-3 px-4 py-2 border-light shadow-sm" />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold small text-muted text-uppercase">Environment Temp (°C)</Form.Label>
                                                <Form.Control type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} required className="rounded-3 px-4 py-2 border-light shadow-sm" />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <div className="d-flex gap-3 mt-5">
                                        <Button variant="primary" type="submit" disabled={loading} className="rounded-pill px-5 fw-bold shadow-sm py-3 flex-grow-1">
                                            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Broadcasting...</> : 'Sign & Record Update'}
                                        </Button>
                                        <Button variant="outline-secondary" onClick={() => navigate('/dashboard')} className="rounded-pill px-4 shadow-sm">
                                            Cancel
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default UpdateStage;
