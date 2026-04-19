import React from 'react';
import { Badge } from 'react-bootstrap';

const InventoryList = ({ inventory, onUpdate, onNewEntry }) => {
    
    const exportToCSV = () => {
        if (!inventory || inventory.length === 0) return;
        
        const headers = ["Product Name", "Batch ID", "Status", "Volume", "Sold", "Reserve", "Price"];
        const rows = inventory.map(i => [
            `"${i.productName}"`,
            `"${i.batchId}"`,
            `"${i.status}"`,
            `"${i.totalQuantity}"`,
            `"${i.soldQuantity}"`,
            `"${i.remainingQuantity}"`,
            `"$${i.price}"`
        ]);

        const csvContent = "\uFEFF" + [headers, ...rows]
            .map(e => e.join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const link = document.createElement("a");
            link.href = e.target.result;
            link.setAttribute("download", `Retail_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            
            setTimeout(() => {
                document.body.removeChild(link);
            }, 200);
        };
        
        reader.readAsDataURL(blob);
    };

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4 px-3">
                <h5 className="fw-bold mb-0 text-dark">
                    <i className="bi bi-stack text-warning me-2"></i>
                    Retail Inventory <span className="text-muted small fw-normal ms-2">({inventory.length} active SKUs)</span>
                </h5>
                <div className="d-flex gap-2">
                    <button 
                        className="btn btn-sm btn-light border rounded-pill px-3 glass-btn-hover"
                        onClick={exportToCSV}
                        disabled={inventory.length === 0}
                    >
                        <i className="bi bi-download me-1"></i> Export
                    </button>
                    <button 
                        className="btn btn-sm btn-warning rounded-pill px-3 fw-bold shadow-sm"
                        onClick={onNewEntry}
                    >
                        <i className="bi bi-plus-lg me-1"></i> New Entry
                    </button>
                </div>
            </div>
            
            <div className="table-responsive">
                <table className="quantum-table">
                    <thead>
                        <tr>
                            <th style={{ width: '20%' }}>Product Entity</th>
                            <th style={{ width: '15%' }}>Volume</th>
                            <th style={{ width: '10%' }}>Sales</th>
                            <th style={{ width: '10%' }}>Reserve</th>
                            <th style={{ width: '15%' }}>Valuation</th>
                            <th style={{ width: '15%' }}>Status</th>
                            <th style={{ width: '15%', textAlign: 'right' }}>Management</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.length > 0 ? inventory.map((i) => (
                            <tr key={i.id}>
                                <td>
                                    <div className="fw-bold text-dark fs-6">{i.productName}</div>
                                    <span className="badge-quantum text-warning" style={{ background: 'rgba(245, 158, 11, 0.08)' }}>
                                        #{i.batchId.substring(0, 6)}
                                    </span>
                                </td>
                                <td className="fw-bold text-dark">{i.totalQuantity} <span className="text-muted small">Units</span></td>
                                <td className="text-success fw-bold">+{i.soldQuantity}</td>
                                <td className={`fw-bold ${i.remainingQuantity < 5 ? 'text-danger' : 'text-dark'}`}>
                                    {i.remainingQuantity}
                                </td>
                                <td className="fw-bold text-dark">
                                    <span className="text-muted small">$</span> {i.price}
                                </td>
                                <td>
                                    <Badge bg={getInventoryStatusVariant(i.status)} className="rounded-pill px-3 py-2 border-0 shadow-none">
                                        {i.status.toUpperCase()}
                                    </Badge>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button 
                                        className="btn btn-outline-warning btn-sm rounded-pill px-3 fw-bold"
                                        onClick={() => onUpdate(i)}
                                    >
                                        Adjust <i className="bi bi-sliders ms-1"></i>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="text-center py-5">
                                    <div className="opacity-20 mb-3">
                                        <i className="bi bi-cart-x fs-1"></i>
                                    </div>
                                    <p className="fw-bold text-muted">Storefront currently offline. Awaiting shipments.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const getInventoryStatusVariant = (status) => {
    switch (status) {
        case 'In Stock': return 'success-subtle text-success';
        case 'Low Stock': return 'warning-subtle text-warning';
        case 'Out of Stock': return 'danger-subtle text-danger';
        default: return 'light text-dark';
    }
};

export default InventoryList;

