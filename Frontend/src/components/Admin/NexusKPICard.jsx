import React from 'react';

const NexusKPICard = ({ title, value, icon, color, trend, progress, onClick }) => {
    return (
        <div
            className={`admin-kpi-card ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}`}
            style={{ '--kpi-color': color }}
            onClick={onClick}
        >
            <div className="admin-kpi-glow"></div>

            <div className="flex justify-between items-start mb-4">
                <div className="admin-kpi-icon">
                    <i className={`bi bi-${icon}`}></i>
                </div>
                {trend !== undefined && (
                    <div className={`admin-kpi-trend ${trend >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                        {trend >= 0 ? <i className="bi bi-arrow-up-right"></i> : <i className="bi bi-arrow-down-right"></i>}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>

            <div className="admin-kpi-label">{title}</div>
            <div className="admin-kpi-value">{value}</div>

            {progress !== undefined && (
                <div className="admin-kpi-bar">
                    <div className="admin-kpi-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
            )}
        </div>
    );
};

export default NexusKPICard;
