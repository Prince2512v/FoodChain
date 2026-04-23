import React from 'react';

const HarvestList = ({ products, onShowQR, onNavigateDetails, onInitialize, loading }) => {
  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent mb-4"></div>
            <p className="font-bold text-slate-500">Syncing with Greenhouse Node...</p>
        </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200">
        <i className="bi bi-wind text-5xl block mb-4 text-slate-200"></i>
        <p className="font-bold text-slate-500 mb-4">No harvests recorded in this sector.</p>
        <button 
          className="px-5 py-2 border border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-full text-sm font-bold transition-colors"
          onClick={onInitialize}
        >
            Initialize Sector
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full group">
            {/* Status Strip */}
            <div className={`absolute top-0 left-0 w-full h-1.5 ${getStatusGradient(product.status)}`}></div>
            
            <div className="flex justify-between items-start mb-4 pt-2">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold font-mono border border-emerald-100 shadow-sm tracking-wider">
                <i className="bi bi-hash text-emerald-400"></i>
                {product.batchId.substring(0, 8)}
              </span>
              <span className={`px-3 py-1 rounded-full text-[0.65rem] font-extrabold uppercase tracking-widest shadow-sm border ${getBadgeVariant(product.status)}`}>
                {product.status}
              </span>
            </div>
            
            <h5 className="font-extrabold text-slate-800 text-lg mb-6 flex items-center">
                {product.productName}
                <i className="bi bi-stars ml-2 text-amber-400 text-sm"></i>
            </h5>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[0.65rem] text-slate-400 mb-1 font-bold uppercase tracking-widest">Quantity</p>
                    <p className="m-0 font-bold text-slate-800 text-lg">
                        {product.quantity} <span className="text-xs text-slate-500 ml-0.5">{product.unit}</span>
                    </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[0.65rem] text-slate-400 mb-1 font-bold uppercase tracking-widest">Crop Type</p>
                    <p className="m-0 font-bold text-slate-800 text-sm">{product.cropType}</p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-6 px-1 mt-auto">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <i className="bi bi-calendar-event"></i>
                    </div>
                    <span className="text-xs font-bold text-slate-500 tracking-wide">
                        {new Date(product.harvestDate).toLocaleDateString()}
                    </span>
                </div>
                {product.blockchainTxHash && (
                    <a 
                        href={`https://sepolia.etherscan.io/tx/${product.blockchainTxHash}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md hover:bg-emerald-100 transition-colors border border-emerald-200"
                    >
                        <i className="bi bi-shield-check"></i> VERIFIED
                    </a>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <button 
                className="h-12 w-12 flex-shrink-0 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-xl flex items-center justify-center transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 group-hover:border-emerald-200" 
                onClick={() => onShowQR(product.batchId)}
                title="Identity Portal"
              >
                <i className="bi bi-qr-code-scan text-lg"></i>
              </button>
              <button 
                className="flex-1 h-12 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                onClick={() => onNavigateDetails(product.id)}
              >
                Track Journey <i className="bi bi-arrow-right mt-0.5"></i>
              </button>
            </div>
        </div>
      ))}
    </div>
  );
};

const getBadgeVariant = (status) => {
    switch (status) {
        case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'Processing': return 'bg-sky-100 text-sky-700 border-sky-200';
        case 'Created': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
};

const getStatusGradient = (status) => {
    switch (status) {
        case 'Completed': return 'bg-gradient-to-r from-emerald-400 to-emerald-600';
        case 'Processing': return 'bg-gradient-to-r from-sky-400 to-sky-600';
        case 'Created': return 'bg-gradient-to-r from-amber-400 to-amber-600';
        case 'Rejected': return 'bg-gradient-to-r from-red-400 to-red-600';
        default: return 'bg-gradient-to-r from-slate-300 to-slate-400';
    }
};

export default HarvestList;
