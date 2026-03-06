import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Schedule.css';
import ActivityLog from './ActivityLog';
import { FaChevronLeft, FaChevronRight, FaHistory } from 'react-icons/fa';

// 1. Import Toastify
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Schedule = () => {
  const navigate = useNavigate();
  const [showLog, setShowLog] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 6)); 
  const [hearingPage, setHearingPage] = useState(0);
  const itemsPerPage = 2;
  const [allHearings, setAllHearings] = useState([]);
  const [officerList, setOfficerList] = useState([]);
  
  const [editingId, setEditingId] = useState(null);
  const [startTime, setStartTime] = useState("09:30");
  const [endTime, setEndTime] = useState("10:00");

  const [formData, setFormData] = useState({
    purpose: '', requestingParty: '', respondingParty: '',
    selectedMonth: 'March', selectedDay: '6',
    laborViolation: 'Select',
    otherIssues: '', officer: ''
  });

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  useEffect(() => {
    const loadData = () => {
      const savedHearings = JSON.parse(localStorage.getItem('hearings')) || [];
      setAllHearings(savedHearings);

      const allUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
      const registeredOfficers = allUsers
        .filter(user => user.role === 'Officer')
        .map(user => user.fullName);

      setOfficerList(registeredOfficers.length > 0 ? registeredOfficers : [
        "APARECIO, Harold D.", "CALING, Mhardy Mae V.", "CANO, Paolo Miguel P.",
        "BUSANGILAN, Rommyl Rey C.", "CASIÑO, Roy S.", "TALON, Sittie Nashiba D."
      ]);
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const month = currentDate.getMonth();
  const monthName = months[month];
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startingOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // Helper to calculate minutes between two times
  const calculateDuration = (timeStr) => {
    if (!timeStr || !timeStr.includes('to')) return 0;
    
    const parseTime = (str) => {
      const [time, modifier] = str.trim().split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'pm' && hours !== 12) hours += 12;
      if (modifier === 'am' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const [start, end] = timeStr.split('to');
    return parseTime(end) - parseTime(start);
  };

  // --- UPDATED CAPACITY LOGIC ---
  const getDayStatusStyle = (dayNum) => {
    const dateObj = new Date(year, month, dayNum);
    const dayOfWeek = dateObj.getDay();

    // 1. Weekends: Always Solid Black
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { color: '#000000', fontWeight: '700' }; 
    }

    // 2. Capacity Calculation (8am - 5pm = 540 mins)
    const hearingsOnThisDay = allHearings.filter(h => 
      h.date && 
      h.date.toUpperCase().includes(monthName.substring(0, 3).toUpperCase()) &&
      parseInt(h.day) === dayNum &&
      h.status !== 'Done'
    );

    const totalBookedMinutes = hearingsOnThisDay.reduce((acc, h) => acc + calculateDuration(h.time), 0);
    const fullCapacity = 540; 

    if (totalBookedMinutes >= fullCapacity) return { color: '#e63946', fontWeight: 'bold' }; // Red
    if (totalBookedMinutes >= 270) return { color: '#1d3557', fontWeight: 'bold' }; // Blue (Half Day+)
    if (totalBookedMinutes > 0) return { color: '#4CAF50', fontWeight: 'bold' };  // Green
    
    return { color: 'inherit' }; 
  };

  const pendingHearingsForMonth = allHearings
    .filter(h => 
      h.date && 
      h.date.toUpperCase().includes(monthName.substring(0, 3).toUpperCase()) &&
      h.status !== 'Done'
    )
    .sort((a, b) => {
      const dayA = parseInt(a.day);
      const dayB = parseInt(b.day);
      if (dayA !== dayB) return dayA - dayB;

      const getTimeValue = (timeStr) => {
        if (!timeStr) return 0;
        const startPart = timeStr.split('to')[0].trim().toLowerCase();
        let [time, modifier] = startPart.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'pm' && hours !== 12) hours += 12;
        if (modifier === 'am' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };
      return getTimeValue(a.time) - getTimeValue(b.time);
    });

  const totalRecentPages = Math.ceil(pendingHearingsForMonth.length / itemsPerPage);

  useEffect(() => {
    if (hearingPage >= totalRecentPages && totalRecentPages > 0) {
      setHearingPage(0);
    }
  }, [totalRecentPages, hearingPage]);

  const currentRecentPageItems = pendingHearingsForMonth.slice(
    hearingPage * itemsPerPage, 
    (hearingPage + 1) * itemsPerPage
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatTimeToAmPm = (timeStr) => {
    if (!timeStr) return "";
    let [hours, minutes] = timeStr.split(':');
    hours = parseInt(hours);
    const suffix = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${suffix}`;
  };

  const handleSubmit = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateObj = new Date(2026, months.indexOf(formData.selectedMonth), parseInt(formData.selectedDay));

    if (selectedDateObj < today) {
      toast.error(`Invalid Date! Today is March 6, 2026.`, { theme: "colored" });
      return;
    }

    if (!formData.purpose || !formData.requestingParty || !formData.officer) {
      toast.warn("Incomplete Data!");
      return;
    }

    const combinedTime = `${formatTimeToAmPm(startTime)} to ${formatTimeToAmPm(endTime)}`;
    
    const hearingData = {
      id: editingId || Date.now(),
      createdAt: new Date().toISOString(), 
      title: formData.purpose,
      time: combinedTime,
      day: formData.selectedDay,
      officer: formData.officer,
      requestingParty: formData.requestingParty,
      respondingParty: formData.respondingParty,
      laborViolation: formData.laborViolation,
      otherIssues: formData.otherIssues,
      status: editingId ? (allHearings.find(h => h.id === editingId)?.status || "Scheduled") : "Scheduled", 
      date: `${formData.selectedMonth.substring(0, 3).toUpperCase()} ${formData.selectedDay}`,
      dow: selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' })
    };
    
    const filtered = editingId ? allHearings.filter(h => h.id !== editingId) : allHearings;
    const updated = [...filtered, hearingData];

    localStorage.setItem('hearings', JSON.stringify(updated));
    setAllHearings(updated);
    setEditingId(null);
    setHearingPage(0);
    
    toast.success(editingId ? "Schedule Updated!" : "Schedule Created!", { theme: "colored" });
    
    setFormData({
      purpose: '', requestingParty: '', respondingParty: '',
      selectedMonth: 'March', selectedDay: '6',
      laborViolation: 'Select', otherIssues: '', officer: ''
    });
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(year, month + offset, 1));
    setHearingPage(0);
  };

  if (showLog) return <ActivityLog onBack={() => setShowLog(false)} onRemark={(id) => navigate(`/remarks/${id}`)} onEdit={(h) => { setEditingId(h.id); setShowLog(false); }} />;

  return (
    <div className="schedule-page-wrapper">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="red-bg-accent"></div>
      <div className="schedule-container">
        {/* Create Card */}
        <div className="create-card">
          <div className="title-with-underline">
            <h2 className="section-title">{editingId ? "Update Schedule" : "Create New Schedule"}</h2>
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
          <div className="availability-horizontal-section">
            <label className="group-label">Availability:</label>
            <div className="availability-row">
              <div className="input-field">
                <span className="inline-label">Day</span>
                <select name="selectedDay" value={formData.selectedDay} onChange={handleInputChange} className="sched-input compact">
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="input-field">
                <span className="inline-label">Month</span>
                <select name="selectedMonth" value={formData.selectedMonth} onChange={(e) => {
                  handleInputChange(e);
                  setCurrentDate(new Date(year, months.indexOf(e.target.value), 1));
                  setHearingPage(0);
                }} className="sched-input compact">
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="input-field time-field">
                <span className="inline-label">Time</span>
                <div className="time-range-row">
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="sched-input time-input-inline" />
                  <span>-</span>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="sched-input time-input-inline" />
                </div>
              </div>
            </div>
          </div>
          <label className="group-label" style={{marginTop: '15px'}}>Claims/Issues</label>
          <div className="row-group">
            <div className="input-group">
              <label>Labor Standards Violations</label>
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
            </div>
            <div className="input-group">
              <label>Other Issues:</label>
              <input type="text" name="otherIssues" value={formData.otherIssues} onChange={handleInputChange} className="sched-input" placeholder="Type here" />
            </div>
          </div>
          <div className="input-group" style={{ marginTop: '15px' }}>
            <label>Available Hearing Officer</label>
            <select name="officer" value={formData.officer} onChange={handleInputChange} className="sched-input">
              <option value="">Select Officer Name</option>
              {officerList.map((name, index) => <option key={index} value={name}>{name}</option>)}
            </select>
          </div>
          <div className="sched-button-group">
            <button className="create-btn" onClick={handleSubmit}>{editingId ? "Update" : "Create"}</button>
            <button className="view-log-btn" onClick={() => setShowLog(true)}><FaHistory /> Activity Log</button>
          </div>
        </div>

        {/* Calendar and Recent Section */}
        <div className="calendar-card fixed-calendar-card">
          
          <div className="calendar-legend-box" style={{
            display: 'flex',
            justifyContent: 'space-around',
            padding: '10px 5px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '15px',
            border: '1px solid #eee'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
               <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4CAF50' }}></span>
               Available
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
               <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#1d3557' }}></span>
               Limited Slots
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
               <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#e63946' }}></span>
               Fully Booked
            </div>
          </div>

          <div className="calendar-header">
            <FaChevronLeft onClick={() => changeMonth(-1)} style={{cursor: 'pointer'}} />
            <h3>{monthName} {year}</h3>
            <FaChevronRight onClick={() => changeMonth(1)} style={{cursor: 'pointer'}} />
          </div>
          <div className="calendar-grid">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} className="dow-label">{d}</div>)}
            {Array.from({ length: startingOffset }).map((_, i) => <div key={i} className="empty-day"></div>)}
            
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const style = getDayStatusStyle(day);
              return (
                <div 
                  key={day} 
                  className="day-num" 
                  style={style}
                >
                  {day}
                </div>
              );
            })}
          </div>

          <div className="recent-section">
            <h4 className="section-title small">Recent Hearings</h4>
            <div className="recent-hearings-list">
              {currentRecentPageItems.length > 0 ? (
                currentRecentPageItems.map((h) => (
                  <div key={h.id} className="recent-hearing-card-new">
                    <div className="rh-date-col">
                      <span className="rh-day-name">{h.dow?.substring(0, 3)}</span>
                      <span className="rh-day-number">{h.day}</span>
                    </div>
                    <div className="rh-content-col">
                      <h4>{h.title}</h4>
                      <p>{h.time}</p>
                      <button className="rh-view-btn" onClick={() => setShowLog(true)}>View</button>
                    </div>
                  </div>
                ))
              ) : <p>No pending hearings for {monthName}</p>}
            </div>

            {totalRecentPages > 1 && (
              <div className="pagination-dots" style={{ 
                display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '8px' 
              }}>
                <FaChevronLeft 
                  style={{ fontSize: '10px', color: hearingPage === 0 ? '#eee' : '#ccc', cursor: 'pointer' }} 
                  onClick={() => setHearingPage(prev => Math.max(0, prev - 1))}
                />
                {Array.from({ length: totalRecentPages }).map((_, i) => (
                  <span 
                    key={i} 
                    onClick={() => setHearingPage(i)}
                    style={{
                      width: hearingPage === i ? '20px' : '8px',
                      height: '8px',
                      borderRadius: '10px',
                      backgroundColor: hearingPage === i ? '#e63946' : '#ccc',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }} 
                  />
                ))}
                <FaChevronRight 
                  style={{ fontSize: '10px', color: hearingPage === totalRecentPages - 1 ? '#eee' : '#ccc', cursor: 'pointer' }} 
                  onClick={() => setHearingPage(prev => Math.min(totalRecentPages - 1, prev + 1))}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;