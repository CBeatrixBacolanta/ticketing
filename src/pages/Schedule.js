import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Schedule.css';
import ActivityLog from './ActivityLog';
import { FaChevronLeft, FaChevronRight, FaClock, FaChevronDown } from 'react-icons/fa';

const Schedule = () => {
  const navigate = useNavigate();
  const [showLog, setShowLog] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 5)); 
  const [hearingPage, setHearingPage] = useState(0);
  const itemsPerPage = 2; 
  const [allHearings, setAllHearings] = useState([]);
  const [officerList, setOfficerList] = useState([]);

  useEffect(() => {
    // 1. Load Hearings
    const savedHearings = JSON.parse(localStorage.getItem('hearings')) || [];
    setAllHearings(savedHearings);

    // 2. Load Officers registered by Admin
    const allUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    
    // Filter only those with role 'Officer'
    const registeredOfficers = allUsers
      .filter(user => user.role === 'Officer')
      .map(user => user.fullName);

    // If Admin hasn't added anyone yet, use fallback for testing
    if (registeredOfficers.length > 0) {
      setOfficerList(registeredOfficers);
    } else {
      setOfficerList([
        "APARECIO, Harold D.",
        "CALING, Mhardy Mae V.",
        "CANO, Paolo Miguel P.",
        "BUSANGILAN, Rommyl Rey C.",
        "CASIÑO, Roy S.",
        "TALON, Sittie Nashiba D."
      ]);
    }
  }, []);

  const [formData, setFormData] = useState({
    purpose: '', requestingParty: '', respondingParty: '',
    selectedMonth: 'March', selectedDay: '5',
    availableTime: '9:30 am to 10:00 am', laborViolation: 'Select',
    otherIssues: '', officer: ''
  });

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = months[month];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startingOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const hearingsForSelectedMonth = allHearings
    .filter(h => h.date && h.date.toUpperCase().includes(monthName.substring(0, 3).toUpperCase()))
    .sort((a, b) => parseInt(a.day) - parseInt(b.day));

  const totalPages = Math.ceil(hearingsForSelectedMonth.length / itemsPerPage) || 1;
  const currentRecentPage = hearingsForSelectedMonth.slice(
    hearingPage * itemsPerPage, 
    (hearingPage + 1) * itemsPerPage
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.purpose || !formData.requestingParty || !formData.officer) {
      alert("Please fill in the Purpose, Requesting Party, and Hearing Officer!");
      return;
    }
    const newHearing = {
      id: Date.now(),
      title: formData.purpose,
      time: formData.availableTime,
      day: formData.selectedDay,
      officer: formData.officer,
      date: `${formData.selectedMonth.substring(0, 3).toUpperCase()} ${formData.selectedDay}`,
      dow: new Date(2026, months.indexOf(formData.selectedMonth), formData.selectedDay)
            .toLocaleDateString('en-US', { weekday: 'long' })
    };
    const updated = [newHearing, ...allHearings];
    localStorage.setItem('hearings', JSON.stringify(updated));
    setAllHearings(updated);
    alert("Schedule Created Successfully!");
    setFormData(prev => ({ ...prev, purpose: '', otherIssues: '', officer: '' }));
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(year, month + offset, 1));
    setHearingPage(0);
  };

  if (showLog) return <ActivityLog onBack={() => setShowLog(false)} onRemark={() => navigate('/remarks')} />;

  return (
    <div className="schedule-page-wrapper">
      <div className="red-bg-accent"></div>
      <div className="schedule-container">

        {/* LEFT COLUMN: CREATE SCHEDULE FORM */}
        <div className="create-card">
          <div className="title-with-underline">
            <h2 className="section-title">Create New Schedule</h2>
          </div>

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

          <div className="row-group">
            <div className="input-group">
              <label>Available day:</label>
              <div className="date-dropdown-row">
                <div className="select-wrapper">
                  <select name="selectedDay" value={formData.selectedDay} onChange={handleInputChange} className="sched-input">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <FaChevronDown className="select-icon" />
                </div>
                <div className="select-wrapper">
                  <select name="selectedMonth" value={formData.selectedMonth} onChange={(e) => {
                    handleInputChange(e);
                    setCurrentDate(new Date(year, months.indexOf(e.target.value), 1));
                    setHearingPage(0);
                  }} className="sched-input">
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <FaChevronDown className="select-icon" />
                </div>
              </div>
            </div>
            <div className="input-group">
              <label>Available time:</label>
              <div className="select-wrapper">
                <select name="availableTime" value={formData.availableTime} onChange={handleInputChange} className="sched-input">
                 <option>Select</option>
                  <option>8:30 am to 9:00 am</option>
                  <option>9:00 am to 9:30 am</option>
                  <option>9:30 am to 10:00 am</option>
                  <option>10:00 am to 10:30 am</option>
                  <option>10:30 am to 11:00 am</option>
                  <option>11:00 am to 11:30 am</option>
                  <option>11:30 am to 12:00 pm</option>
                  <option>1:00 pm to 1:30 pm</option>
                  <option>1:30 pm to 2:00 pm</option>
                  <option>2:00 pm to 2:30 pm</option>
                  <option>2:30 pm to 3:00 pm</option>
                  <option>3:00 pm to 3:30 pm</option>
                  <option>3:30 pm to 4:00 pm</option>
                  <option>4:00 pm to 4:30 pm</option>
                  <option>4:30 pm to 5:00 pm</option>
                </select>
                <FaChevronDown className="select-icon" />
              </div>
            </div>
          </div>

          <label className="group-label">Claims/Issues</label>
          <div className="row-group">
            <div className="input-group">
              <label>Labor Standards Violations</label>
              <div className="select-wrapper">
                <select name="laborViolation" value={formData.laborViolation} onChange={handleInputChange} className="sched-input">
                  <option>Select</option>
                  <option>Minimum Wage</option>
                  <option>COLA</option>
                  <option>Night Shift Differential</option>
                  <option>Overtime Pay</option>
                  <option>Holiday Pay</option>
                  <option>13th Month Pay</option>
                  <option>Service Charge</option>
                  <option>Premium Pay for Rest Day</option>
                  <option>Premium Pay for Special Day</option>
                  <option>Service Incentive Leave</option>
                  <option>Maternity Leave</option>
                  <option>Paternity Leave</option>
                  <option>Parental Leave for Solo Parent</option>
                  <option>Leave for Victims of VAWC</option>
                  <option>Special Leave for Women</option>
                </select>
                <FaChevronDown className="select-icon" />
              </div>
            </div>
            <div className="input-group">
              <label>Other Issues:</label>
              <input type="text" name="otherIssues" value={formData.otherIssues} onChange={handleInputChange} className="sched-input" placeholder="Type here" />
            </div>
          </div>

          <div className="input-group" style={{ marginTop: '15px' }}>
            <label>Available Hearing Officer</label>
            <div className="select-wrapper">
              <select 
                name="officer" 
                value={formData.officer} 
                onChange={handleInputChange} 
                className="sched-input"
              >
                <option value="">Select Officer Name</option>
                {officerList.map((name, index) => (
                  <option key={index} value={name}>{name}</option>
                ))}
              </select>
              <FaChevronDown className="select-icon" />
            </div>
          </div>

          <button className="create-btn" onClick={handleSubmit}>Create Schedule</button>
        </div>

        {/* RIGHT COLUMN: CALENDAR & RECENT HEARINGS */}
        <div className="calendar-card fixed-calendar-card">
          <div className="legend-bar">
            <span><span className="dot available-dot"></span> Available</span>
            <span><span className="dot limited-dot"></span> Limited</span>
            <span><span className="dot booked-dot"></span> Booked</span>
          </div>

          <div className="calendar-main-section">
            <div className="calendar-header">
              <FaChevronLeft onClick={() => changeMonth(-1)} style={{ cursor: 'pointer' }} />
              <h3>{monthName} {year}</h3>
              <FaChevronRight onClick={() => changeMonth(1)} style={{ cursor: 'pointer' }} />
            </div>
            <div className="calendar-grid">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} className="dow-label">{d}</div>)}
              {Array.from({ length: startingOffset }).map((_, i) => <div key={i} className="empty-day"></div>)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                <div key={day} className="day-num">{day}</div>
              ))}
            </div>
          </div>

          <div className="recent-section">
            <div className="recent-header">
              <div className="title-with-underline">
                <h4 className="section-title small">Recent Hearings</h4>
              </div>
              
              {hearingsForSelectedMonth.length > itemsPerPage && (
                <div className="pagination-controls">
                  <FaChevronLeft onClick={() => setHearingPage(Math.max(0, hearingPage - 1))} className={hearingPage === 0 ? 'disabled' : ''} />
                  <div className="pagination-dots">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <span key={i} className={`dot-item ${hearingPage === i ? 'active' : ''}`} onClick={() => setHearingPage(i)} />
                    ))}
                  </div>
                  <FaChevronRight onClick={() => setHearingPage(Math.min(totalPages - 1, hearingPage + 1))} className={hearingPage === totalPages - 1 ? 'disabled' : ''} />
                </div>
              )}
            </div>

            <div className="recent-hearings-list">
              {currentRecentPage.length > 0 ? (
                currentRecentPage.map((h) => (
                  <div key={h.id} className="recent-hearing-card-new">
                    <div className="rh-date-col">
                      <span className="rh-day-name">{h.dow?.substring(0, 3)}</span>
                      <span className="rh-day-number">{h.day}</span>
                    </div>
                    <div className="rh-content-col">
                      <div className="rh-main-info">
                        <h4>{h.title}</h4>
                        <div className="rh-details-row">
                          <span className="rh-time-text">{h.time}</span>
                          <span className="rh-duration-badge"><FaClock className="clock-icon-small" /> 30 min</span>
                        </div>
                      </div>
                      <button className="rh-view-btn" onClick={() => setShowLog(true)}>View</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-hearings-placeholder">
                  <p className="no-hearings-msg">No recent hearings</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;