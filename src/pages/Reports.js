import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  LabelList 
} from 'recharts';
import "../styles/Reports.css";

const Reports = ({ user }) => {
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState("March");
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Generate years from 2019 to current year
  const years = [];
  for (let y = 2019; y <= currentYear; y++) {
    years.push(y);
  }

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // REAL-TIME READY DATA: Initializing all days with 0 clients
  // When you have a database, you will replace this with your fetched data
  const data = Array.from({ length: 31 }, (_, i) => ({
    day: i + 1,
    clients: 0 
  }));

  // Custom Label Logic: Only renders the number if value > 0 and sets color to #718096
  const renderCustomizedLabel = (props) => {
    const { x, y, width, value } = props;
    if (value === 0) return null; 

    return (
      <text 
        x={x + width / 2} 
        y={y - 10} 
        fill="#718096" 
        textAnchor="middle" 
        dominantBaseline="middle"
        style={{ fontSize: '12px', fontWeight: '600' }}
      >
        {value}
      </text>
    );
  };

  return (
    <div className="reports-page">
      <div className="reports-header-container">
        <h1 className="reports-title">Daily Report</h1>
        
        <div className="reports-filters">
          <div className="reports-select-group">
            <span>Select Month: </span>
            <select 
              className="month-dropdown" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div className="reports-select-group">
            <span>Select Year: </span>
            <select 
              className="month-dropdown" 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="reports-main-card shadow-glow">
        <div className="reports-grid-layout">
          
          {/* Officer Profile Sidebar */}
          <div className="officer-summary">
            <div className="officer-avatar-wrapper">
              {user.profilePic ? (
                <img src={user.profilePic} alt="Officer" />
              ) : (
                <div className="avatar-placeholder">?</div>
              )}
            </div>
            <h3 className="officer-name">
              {user.lastName}, {user.firstName} {user.middleInitial ? `${user.middleInitial}.` : ""}
            </h3>
            <p className="officer-role">SR. LEO</p>
            <p className="officer-email-text">{user.email}</p>
          </div>

          {/* Graph Section */}
          <div className="graph-section-wrapper">
            <div className="graph-actions">
              <button className="download-report-btn">
                <span>↓</span> Download Weekly Report
              </button>
            </div>
            
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={data} 
                margin={{ top: 30, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke="#d1d5db" 
                />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#ff0000', fontSize: 10, fontWeight: 'bold' }} 
                  interval={0} 
                />
                <YAxis 
                  domain={[1, 22]} 
                  ticks={[1, 3, 5, 7, 9, 11, 13, 15, 17, 20]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#333', fontSize: 12, fontWeight: '500' }}
                  width={40}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                
                <Bar dataKey="clients" radius={[15, 15, 15, 15]} barSize={14}>
                  <LabelList 
                    dataKey="clients" 
                    content={renderCustomizedLabel} 
                  />
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#030a49" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;