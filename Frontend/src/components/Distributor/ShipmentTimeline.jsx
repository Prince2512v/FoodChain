import api from '../../services/api';

// ─────────────────────────────────────────────────────────
//  ShipmentTimeline
//  Full tracking history: locations, conditions, blockchain
// ─────────────────────────────────────────────────────────

const ShipmentTimeline = ({ shipment }) => {
  const { token } = useContext(AuthContext);

  const [batchId,  setBatchId]  = useState(shipment?.batchId || '');
  const [history,  setHistory]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [alert,    setAlert]    = useState(null);

  React.useEffect(() => {
    if (shipment?.batchId) {
      setBatchId(shipment.batchId);
    }
  }, [shipment]);

  const fetchHistory = async (id) => {
    const bid = id || batchId;
    if (!bid) {
      setAlert({ type: 'warning', msg: 'Enter a Batch ID to view history.' });
      return;
    }
    setLoading(true);
    setAlert(null);
    setHistory(null);
    try {
      const res = await api.get(`/Distributor/history/${encodeURIComponent(bid)}`);
      setHistory(res.data);
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data || 'Failed to fetch history.';
      setAlert({ type: 'error', msg: serverMsg });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (shipment?.batchId) fetchHistory(shipment.batchId);
  }, [shipment?.batchId]);

  // Build unified timeline events sorted by timestamp
  const buildTimeline = (h) => {
    const events = [];

    if (h.product?.timestamp) {
      events.push({ type: 'product',   label: '🌱 Product Registered',        time: h.product.timestamp, data: h.product });
    }
    if (h.processing?.processingDate) {
      events.push({ type: 'processing', label: '⚙️ Processing Started',       time: h.processing.processingDate, data: h.processing });
    }
    if (h.qualityCheck?.checkDate) {
      events.push({ type: 'quality',   label: '🔬 Quality Check Performed',   time: h.qualityCheck.checkDate, data: h.qualityCheck });
    }
    if (h.packaging?.packagedDate) {
      events.push({ type: 'packaging', label: '📦 Packaged',                  time: h.packaging.packagedDate, data: h.packaging });
    }
    if (h.shipment?.createdAt) {
      events.push({ type: 'shipment',  label: '🚛 Shipment Accepted',         time: h.shipment.createdAt, data: h.shipment });
    }
    if (h.shipment?.dispatchDate) {
      events.push({ type: 'dispatch',  label: '📤 Dispatched',                time: h.shipment.dispatchDate, data: h.shipment });
    }

    (h.locationLogs || []).forEach((l) => {
      events.push({ type: 'location', label: '📍 Location Update', time: l.timestamp, data: l });
    });

    (h.storageConditions || []).forEach((c) => {
      events.push({
        type:  c.thresholdBreached ? 'breach' : 'condition',
        label: c.thresholdBreached ? '⚠️ Threshold Breach!' : '🌡️ Storage Condition',
        time:  c.timestamp,
        data:  c
      });
    });

    (h.issues || []).forEach((i) => {
      events.push({ type: 'issue', label: `🚨 Issue: ${i.issueType}`, time: i.timestamp, data: i });
    });

    if (h.shipment?.deliveryDate) {
      events.push({ type: 'delivered', label: '✅ Delivered', time: h.shipment.deliveryDate, data: h.shipment });
    }

    return events.sort((a, b) => new Date(a.time) - new Date(b.time));
  };

  const TYPE_CONFIG = {
    product:    { color: '#6C63FF', dot: '🌱' },
    processing: { color: '#00A8FF', dot: '⚙️' },
    quality:    { color: '#FFB347', dot: '🔬' },
    packaging:  { color: '#00C49A', dot: '📦' },
    shipment:   { color: '#6C63FF', dot: '🚛' },
    dispatch:   { color: '#00A8FF', dot: '📤' },
    location:   { color: '#a0a8ff', dot: '📍' },
    condition:  { color: '#00C49A', dot: '🌡️' },
    breach:     { color: '#FF6584', dot: '⚠️' },
    issue:      { color: '#FF4757', dot: '🚨' },
    delivered:  { color: '#00C49A', dot: '✅' },
  };

  return (
    <div>
      {/* Search / Auto-load */}
      <div className="dist-history-header">
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#e0dcff' }}>📊 Shipment History</h2>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.82rem', color: '#888' }}>
            Full supply chain journey — farm to delivery
          </p>
        </div>
        <div className="dist-history-search">
          <input
            type="text"
            placeholder="Enter Batch ID…"
            value={batchId}
            onChange={e => setBatchId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchHistory()}
            className="dist-history-search__input"
          />
          <button className="dist-btn dist-btn--primary" style={{ width: 'auto', padding: '0.55rem 1.2rem' }}
            onClick={() => fetchHistory()} disabled={loading}>
            {loading ? '⏳' : '🔍 Load'}
          </button>
        </div>
      </div>

      {alert && (
        <div className={`dist-alert dist-alert--${alert.type}`} style={{ margin: '0 0 1rem' }}>
          {alert.msg}
        </div>
      )}

      {!history && !loading && (
        <div className="dist-empty">
          <span>📋</span>
          <p>Enter a Batch ID above to view the complete supply chain journey.</p>
        </div>
      )}

      {loading && <div className="dist-loading">Loading history…</div>}

      {history && (
        <div className="dist-history-grid">
          {/* Product Summary Card */}
          <div className="dist-summary-card">
            <ProductSummaryCard data={history} />
          </div>

          {/* Timeline */}
          <div className="dist-timeline-wrapper">
            {buildTimeline(history).map((event, i) => {
              const cfg = TYPE_CONFIG[event.type] || { color: '#888', dot: '•' };
              return (
                <TimelineEntry key={i} event={event} config={cfg} isLast={false} />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────

const ProductSummaryCard = ({ data }) => {
  const { product, shipment } = data;
  if (!product) return null;

  return (
    <div className="dist-form-card">
      <h2>📦 Batch Overview</h2>
      <div className="dist-summary-grid">
        <SummaryItem label="Batch ID"     value={product.batchId} mono />
        <SummaryItem label="Product"      value={product.productName} />
        <SummaryItem label="Type"         value={product.cropType} />
        <SummaryItem label="Quantity"     value={`${product.quantity} ${product.unit}`} />
        <SummaryItem label="Status"       value={product.status} highlight />
        <SummaryItem label="Farmer"       value={product.farmer?.name || '—'} />
        <SummaryItem label="Processor"    value={product.processor?.name || '—'} />
        {shipment?.distributor && (
          <SummaryItem label="Distributor" value={shipment.distributor.name} />
        )}
        {shipment?.blockchainTxHash && (
          <SummaryItem label="TX Hash" value={shipment.blockchainTxHash} mono />
        )}
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value, mono, highlight }) => (
  <div className="dist-summary-item">
    <span className="dist-summary-item__label">{label}</span>
    <span className={`dist-summary-item__value ${mono ? 'mono' : ''} ${highlight ? 'highlight' : ''}`}>
      {value ?? '—'}
    </span>
  </div>
);

const TimelineEntry = ({ event, config }) => (
  <div className="dist-timeline-entry">
    <div className="dist-timeline-entry__dot" style={{ borderColor: config.color, background: `${config.color}22` }}>
      {config.dot}
    </div>
    <div className="dist-timeline-entry__body">
      <p className="dist-timeline-entry__label" style={{ color: config.color }}>{event.label}</p>
      <p className="dist-timeline-entry__time">{new Date(event.time).toLocaleString()}</p>
      <TimelineDetail type={event.type} data={event.data} />
    </div>
  </div>
);

const TimelineDetail = ({ type, data }) => {
  if (!data) return null;
  switch (type) {
    case 'location':
      return (
        <div className="dist-timeline-entry__detail">
          📍 {data.latitude?.toFixed(5)}, {data.longitude?.toFixed(5)}
          {data.locationName && <span> — {data.locationName}</span>}
          <span className="dist-timeline-entry__tag">{data.source}</span>
        </div>
      );
    case 'condition':
    case 'breach':
      return (
        <div className="dist-timeline-entry__detail">
          🌡️ {data.temperature}°C | 💧 {data.humidity}% | {data.storageType}
          {data.thresholdBreached && <span className="dist-timeline-entry__tag danger">BREACH</span>}
        </div>
      );
    case 'issue':
      return (
        <div className="dist-timeline-entry__detail">
          <strong>{data.issueType}</strong> ({data.severity}) — {data.description}
        </div>
      );
    case 'shipment':
    case 'dispatch':
      return (
        <div className="dist-timeline-entry__detail">
          {data.vehicleNumber && <span>🚛 {data.vehicleNumber} ({data.transportType})</span>}
          {data.driverName && <span> | 👤 {data.driverName}</span>}
        </div>
      );
    default:
      return null;
  }
};

export default ShipmentTimeline;

// ── Scoped Styles ─────────────────────────────────────────
const styles = `
.dist-history-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.dist-history-search {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}

.dist-history-search__input {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 0.6rem 1rem;
  color: #e0dcff;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  outline: none;
  width: 220px;
  transition: border-color 0.2s;
}

.dist-history-search__input:focus { border-color: #6C63FF; }

.dist-history-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 900px) { .dist-history-grid { grid-template-columns: 1fr; } }

.dist-summary-grid {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.dist-summary-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  padding: 0.3rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.dist-summary-item__label { color: #777; }
.dist-summary-item__value { color: #ccc; font-weight: 500; max-width: 60%; text-align: right; word-break: break-all; }
.dist-summary-item__value.mono { font-family: monospace; font-size: 0.75rem; color: #a0a8ff; }
.dist-summary-item__value.highlight { color: #6C63FF; font-weight: 700; }

.dist-timeline-wrapper {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.dist-timeline-entry {
  display: flex;
  gap: 1rem;
  position: relative;
  padding-bottom: 1.5rem;
}

.dist-timeline-entry::before {
  content: '';
  position: absolute;
  left: 17px;
  top: 36px;
  width: 2px;
  height: calc(100% - 20px);
  background: rgba(255,255,255,0.07);
}

.dist-timeline-entry:last-child::before { display: none; }

.dist-timeline-entry__dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid;
  display: grid;
  place-items: center;
  font-size: 1rem;
  flex-shrink: 0;
  z-index: 1;
}

.dist-timeline-entry__body { flex: 1; padding-top: 0.1rem; }

.dist-timeline-entry__label {
  font-size: 0.88rem;
  font-weight: 700;
  margin: 0 0 0.1rem;
}

.dist-timeline-entry__time {
  font-size: 0.72rem;
  color: #666;
  margin: 0 0 0.3rem;
}

.dist-timeline-entry__detail {
  font-size: 0.8rem;
  color: #999;
  background: rgba(255,255,255,0.03);
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.dist-timeline-entry__tag {
  background: rgba(108,99,255,0.2);
  color: #a0a8ff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.5rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.dist-timeline-entry__tag.danger {
  background: rgba(255,101,132,0.2);
  color: #FF6584;
}
`;

if (typeof document !== 'undefined' && !document.getElementById('timeline-styles')) {
  const el = document.createElement('style');
  el.id = 'timeline-styles';
  el.textContent = styles;
  document.head.appendChild(el);
}
