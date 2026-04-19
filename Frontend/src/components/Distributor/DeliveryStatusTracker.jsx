import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { getBlockchainSigner } from '../../services/blockchain';

// ─────────────────────────────────────────────────────────
//  DeliveryStatusTracker
//  Visual step-by-step status updater
//  Also handles: MetaMask connect + blockchain recording
// ─────────────────────────────────────────────────────────

const STATUS_FLOW = [
  { key: 'Packaged',          label: 'Packaged',           icon: '📦', color: 'text-indigo-500' },
  { key: 'In Transit',        label: 'In Transit',          icon: '🚛', color: 'text-sky-500' },
  { key: 'Out for Delivery',  label: 'Out for Delivery',    icon: '📬', color: 'text-amber-500' },
  { key: 'Delivered',         label: 'Delivered',           icon: '✅', color: 'text-emerald-500' },
];

const ISSUE_STATUSES = ['Delayed', 'Issue Reported'];

const DeliveryStatusTracker = ({ shipment }) => {
  const { token } = useContext(AuthContext);

  const [currentStatus, setCurrentStatus] = useState(shipment?.status || 'In Transit');
  const [loading,   setLoading]   = useState(false);
  const [bcLoading, setBcLoading] = useState(false);
  const [alert,     setAlert]     = useState(null);
  const [wallet,    setWallet]    = useState('');
  const [txHash,    setTxHash]    = useState('');
  const [showQR,    setShowQR]    = useState(false);

  React.useEffect(() => {
    if (shipment?.status) setCurrentStatus(shipment.status);
  }, [shipment]);

  // ── Update Status API ───────────────────────────────────
  const handleStatusUpdate = async (newStatus) => {
    if (!shipment?.id) {
      setAlert({ type: 'warning', msg: 'Accept a shipment first.' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const res  = await fetch(`http://localhost:5160/api/distributor/status/${shipment.id}`, {
        method:  'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: 'error', msg: data.message || 'Failed to update status.' });
      } else {
        setCurrentStatus(newStatus);
        setAlert({ type: 'success', msg: `✅ Status updated to: ${newStatus}` });
      }
    } catch {
      setAlert({ type: 'error', msg: 'Network error.' });
    } finally {
      setLoading(false);
    }
  };

  // ── Record on Blockchain ────────────────────────────────
  const recordOnBlockchain = async () => {
    if (!shipment?.batchId) {
      setAlert({ type: 'warning', msg: 'No batch ID available. Ensure shipment is selected.' });
      return;
    }

    setBcLoading(true);
    setAlert(null);

    try {
      const { ethers } = await import('ethers');
      const signer = await getBlockchainSigner();
      setWallet(await signer.getAddress());

      // Contract ABI — just the updateShipment function
      const abi = [
        'function updateShipment(string memory _batchId, string memory _locationHash, string memory _status, uint256 _timestamp) public'
      ];

      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const logisticsData = JSON.stringify({
        shipmentId: shipment.id,
        status:     currentStatus,
        timestamp:  Date.now(),
      });
      const locationHash = ethers.id(logisticsData);
      const timestamp    = Math.floor(Date.now() / 1000);

      const tx   = await contract.updateShipment(shipment.batchId, locationHash, currentStatus, timestamp);
      let hash = tx.hash;
      try {
        const receipt = await tx.wait();
        if (receipt && receipt.hash) hash = receipt.hash;
      } catch (waitErr) {
        console.warn("MetaMask rate limit on wait(). Proceeding with tx hash:", waitErr);
      }

      setTxHash(hash);

      const res = await fetch('http://localhost:5160/api/blockchain/shipment', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchId: shipment.batchId,
          txHash:  hash,
          status:  currentStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: 'warning', msg: `TX sent (${hash.slice(0,16)}…) but DB save failed: ${data.message}` });
      } else {
        setAlert({ type: 'success', msg: `⛓ Blockchain recorded! TX: ${hash.slice(0, 20)}…` });
      }

    } catch (err) {
      console.error(err);
      let errorMsg = err.message || 'Unknown error';
      if (errorMsg.includes("BLOCKCHAIN_PENDING")) {
          errorMsg = "Request already pending in MetaMask. Please check your extension window.";
      }
      setAlert({ type: 'error', msg: `Blockchain error: ${errorMsg.slice(0, 80)}` });
    } finally {
      setBcLoading(false);
    }
  };

  const currentIdx = STATUS_FLOW.findIndex(s => s.key === currentStatus);
  const isIssue    = ISSUE_STATUSES.includes(currentStatus);
  const trackUrl   = shipment?.batchId ? `${window.location.origin}/track?id=${shipment.batchId}` : '';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 m-0 flex items-center gap-2">
            <i className="bi bi-clock-history text-sky-500"></i> Delivery Status
        </h2>
        {shipment && (
          <button 
            className="px-3 py-1 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors" 
            onClick={() => setShowQR(true)} 
            title="Share Tracking QR"
          >
            <i className="bi bi-qr-code mr-1"></i> QR Share
          </button>
        )}
      </div>

      {!shipment && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
          <i className="bi bi-exclamation-triangle-fill text-amber-500"></i>
          <p className="text-sm font-semibold text-amber-800 m-0">
            Accept a shipment first to track status.
          </p>
        </div>
      )}

      {alert && (
        <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 ${
          alert.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 
          alert.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
          'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <i className={`bi ${alert.type === 'error' ? 'bi-x-circle-fill' : alert.type === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'}`}></i>
          <p className="text-sm font-semibold m-0">{alert.msg}</p>
        </div>
      )}

      {/* Status Stepper */}
      <div className="flex flex-col gap-0 py-4">
        {STATUS_FLOW.map((step, idx) => {
          const done    = idx <= currentIdx && !isIssue;
          const active  = step.key === currentStatus && !isIssue;

          return (
            <div key={step.key} className="flex items-center gap-4 relative mb-6 last:mb-2">
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg flex-shrink-0 z-10 transition-colors ${
                    done ? 'bg-emerald-50 border-emerald-500 text-emerald-500' : 
                    active ? `bg-white shadow-md border-sky-500 text-sky-500` : 
                    'bg-white border-slate-200 text-slate-300'
                }`}
              >
                {done ? <i className="bi bi-check-lg"></i> : step.icon}
              </div>
              <span className={`text-sm font-bold ${active ? 'text-slate-900' : 'text-slate-500'}`}>
                {step.label}
              </span>
              {idx < STATUS_FLOW.length - 1 && (
                <div className={`absolute left-5 top-10 w-[2px] h-6 -z-0 ${idx < currentIdx && !isIssue ? 'bg-emerald-500' : 'bg-slate-100'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Issue badge */}
      {isIssue && (
        <div className="bg-red-50 text-red-600 border border-red-200 py-3 px-4 rounded-xl mb-4 text-center text-sm font-bold">
          <i className="bi bi-exclamation-triangle-fill mr-2"></i> {currentStatus}
        </div>
      )}

      {/* Status Action Buttons */}
      {shipment && (
        <div className="mt-6 flex flex-col gap-3">
          {currentStatus === 'In Transit' && (
            <button 
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={() => handleStatusUpdate('Out for Delivery')}
              disabled={loading}
            >
              {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-mailbox"></i>} Mark: Out for Delivery
            </button>
          )}
          {currentStatus === 'Out for Delivery' && (
            <button 
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={() => handleStatusUpdate('Delivered')}
              disabled={loading}
            >
              {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-check-circle"></i>} Mark: Delivered
            </button>
          )}
          {(currentStatus === 'Delayed' || currentStatus === 'Issue Reported') && (
            <button 
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-sky-600 bg-white hover:bg-sky-50 border border-sky-200 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={() => handleStatusUpdate('In Transit')}
              disabled={loading}
            >
              {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-arrow-repeat"></i>} Resume to In Transit
            </button>
          )}
          {currentStatus === 'Delivered' && (
            <div className="bg-emerald-50 border border-emerald-200 shadow-sm rounded-xl py-3 px-4 text-center mb-0 mt-2">
              <p className="text-emerald-700 font-bold text-sm m-0 flex items-center justify-center gap-2">
                  <i className="bi bi-stars"></i> Shipment successfully delivered!
              </p>
            </div>
          )}
        </div>
      )}

      <hr className="my-6 border-slate-200" />

      {/* MetaMask + Blockchain */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
           <i className="bi bi-link-45deg"></i> Blockchain Recording
        </p>

        {wallet ? (
          <div>
            <div className="bg-slate-100 text-slate-600 border border-slate-200 p-2 rounded-lg text-xs mb-4 text-center font-mono font-semibold flex items-center justify-center gap-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg" alt="MM" width="16" /> {wallet.slice(0, 8)}…{wallet.slice(-6)}
            </div>
            <button 
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={recordOnBlockchain} 
              disabled={bcLoading || !shipment}
            >
              {bcLoading ? <><span className="spinner-border spinner-border-sm"></span>Signing...</> : <><i className="bi bi-safe2"></i> Record on Blockchain</>}
            </button>
            {txHash && (
              <p className="mt-3 text-xs text-slate-500 text-center font-medium">
                TX: <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline">
                  {txHash.slice(0, 24)}…
                </a>
              </p>
            )}
          </div>
        ) : (
             <button 
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 flex items-center justify-center gap-2" 
                onClick={recordOnBlockchain}
             >
               <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg" alt="MM" width="18" />
               Connect & Sync Blockchain
             </button>
        )}
      </div>

      {/* QR Modal Overlay */}
      {showQR && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowQR(false)}>
          <div className="bg-white border border-slate-200 shadow-2xl p-8 rounded-3xl text-center relative max-w-sm w-full transform scale-100 transition-transform" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors focus:outline-none" onClick={() => setShowQR(false)}>
                <i className="bi bi-x-lg"></i>
            </button>
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-2xl mx-auto mb-4">
                <i className="bi bi-qr-code-scan"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Share Tracking</h3>
            <p className="text-slate-500 text-sm mb-6">Scan this QR to view the public journey for Batch <strong className="text-slate-700">#{shipment?.batchId}</strong></p>
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl inline-block mb-6 shadow-sm">
              <QRCodeSVG value={trackUrl || 'https://quantumfoodchain.com'} size={180} />
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <code className="text-slate-500 text-xs truncate max-w-[200px]">{trackUrl.slice(0, 30)}...</code>
              <button 
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0" 
                onClick={() => { navigator.clipboard.writeText(trackUrl); alert('URL Copied!'); }}
              >
                <i className="bi bi-clipboard"></i> Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryStatusTracker;
