import React from 'react';

/**
 * TraceabilityTimeline — Renders the full supply chain journey as a vertical timeline.
 * Expects `history` object with: Product, Processing, QualityCheck, Packaging, Shipments, Receipt, etc.
 * Uses PascalCase keys matching the ConsumerController backend serialization.
 */
const TraceabilityTimeline = ({ history }) => {
    if (!history) return null;

    // Support both PascalCase (from ConsumerController) and camelCase (from DistributorController)
    const product    = history.Product    || history.product;
    const processing = history.Processing || history.processing;
    const quality    = history.QualityCheck || history.qualityCheck;
    const packaging  = history.Packaging  || history.packaging;
    const shipments  = history.Shipments  || history.shipments;
    const receipt    = history.Receipt    || history.receipt;
    const locations  = history.LocationLogs     || history.locationLogs || [];
    const conditions = history.StorageConditions || history.storageConditions || [];

    // Build timeline events from all available data points
    const events = [];

    if (product) {
        events.push({
            icon: '🌱', title: 'Harvest & Origin',
            subtitle: `Registered by Farmer: ${product.farmer?.name || 'Verified Producer'}`,
            date: product.timestamp || product.harvestDate,
            details: `Located at: ${product.address || 'N/A'}`,
            colorClass: 'text-emerald-600',
            bgClass: 'bg-emerald-500',
            ringClass: 'ring-emerald-500/30'
        });
    }

    if (processing) {
        events.push({
            icon: '⚙️', title: 'Processing Started',
            subtitle: `Type: ${processing.processingType || 'N/A'}`,
            date: processing.processingDate,
            details: processing.conditions ? `Conditions: ${processing.conditions}` : '',
            colorClass: 'text-indigo-600',
            bgClass: 'bg-indigo-500',
            ringClass: 'ring-indigo-500/30'
        });
    }

    if (quality) {
        events.push({
            icon: quality.passed ? '✅' : '⚠️',
            title: quality.passed ? 'Quality Check Passed' : 'Quality Check Failed',
            subtitle: quality.grade ? `Grade: ${quality.grade}` : '',
            date: quality.checkDate,
            details: quality.notes || quality.remarks || '',
            colorClass: quality.passed ? 'text-emerald-600' : 'text-red-600',
            bgClass: quality.passed ? 'bg-emerald-500' : 'bg-red-500',
            ringClass: quality.passed ? 'ring-emerald-500/30' : 'ring-red-500/30'
        });
    }

    if (packaging) {
        events.push({
            icon: '📦', title: 'Packaged & Sealed',
            subtitle: `Type: ${packaging.packageType || 'Standard'}`,
            date: packaging.packagedDate || packaging.expiryDate,
            details: packaging.expiryDate ? `Expiry: ${new Date(packaging.expiryDate).toLocaleDateString()}` : '',
            colorClass: 'text-amber-600',
            bgClass: 'bg-amber-500',
            ringClass: 'ring-amber-500/30'
        });
    }

    // Add shipment events
    if (shipments && (Array.isArray(shipments) ? shipments.length > 0 : shipments)) {
        const shipList = Array.isArray(shipments) ? shipments : [shipments];
        shipList.forEach(sh => {
            events.push({
                icon: '🚛', title: 'Shipment Accepted',
                subtitle: sh.vehicleNumber ? `Vehicle: ${sh.vehicleNumber}` : 'In Transit',
                date: sh.createdAt,
                details: sh.driverName ? `Driver: ${sh.driverName}` : '',
                colorClass: 'text-sky-600',
                bgClass: 'bg-sky-500',
                ringClass: 'ring-sky-500/30'
            });
            if (sh.dispatchDate) {
                events.push({
                    icon: '📤', title: 'Dispatched',
                    subtitle: 'Product left warehouse',
                    date: sh.dispatchDate,
                    colorClass: 'text-sky-600',
                    bgClass: 'bg-sky-500',
                    ringClass: 'ring-sky-500/30'
                });
            }
            if (sh.deliveryDate) {
                events.push({
                    icon: '📬', title: 'Delivered to Store',
                    subtitle: 'Arrived at retail destination',
                    date: sh.deliveryDate,
                    colorClass: 'text-emerald-600',
                    bgClass: 'bg-emerald-500',
                    ringClass: 'ring-emerald-500/30'
                });
            }
        });
    }

    // Location transit logs
    locations.forEach(log => {
        events.push({
            icon: '📍', title: 'Location Update',
            subtitle: log.locationName || 'Transit Point',
            date: log.timestamp,
            details: `${log.latitude?.toFixed(4) || '?'}, ${log.longitude?.toFixed(4) || '?'}`,
            colorClass: 'text-violet-600',
            bgClass: 'bg-violet-500',
            ringClass: 'ring-violet-500/30'
        });
    });

    // Storage/environment conditions
    conditions.forEach(cond => {
        events.push({
            icon: cond.thresholdBreached ? '🚨' : '🌡️',
            title: cond.thresholdBreached ? 'Storage Alert!' : 'Storage Condition',
            subtitle: cond.storageType || 'Environment Log',
            date: cond.timestamp,
            details: `Temp: ${cond.temperature}°C | Humidity: ${cond.humidity}%`,
            colorClass: cond.thresholdBreached ? 'text-red-600' : 'text-cyan-600',
            bgClass: cond.thresholdBreached ? 'bg-red-500' : 'bg-cyan-500',
            ringClass: cond.thresholdBreached ? 'ring-red-500/30' : 'ring-cyan-500/30'
        });
    });

    if (receipt) {
        events.push({
            icon: '🏪', title: receipt.conditionStatus === 'Good' ? 'Received at Retail' : 'Received - Issues Noted',
            subtitle: `Condition: ${receipt.conditionStatus || 'N/A'}`,
            date: receipt.receivedDate,
            details: receipt.remarks || '',
            colorClass: receipt.conditionStatus === 'Good' ? 'text-emerald-600' : 'text-amber-600',
            bgClass: receipt.conditionStatus === 'Good' ? 'bg-emerald-500' : 'bg-amber-500',
            ringClass: receipt.conditionStatus === 'Good' ? 'ring-emerald-500/30' : 'ring-amber-500/30'
        });
    }

    // Sort by date
    events.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

    if (events.length === 0) {
        return (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-slate-200 text-center shadow-sm">
                <i className="bi bi-clock-history text-5xl text-slate-300 block mb-4"></i>
                <p className="text-slate-500 font-bold">No journey events recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-8">
                <h5 className="font-bold text-lg text-slate-900 flex items-center">
                    <i className="bi bi-clock-history mr-3 text-indigo-500 text-xl"></i>
                    Supply Chain Journey
                </h5>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100">
                    {events.length} Events
                </span>
            </div>

            <div className="relative pl-6">
                {events.map((event, idx) => (
                    <div key={idx} className="relative pb-8 last:pb-0 group">
                        
                        {/* Vertical line connector */}
                        {idx < events.length - 1 && (
                            <div className="absolute left-[-20px] top-7 bottom-[-4px] w-0.5 bg-gradient-to-b from-slate-200 to-slate-100 group-hover:from-slate-300 transition-colors"></div>
                        )}
                        
                        {/* Dot marker */}
                        <div className={`absolute left-[calc(-20px-0.5rem)] top-1 w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] border-2 border-white ring-4 ${event.ringClass} ${event.bgClass} z-10 transition-all duration-300 group-hover:scale-110`}>
                            <span>{event.icon}</span>
                        </div>
                        
                        {/* Content card */}
                        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 transition-all duration-300 group-hover:bg-white group-hover:-translate-y-1 group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] group-hover:border-slate-200 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-1 gap-4">
                                <h6 className="font-bold text-[0.95rem] text-slate-800 leading-tight">
                                    {event.title}
                                </h6>
                                {event.date && (
                                    <span className="text-[0.7rem] font-semibold text-slate-400 whitespace-nowrap bg-white px-2 py-0.5 rounded-md border border-slate-100 shadow-sm">
                                        {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                            
                            {event.subtitle && (
                                <p className={`text-xs font-bold ${event.colorClass} mt-1`}>
                                    {event.subtitle}
                                </p>
                            )}
                            
                            {event.details && (
                                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                    {event.details}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TraceabilityTimeline;
