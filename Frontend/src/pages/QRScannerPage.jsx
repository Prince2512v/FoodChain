import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const QRScannerPage = () => {
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const scanner = new Html5QrcodeScanner("reader", { 
            fps: 10, 
            qrbox: { width: 250, height: 250 } 
        }, false);

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText) {
            console.log(`Scan Result: ${decodedText}`);
            scanner.clear();
            
            try {
                const url = new URL(decodedText);
                const trackMatch = url.pathname.match(/\/track\/(.+)/);
                if (trackMatch) {
                    navigate(`/track/${trackMatch[1]}`);
                    return;
                }
                const id = url.searchParams.get('id');
                if (id) {
                    navigate(`/track/${id}`);
                    return;
                }
                const verifyMatch = url.pathname.match(/\/verify\/(.+)/);
                if (verifyMatch) {
                    navigate(`/track/${verifyMatch[1]}`);
                    return;
                }
            } catch {
                // Not a URL — treat as raw batch ID
            }
            
            navigate(`/track/${decodedText}`);
        }

        function onScanFailure(error) {
            // Silently ignore camera-focusing failures
        }

        return () => {
            scanner.clear().catch(err => console.error("Failed to clear scanner", err));
        };
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Navbar />
            
            <main className="max-w-4xl mx-auto px-4 py-12 pt-28">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-indigo-50 border border-indigo-100 mb-4 shadow-sm">
                        <i className="bi bi-qr-code-scan text-4xl text-indigo-600"></i>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Product Authenticity Scanner</h2>
                    <p className="text-slate-500 font-medium">Scan the QR code on the product packaging to verify its blockchain provenance.</p>
                </div>

                <div className="max-w-md mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-6 overflow-hidden">
                    <div id="reader" className="w-full child:border-none child:shadow-none"></div>
                </div>

                {error && (
                    <div className="max-w-md mx-auto mt-6 p-4 text-red-700 bg-red-50 rounded-xl border border-red-200 shadow-sm text-center font-medium text-sm">
                        <i className="bi bi-exclamation-triangle-fill mr-2"></i>{error}
                    </div>
                )}

                <div className="text-center mt-8">
                    <button 
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 font-bold text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm transition-all"
                    >
                        <i className="bi bi-arrow-left"></i> Go Back
                    </button>
                </div>
            </main>
        </div>
    );
};

export default QRScannerPage;
