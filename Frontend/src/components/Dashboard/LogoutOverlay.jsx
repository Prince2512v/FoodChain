import React from 'react';
import { Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LogoutOverlay = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleConfirmLogout = () => {
        // Add a small delay for "Powering Down" effect
        const overlay = document.querySelector('.logout-portal-content');
        if (overlay) overlay.classList.add('powering-down');
        
        setTimeout(() => {
            logout();
            navigate('/login');
        }, 800);
    };

    return (
        <div className="logout-portal-backdrop animate-fade-in" onClick={onClose}>
            <div className="logout-portal-content glass-card" onClick={e => e.stopPropagation()}>
                <div className="quantum-core mb-4">
                    <i className="bi bi-power fs-1 text-danger"></i>
                    <div className="aura-ring aura-primary"></div>
                    <div className="aura-ring aura-secondary"></div>
                </div>

                <h2 className="fw-bold mb-2 text-dark">Terminate Session?</h2>
                <p className="text-muted mb-4 small fw-medium px-4">
                    Confirming will securely disconnect your wallet and clear your current blockchain production node context.
                </p>

                <div className="d-flex flex-column gap-3 w-100 px-4 mt-2">
                    <Button 
                        variant="danger" 
                        className="py-3 rounded-4 fw-bold shadow-lg border-0 d-flex align-items-center justify-content-center gap-2 logout-confirm-btn"
                        onClick={handleConfirmLogout}
                    >
                        <i className="bi bi-box-arrow-right fs-5"></i>
                        DISCONNECT SYSTEM
                    </Button>
                    <Button 
                        variant="light" 
                        className="py-3 rounded-4 fw-bold border text-muted"
                        onClick={onClose}
                    >
                        STAY CONNECTED
                    </Button>
                </div>

                <div className="mt-4 pt-2">
                    <span className="badge bg-light text-muted border px-3 py-2 rounded-pill font-monospace" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                        NODE STATUS: VERIFIED
                    </span>
                </div>
            </div>

            <style>{`
                .logout-portal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.4);
                    backdrop-filter: blur(25px) saturate(160%);
                    -webkit-backdrop-filter: blur(25px) saturate(160%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }

                .logout-portal-content {
                    width: 100%;
                    max-width: 420px;
                    padding: 3.5rem 2rem;
                    text-align: center;
                    background: rgba(255, 255, 255, 0.8) !important;
                    border: 1px solid rgba(255, 255, 255, 0.5) !important;
                    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.1) !important;
                    border-radius: 32px !important;
                    transform: scale(1);
                    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .quantum-core {
                    position: relative;
                    width: 100px;
                    height: 100px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 50%;
                    display: grid;
                    place-items: center;
                    box-shadow: 0 15px 30px rgba(220, 53, 69, 0.15);
                    z-index: 1;
                }

                .aura-ring {
                    position: absolute;
                    inset: -10px;
                    border: 2px solid transparent;
                    border-radius: 50%;
                    animation: spin 3s linear infinite;
                }

                .aura-primary {
                    border-top-color: var(--primary);
                    opacity: 0.3;
                    inset: -15px;
                }

                .aura-secondary {
                    border-bottom-color: #dc3545;
                    opacity: 0.2;
                    animation-direction: reverse;
                    animation-duration: 2s;
                    inset: -8px;
                }

                .logout-confirm-btn {
                    background: linear-gradient(135deg, #dc3545, #b02a37) !important;
                    transition: all 0.3s !important;
                }

                .logout-confirm-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 30px rgba(220, 53, 69, 0.3) !important;
                }

                .powering-down {
                    transform: scale(0.8) !important;
                    opacity: 0 !important;
                    filter: blur(20px) !important;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default LogoutOverlay;
