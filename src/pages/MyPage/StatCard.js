import React from "react";

const StatCard = ({ stats }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon">{stats.icon}</div>
      <div className="stat-title">{stats.title}</div>
      <div className="stat-value">
        {stats.statistics.value}
        <span className="stat-unit">{stats.statistics.unit}</span>
      </div>
    </div>
  );
};

export default StatCard;