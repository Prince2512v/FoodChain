import React from 'react';

const HarvestStats = ({ products }) => {
  const stats = {
    total: products.length,
    created: products.filter(p => p.status === 'Created').length,
    processing: products.filter(p => ['Processing', 'Packaged', 'Completed', 'In Transit'].includes(p.status)).length,
    completed: products.filter(p => ['Delivered', 'Available for Sale', 'In Stock'].includes(p.status)).length
  };

  return (
    <section className="farmer-stats">
      <StatCard 
        icon="🌾" 
        label="Total Harvests" 
        value={stats.total} 
        color="#10b981" 
      />
      <StatCard 
        icon="⏳" 
        label="In Queue" 
        value={stats.created} 
        color="#f59e0b" 
      />
      <StatCard 
        icon="⚙️" 
        label="Processing" 
        value={stats.processing} 
        color="#3b82f6" 
      />
      <StatCard 
        icon="✅" 
        label="Completed" 
        value={stats.completed} 
        color="#059669" 
      />
    </section>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="farmer-stat-card" style={{ '--accent': color }}>
    <span className="farmer-stat-card__icon">{icon}</span>
    <div>
      <p className="farmer-stat-card__label">{label}</p>
      <p className="farmer-stat-card__value">{value}</p>
    </div>
  </div>
);

export default HarvestStats;
