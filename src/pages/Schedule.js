import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Schedule.css';
import ActivityLog from './ActivityLog';
import { FaChevronLeft, FaChevronRight, FaClock, FaChevronDown } from 'react-icons/fa';

const Schedule = () => {
  const navigate = useNavigate();
  const [showLog, setShowLog] = useState(false);
  
  // State for calendar display navigation
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1));
  
  // Pagination State for Recent Hearings
  const [hearingPage, setHearingPage] = useState(0);
  const itemsPerPage = 3;

  // Form State
  const [formData, setFormData] = useState({
    purpose: '',
    requestingParty: '',
    respondingParty: '',
    selectedMonth: 'February',
    selectedDay: '',
    availableTime: 'Select Time Slot',
    laborViolation: 'Select Issue',
    otherIssues: '',
    officer: '' 
  });

  // Mock Data - Change to [] to see the "Empty State"
  const allHearings = [
    { id: 1, day: '10', dow: 'Tue', title: 'Hearing Review', time: '09:00 am' },
    { id: 2, day: '11', dow: 'Wed', title: 'Case Setup', time: '10:30 am' },
    { id: 3, day: '12', dow: 'Thu', title: 'Labor Dispute', time: '01:00 pm' },
    { id: 4, day: '15', dow: 'Sun', title: 'Follow-up', time: '02:00 pm' },
  ];

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = months[month];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startingOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // Pagination Logic
  const totalPages = Math.ceil(allHearings.length / itemsPerPage) || 1;
  const currentHearings = allHearings.slice(hearingPage * itemsPerPage, (hearingPage + 1) * itemsPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    const idx = months.indexOf(newMonth);
    setCurrentDate(new Date(year, idx, 1));
    setFormData(prev => ({ ...prev, selectedMonth: newMonth, selectedDay: '' }));
  };

  const getDayStatus = (day) => {
    const booked = [2, 3, 10, 16, 19, 26];
    const available = [5, 17, 18, 23, 24];
    const limited = [12, 25];
    if (booked.includes(day)) return "booked";
    if (available.includes(day)) return "available";
    if (limited.includes(day)) return "limited";
    return "";
  };

  if (showLog) {
    return <ActivityLog onBack={() => setShowLog(false)} onRemark={(id) => navigate('/remarks')} />;
  }

  return (
    <div className="schedule-page-wrapper">
      <div className="red-bg-accent"></div>

      <div className="schedule-container">
        {/* LEFT COLUMN: FORM */}
        <div className="create-card">
          <h2 className="section-title">Create New Schedule</h2>
          
          <div className="input-group">
            <label>Purpose:</label>
            <input type="text" name="purpose" value={formData.purpose} onChange={handleInputChange} className="sched-input" placeholder="Reason" />
          </div>

          <div className="row-group">
            <div className="input-group">
              <label>Requesting Party:</label>
              <input type="text" name="requestingParty" value={formData.requestingParty} onChange={handleInputChange} className="sched-input" placeholder="Name" />
            </div>
            <div className="input-group">
              <label>Responding Party:</label>
              <input type="text" name="respondingParty" value={formData.respondingParty} onChange={handleInputChange} className="sched-input" placeholder="Name" />
            </div>
          </div>

          <div className="input-group">
            <label>Available Month & Day:</label>
            <div className="date-dropdown-row">
              <div className="select-wrapper flex-1">
                <select name="selectedDay" value={formData.selectedDay} onChange={handleInputChange} className="sched-input birth-style">
                  <option value="">DD</option>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d < 10 ? `0${d}` : d}</option>
                  ))}
                </select>
                <FaChevronDown className="select-icon" />
              </div>
              <div className="select-wrapper flex-1">
                <select name="selectedMonth" value={formData.selectedMonth} onChange={handleMonthChange} className="sched-input birth-style">
                  {months.map(m => <option key={m} value={m}>{m.substring(0, 3)}</option>)}
                </select>
                <FaChevronDown className="select-icon" />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Available time:</label>
            <div className="select-wrapper">
              <select name="availableTime" value={formData.availableTime} onChange={handleInputChange} className="sched-input">
                <option>Select Time Slot</option>
                <option>8:30 am to 9:00 am</option>
                <option>9:00 am to 9:30 am</option>
              </select>
              <FaChevronDown className="select-icon" />
            </div>
          </div>

          <label className="group-label">Claims/Issues</label>
          <div className="row-group">
            <div className="input-group flex-1">
              <label className="sub-label">Labor Standards</label>
              <div className="select-wrapper">
                <select name="laborViolation" value={formData.laborViolation} onChange={handleInputChange} className="sched-input">
                  <option>Select Issue</option>
                  <option>Minimum Wage</option>
                </select>
                <FaChevronDown className="select-icon" />
              </div>
            </div>
            <div className="input-group flex-1">
              <label className="sub-label">Other Issues:</label>
              <input type="text" name="otherIssues" value={formData.otherIssues} onChange={handleInputChange} className="sched-input" placeholder="Type here" />
            </div>
          </div>

          <div className="input-group">
            <label className="sub-label">Hearing Officer</label>
            <input type="text" name="officer" value={formData.officer} onChange={handleInputChange} className="sched-input" placeholder="Enter Officer Name" />
          </div>

          <button className="create-btn" onClick={() => alert("Schedule Created!")}>Create Schedule</button>
        </div>

        {/* RIGHT COLUMN: CALENDAR DISPLAY */}
        <div className="calendar-card">
          <div className="legend-bar">
            <span><span className="dot available-dot"></span> Available</span>
            <span><span className="dot limited-dot"></span> Limited</span>
            <span><span className="dot booked-dot"></span> Booked</span>
          </div>

          <div className="calendar-main-section">
            <div className="calendar-header">
              <FaChevronLeft className="nav-arrow" onClick={() => setCurrentDate(new Date(year, month - 1, 1))} />
              <h3>{monthName} {year}</h3>
              <FaChevronRight className="nav-arrow" onClick={() => setCurrentDate(new Date(year, month + 1, 1))} />
            </div>

            <div className="calendar-grid-container">
              <div className="calendar-grid">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} className="day-name">{d}</div>)}
                {Array.from({ length: startingOffset }).map((_, i) => <div key={`empty-${i}`} className="day-num empty"></div>)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                  <div key={day} className={`day-num display-only ${getDayStatus(day)}`}>{day}</div>
                ))}
              </div>
            </div>
          </div>

          {/* PAGINATED RECENT HEARINGS */}
          <div className="recent-section">
            <div className="recent-header">
              <h2 className="section-title small">Recent Hearings</h2>
              {allHearings.length > 0 && (
                <div className="pagination-controls">
                  <FaChevronLeft className={`pag-arrow ${hearingPage === 0 ? 'disabled' : ''}`} onClick={() => hearingPage > 0 && setHearingPage(hearingPage - 1)} />
                  <div className="pagination-dots">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <span key={i} className={`dot-item ${hearingPage === i ? 'active' : ''}`} />
                    ))}
                  </div>
                  <FaChevronRight className={`pag-arrow ${hearingPage === totalPages - 1 ? 'disabled' : ''}`} onClick={() => hearingPage < totalPages - 1 && setHearingPage(hearingPage + 1)} />
                </div>
              )}
            </div>

            <div className="hearings-list">
              {allHearings.length > 0 ? (
                currentHearings.map((h) => (
                  <div key={h.id} className="hearing-item">
                    <div className="hearing-date-box">{h.dow}<br/><span>{h.day}</span></div>
                    <div className="hearing-info">
                      <div className="hearing-title">{h.title}</div>
                      <div className="hearing-time"><FaClock /> {h.time}</div>
                    </div>
                    <button className="view-btn" onClick={() => setShowLog(true)}>View</button>
                  </div>
                ))
              ) : (
                [1, 2, 3].map((i) => (
                  <div key={i} className="hearing-item empty-state">
                    <div className="hearing-date-box">--<br/><span>00</span></div>
                    <div className="hearing-info">
                      <div className="hearing-title color-muted">No Recent Hearings</div>
                      <div className="hearing-time color-muted"><FaClock /> --:--</div>
                    </div>
                    <button className="view-btn disabled" disabled>View</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;