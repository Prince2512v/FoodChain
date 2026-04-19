import React from 'react';

const ProcessorStats = ({ incomingCount, activeCount, completedCount }) => {
  return (
    <section className="proc-stats">
      <StatCard 
        icon="📥" 
        label="Pending Batches" 
        value={incomingCount} 
        color="#3b82f6" 
      />
      <StatCard 
        icon="⚙️" 
        label="Active Processing" 
        value={activeCount} 
        color="#f59e0b" 
      />
      <StatCard 
        icon="🧪" 
        label="Quality Checks" 
        value="Awaiting" 
        color="#0ea5e9" 
      />
      <StatCard 
        icon="✅" 
        label="Completed Today" 
        value={completedCount} 
        color="#10b981" 
      />
    </section>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="proc-stat-card" style={{ '--accent': color }}>
    <span className="proc-stat-card__icon">{icon}</span>
    <div>
      <p className="proc-stat-card__label">{label}</p>
      <p className="proc-stat-card__value">{value}</p>
    </div>
  </div>
);

export default ProcessorStats;
