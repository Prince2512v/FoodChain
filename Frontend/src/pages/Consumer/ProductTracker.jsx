import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import TraceabilityTimeline from '../../components/Consumer/TraceabilityTimeline';
import AuthenticityCard from '../../components/Consumer/AuthenticityCard';
import FeedbackSection from '../../components/Consumer/FeedbackSection';
import MapView from '../../components/Consumer/MapView';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

const ProductTracker = () => {
    const { batchId: urlBatchId } = useParams();
    const navigate = useNavigate();
    
    const [batchId, setBatchId] = useState(urlBatchId || '');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState(null);
    const [error, setError] = useState(null);
    const [scannerActive, setScannerActive] = useState(false);

    useEffect(() => {
        if (urlBatchId) {
            setBatchId(urlBatchId);
            handleTrack(urlBatchId);
        }
    }, [urlBatchId]);

    const handleTrack = useCallback(async (bid) => {
        if (!bid || !bid.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/consumer/history/${encodeURIComponent(bid)}`);
            setHistory(response.data);
            if (bid !== urlBatchId) {
                navigate(`/track/${bid}`, { replace: true });
            }
        } catch (err) {
            const msg = err.response?.status === 404
                ? 'Product not found. Please check the Batch ID and try again.'
                : 'Could not connect to the tracking service. Please try again later.';
            setError(msg);
            setHistory(null);
        } finally {
            setLoading(false);
        }
    }, [urlBatchId, navigate]);

    useEffect(() => {
        if (!scannerActive) return;

        const scanner = new Html5QrcodeScanner("qr-reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        }, false);

        scanner.render(
            (result) => {
                scanner.clear();
                setScannerActive(false);
                let extractedId = result;
                try {
                    const url = new URL(result);
                    const trackMatch = url.pathname.match(/\/track\/(.+)/);
                    if (trackMatch) extractedId = trackMatch[1];
                    else {
                        const paramId = url.searchParams.get('id');
                        if (paramId) extractedId = paramId;
                    }
                } catch { /* raw batchId */ }
                setBatchId(extractedId);
                handleTrack(extractedId);
            },
            () => { /* ignore focus errors */ }
        );

        return () => {
            scanner.clear().catch(() => {});
        };
    }, [scannerActive, handleTrack]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
                {/* ── Hero Section ── */}
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold tracking-wider uppercase shadow-sm mb-4">
                        ⛓ Blockchain Verified
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                        Track Your Food
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Scan the QR code or search by Batch ID to verify product origin, safety, and full supply chain journey.
                    </p>
                </div>

                {/* ── Search Bar ── */}
                <div className="max-w-3xl mx-auto mb-12">
                    <div className="flex flex-col sm:flex-row items-center gap-3 p-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/60">
                        <div className="flex-grow w-full relative">
                            <input
                                type="text"
                                placeholder="Enter Batch ID (e.g., a1b2c3d4-...)"
                                className="w-full pl-5 pr-4 py-3 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-xl transition-shadow"
                                value={batchId}
                                onChange={(e) => setBatchId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleTrack(batchId)}
                            />
                        </div>
                        
                        <button 
                            onClick={() => handleTrack(batchId)} 
                            disabled={loading || !batchId.trim()}
                            className="w-full sm:w-auto px-6 py-3 font-bold text-white bg-gradient-to-r from-emerald-500 to-amber-500 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <><i className="bi bi-search"></i> Track</>
                            )}
                        </button>
                        
                        <button 
                            onClick={() => setScannerActive(!scannerActive)}
                            className={`w-full sm:w-auto px-5 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                                scannerActive 
                                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                        >
                            <i className={`bi ${scannerActive ? 'bi-x-lg' : 'bi-qr-code-scan'}`}></i>
                            {scannerActive ? 'Close' : 'Scan'}
                        </button>
                    </div>

                    {/* QR Scanner Reader */}
                    {scannerActive && (
                        <div className="mt-4 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 animate-fade-in relative">
                            <div id="qr-reader" className="w-full rounded-xl overflow-hidden child:border-none"></div>
                            <button 
                                onClick={() => setScannerActive(false)}
                                className="mt-4 w-full py-2.5 text-sm font-semibold text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-colors"
                            >
                                Cancel Scan
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Error Display ── */}
                {error && (
                    <div className="max-w-xl mx-auto mb-8 animate-fade-in">
                        <div className="flex items-center gap-3 p-4 text-red-700 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
                            <i className="bi bi-exclamation-triangle-fill text-xl"></i>
                            <p className="font-medium text-sm leading-relaxed">{error}</p>
                        </div>
                    </div>
                )}

                {/* ── Results Section ── */}
                {history && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                        
                        {/* ── Left Column: Timeline & Feedback ── */}
                        <div className="lg:col-span-2 space-y-6">
                            <AuthenticityCard product={history.product} />
                            <TraceabilityTimeline history={history} />
                            <FeedbackSection 
                                batchId={history.product?.batchId} 
                                existingFeedbacks={history.feedbacks} 
                                onNewFeedback={() => handleTrack(history.product?.batchId)} 
                            />
                        </div>

                        {/* ── Right Column: Info & Map ── */}
                        <div className="space-y-6">
                            
                            {/* QR Code Card */}
                            <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
                                <div className="inline-flex justify-center p-4 bg-slate-50 rounded-2xl mb-4 border border-slate-100">
                                    <QRCodeSVG 
                                        value={`${window.location.origin}/track/${history.product?.batchId}`} 
                                        size={140} 
                                        level="H" 
                                        includeMargin 
                                    />
                                </div>
                                <div className="mt-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold tracking-wide shadow-sm">
                                        <i className="bi bi-check-circle-fill"></i> CERTIFIED AUTHENTIC
                                    </span>
                                </div>
                            </div>
                            
                            {/* Farm Origin Card */}
                            <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <h5 className="font-bold text-lg text-emerald-900 mb-4 flex items-center gap-2">
                                    <i className="bi bi-geo-alt-fill text-emerald-500"></i> Farm Origin
                                </h5>
                                <div className="space-y-4 mb-4">
                                    <div>
                                        <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider mb-1">Farmer</p>
                                        <p className="font-bold text-slate-800">{history.product?.farmer?.name || 'Verified Producer'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                                        <p className="text-slate-700 text-sm">{history.product?.address || 'N/A'}</p>
                                        {history.product?.locationLat && (
                                            <p className="text-slate-500 text-xs mt-0.5">
                                                {history.product.locationLat}, {history.product.locationLong}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="rounded-xl overflow-hidden border border-slate-200 h-[200px]">
                                    <MapView 
                                        lat={parseFloat(history.product?.locationLat)} 
                                        lng={parseFloat(history.product?.locationLong)} 
                                        farmerName={history.product?.farmer?.name} 
                                    />
                                </div>
                            </div>

                            {/* Product Details Card */}
                            <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <h5 className="font-bold text-lg text-emerald-900 mb-4 flex items-center gap-2">
                                    <i className="bi bi-box-seam-fill text-emerald-500"></i> Product Details
                                </h5>
                                
                                <div className="divide-y divide-slate-100/80">
                                    <DetailItem label="Product" value={history.product?.productName} />
                                    <DetailItem label="Crop Type" value={history.product?.cropType} />
                                    <DetailItem label="Quantity" value={`${history.product?.quantity || 'N/A'} ${history.product?.unit || ''}`} />
                                    <DetailItem label="Harvested" value={history.product?.harvestDate ? new Date(history.product.harvestDate).toLocaleDateString() : 'N/A'} />
                                    <DetailItem label="Batch ID" value={history.product?.batchId} highlight />
                                    <DetailItem label="Status" value={history.product?.status} />
                                    
                                    {history.packaging && (
                                        <>
                                            <DetailItem label="Package Type" value={history.packaging.packageType} />
                                            <DetailItem label="Expiry" value={history.packaging.expiryDate ? new Date(history.packaging.expiryDate).toLocaleDateString() : 'N/A'} />
                                        </>
                                    )}
                                </div>
                            </div>
                            
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

// ── Helper Component ──
const DetailItem = ({ label, value, highlight }) => (
    <div className="flex justify-between items-center py-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`text-sm font-bold ${highlight ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100' : 'text-slate-800'}`}>
            {value || 'N/A'}
        </span>
    </div>
);

export default ProductTracker;
