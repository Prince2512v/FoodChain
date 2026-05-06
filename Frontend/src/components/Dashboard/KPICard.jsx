import React from 'react';

const KPICard = ({ title, value, icon, color, trend, progress = 70, onClick }) => (
    <div 
        className={`bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md h-full w-full flex flex-col ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}`}
        onClick={onClick}
    >
        {/* Soft glow background strictly tied to the color prop */}
        <div style={{
            position: 'absolute', 
            top: '-20px', 
            right: '-20px', 
            width: '100px', 
            height: '100px', 
            background: color, 
            opacity: 0.15, 
            filter: 'blur(30px)', 
            borderRadius: '50%' 
        }}></div>
        
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                style={{ backgroundColor: `${color}15`, color: color }}
            >
                <i className={`bi bi-${getIconName(icon)}`}></i>
            </div>
            
            {trend !== undefined && (
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    trend >= 0 ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'
                }`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </div>
            )}
        </div>

        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 relative z-10 break-normal whitespace-nowrap overflow-hidden text-ellipsis">
            {title}
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 m-0 tracking-tight tabular-nums relative z-10">
            {value}
        </h2>
        
        {/* Decorative Progress Bar */}
        <div className="mt-4 mt-auto">
            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: `${color}15` }}>
                <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${progress}%`, backgroundColor: color }}
                ></div>
            </div>
        </div>
    </div>
);

const getIconName = (emoji) => {
    // Map existing emojis to bootstrap icons for higher fidelity
    const mapping = {
        '🌾': 'flower1',
        '🏭': 'building-gear',
        '🚚': 'truck',
        '⚠️': 'exclamation-triangle-fill',
        '📦': 'box-seam',
        '⚙️': 'gear-fill',
        '✅': 'check-circle-fill',
        '📥': 'download',
        '🚛': 'truck-front',
    };
    return mapping[emoji] || 'activity';
};

export default KPICard;
