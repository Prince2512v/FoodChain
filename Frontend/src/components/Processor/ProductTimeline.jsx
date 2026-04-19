import React from 'react';
import { Card, Badge } from 'react-bootstrap';

/**
 * ProductTimeline — Renders a simple 4-step journey for the Processor's dashboard.
 * Supports both PascalCase and camelCase keys from the backend response.
 */
const ProductTimeline = ({ history }) => {
    if (!history) return null;

    // Support both PascalCase (raw C# serialization) and camelCase (JS convention)
    const product    = history.Product    || history.product;
    const processing = history.Processing || history.processing;
    const quality    = history.Quality    || history.qualityCheck || history.QualityCheck;
    const packaging  = history.Packaging  || history.packaging;

    if (!product) return null;

    const steps = [
        {
            title: '🌱 Harvested (Farmer)',
            date: product.harvestDate || product.timestamp,
            active: true,
            details: `${product.productName || 'Unknown'} - ${product.quantity || '?'} ${product.unit || ''}`,
            subtext: `Farmer: ${product.farmer?.name || 'Verified'}`,
            color: '#10b981'
        },
        {
            title: '⚙️ Processing',
            date: processing?.processingDate,
            active: !!processing,
            details: processing?.processingType || 'Pending...',
            subtext: processing ? `Conditions: ${processing.conditions || 'Standard'}` : 'Waiting for processor',
            color: '#6366f1'
        },
        {
            title: '🔬 Quality Check',
            date: quality?.checkDate,
            active: !!quality,
            details: quality ? `Grade ${quality.grade || 'N/A'} - ${quality.passed ? 'PASSED ✅' : 'REJECTED ❌'}` : 'Pending...',
            subtext: quality?.remarks || quality?.notes || '',
            color: quality?.passed ? '#10b981' : (quality ? '#ef4444' : '#9ca3af')
        },
        {
            title: '📦 Packaging',
            date: packaging?.packagedDate || packaging?.expiryDate,
            active: !!packaging,
            details: packaging ? `${packaging.packageType || 'Standard'} - ${packaging.weight || ''}` : 'Pending...',
            subtext: packaging?.expiryDate ? `Expires: ${new Date(packaging.expiryDate).toLocaleDateString()}` : '',
            color: '#f59e0b'
        }
    ];

    return (
        <Card className="glass-panel border-0 shadow-sm p-4 mt-4">
            <h5 className="fw-bold mb-4 text-dark d-flex align-items-center">
                <i className="bi bi-clock-history me-2 text-primary"></i>Product Journey
            </h5>
            <div className="pt-timeline ps-4">
                {steps.map((step, index) => (
                    <div key={index} className="mb-4 position-relative">
                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div 
                                className="position-absolute" 
                                style={{ 
                                    left: '-21px', top: '22px', bottom: '-20px', width: '2px', 
                                    background: step.active ? `linear-gradient(to bottom, ${step.color}44, transparent)` : '#e5e7eb' 
                                }}
                            ></div>
                        )}
                        {/* Dot marker */}
                        <div 
                            className="position-absolute rounded-circle d-flex align-items-center justify-content-center" 
                            style={{ 
                                width: '18px', height: '18px', left: '-30px', top: '3px',
                                background: step.active ? step.color : '#e5e7eb',
                                border: '2px solid white',
                                boxShadow: step.active ? `0 0 8px ${step.color}44` : 'none'
                            }}
                        ></div>
                        {/* Content */}
                        <div className="d-flex justify-content-between align-items-start">
                            <h6 className={`fw-bold mb-1 ${step.active ? 'text-dark' : 'text-muted'}`} style={{ fontSize: '0.9rem' }}>
                                {step.title}
                            </h6>
                            {step.date && (
                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    {new Date(step.date).toLocaleDateString()}
                                </small>
                            )}
                        </div>
                        <p className={`mb-0 small ${step.active ? 'fw-bold' : 'text-muted'}`} style={{ color: step.active ? step.color : undefined }}>
                            {step.details}
                        </p>
                        {step.subtext && <p className="small text-muted mb-0">{step.subtext}</p>}
                    </div>
                ))}
            </div>

            <style>{`
                .pt-timeline {
                    border-left: 2px solid #e5e7eb;
                }
            `}</style>
        </Card>
    );
};

export default ProductTimeline;
