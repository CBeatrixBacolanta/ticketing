import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Schedule.css';
import ActivityLog from './ActivityLog';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaHistory, 
  FaArrowLeft, 
  FaTrash, 
  FaPlus, 
  FaTimes, 
  FaExclamationTriangle 
} from 'react-icons/fa';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Schedule = ({ hideHeader, onSuccess, triggerToast }) => {
  const navigate = useNavigate();
  
  // UI States
  const [showLog, setShowLog] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  
  // Calendar & Time States
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [hearingPage, setHearingPage] = useState(0); 
  const itemsPerPage = 2;
  const [allHearings, setAllHearings] = useState([]);
  
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Form States
  const [editingId, setEditingId] = useState(null);
  const [startTime, setStartTime] = useState("09:30");
  const [endTime, setEndTime] = useState("10:00");
  const [requestingParties, setRequestingParties] = useState(['']);
  const [respondingParties, setRespondingParties] = useState(['']);

  const [formData, setFormData] = useState({
    purpose: '', 
    selectedMonth: months[new Date().getMonth()], 
    selectedDay: String(new Date().getDate()),
    laborViolation: 'Select',
    otherIssues: '', 
    officer: '' 
  });

  const toTitleCase = (str) => {
    if (!str) return "";
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  useEffect(() => {
    const loadData = () => {
      const savedHearings = JSON.parse(localStorage.getItem('hearings')) || [];
      setAllHearings(savedHearings);

      const loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
      if (loggedInUser) {
        const fullName = `${toTitleCase(loggedInUser.firstName || "")} ${loggedInUser.middleInitial ? loggedInUser.middleInitial.toUpperCase() + '.' : ""} ${toTitleCase(loggedInUser.lastName || "")}`.trim();
        setFormData(prev => ({ ...prev, officer: fullName }));
      }
    };
    loadData();

    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  // --- PARTY MODAL LOGIC ---

  const handleAddParty = (type) => {
    if (type === 'req') setRequestingParties([...requestingParties, '']);
    else setRespondingParties([...respondingParties, '']);
  };

  const handleRemoveParty = (type, index) => {
    if (type === 'req' && requestingParties.length > 1) {
      setRequestingParties(requestingParties.filter((_, i) => i !== index));
    } else if (type === 'res' && respondingParties.length > 1) {
      setRespondingParties(respondingParties.filter((_, i) => i !== index));
    }
  };

  const handlePartyNameChange = (type, index, value) => {
    const list = type === 'req' ? [...requestingParties] : [...respondingParties];
    list[index] = value;
    type === 'req' ? setRequestingParties(list) : setRespondingParties(list);
  };

  const handleCloseIconClick = () => {
    const hasReq = requestingParties.some(n => n.trim() !== "");
    const hasRes = respondingParties.some(n => n.trim() !== "");

    if (!hasReq && !hasRes) {
      toast.error("Please add names to both Requesting and Responding parties.");
    } else if (!hasReq) {
      toast.error("Please add a name for the Requesting Party.");
    } else if (!hasRes) {
      toast.error("Please add a name for the Responding Party.");
    } else {
      setShowPartyModal(false);
    }
  };

  const handleModalSave = () => {
    const hasReq = requestingParties.some(n => n.trim() !== "");
    const hasRes = respondingParties.some(n => n.trim() !== "");

    if (!hasReq || !hasRes) {
      toast.warn("Parties cannot be empty. Please fill them in before saving.");
      return;
    }
    setShowPartyModal(false);
  };

  const handleCancelRequest = () => {
    setShowConfirmExit(true); // Switches view within the modal
  };

  // --- FORM SUBMISSION ---

  const formatTimeToAmPm = (timeStr) => {
    if (!timeStr) return "";
    let [hours, minutes] = timeStr.split(':');
    hours = parseInt(hours);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${suffix}`;
  };

  const handleSubmit = () => {
    const validReq = requestingParties.filter(n => n.trim() !== "");
    const validRes = respondingParties.filter(n => n.trim() !== "");

    if (!formData.purpose || validReq.length === 0 || validRes.length === 0) {
      toast.warn("Please complete the purpose and ensure all parties are named.");
      return;
    }

    const combinedTime = `${formatTimeToAmPm(startTime)} to ${formatTimeToAmPm(endTime)}`;
    const selectedDateObj = new Date(currentDate.getFullYear(), months.indexOf(formData.selectedMonth), parseInt(formData.selectedDay));

    const hearingData = {
      id: editingId || Date.now(),
      title: formData.purpose,
      time: combinedTime,
      day: formData.selectedDay,
      officer: formData.officer,
      requestingParty: validReq.join(', '), 
      respondingParty: validRes.join(', '),
      laborViolation: formData.laborViolation,
      otherIssues: formData.otherIssues,
      status: "Scheduled", 
      date: `${formData.selectedMonth.substring(0, 3).toUpperCase()} ${formData.selectedDay}`,
      monthName: formData.selectedMonth,
      dow: selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' })
    };
    
    const updated = [...allHearings.filter(h => h.id !== editingId), hearingData];
    localStorage.setItem('hearings', JSON.stringify(updated));
    
    const msg = editingId ? "Schedule Updated!" : "Schedule Created!";
    if (triggerToast) triggerToast("success", msg);
    else toast.success(msg);
    
    if (onSuccess) onSuccess();
    else {
      setFormData(prev => ({ ...prev, purpose: '', laborViolation: 'Select', otherIssues: '' }));
      setRequestingParties(['']); 
      setRespondingParties(['']); 
      setEditingId(null);
      setAllHearings(updated);
    }
  };

  // --- CALENDAR LOGIC ---

  const month = currentDate.getMonth();
  const monthName = months[month];
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingOffset = (new Date(year, month, 1).getDay() + 6) % 7;

  const pendingHearingsForMonth = allHearings
    .filter(h => {
      const isSameMonth = h.date && h.date.toUpperCase().includes(monthName.substring(0, 3).toUpperCase());
      if (!isSameMonth) return false;
      try {
        const endTimeStr = h.time.split(' to ')[1]; 
        const [time, modifier] = endTimeStr.split(' ');
        let [hours, minutes] = time.split(':');
        if (modifier === 'PM' && hours !== '12') hours = parseInt(hours) + 12;
        if (modifier === 'AM' && hours === '12') hours = '00';
        const hearingEndDate = new Date(year, months.indexOf(h.monthName || formData.selectedMonth), parseInt(h.day), hours, minutes);
        return hearingEndDate > currentTime; 
      } catch (e) { return true; }
    })
    .sort((a, b) => parseInt(a.day) - parseInt(b.day));

  const totalRecentPages = Math.ceil(pendingHearingsForMonth.length / itemsPerPage);
  const currentRecentPageItems = pendingHearingsForMonth.slice(hearingPage * itemsPerPage, (hearingPage + 1) * itemsPerPage);

  if (showLog) return <ActivityLog onBack={() => setShowLog(false)} />;

  return (
    <div className="schedule-page-wrapper">
      {!hideHeader && (
        <div className="page-header-container">
          <button onClick={() => navigate(-1)} className="back-nav-btn"><FaArrowLeft /></button>
          <h1 className="header-title">Schedule a Meeting</h1>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />

      {showPartyModal && (
        <div className="modal-overlay">
          <div className="party-modal">
            <div className="modal-header">
              <h3>{showConfirmExit ? "Confirm Exit" : "Manage Parties"}</h3>
              {!showConfirmExit && <FaTimes className="close-icon" onClick={handleCloseIconClick} />}
            </div>
            
            <div className="modal-body">
              {showConfirmExit ? (
                <div className="confirm-exit-view">
                  <FaExclamationTriangle className="warning-icon-large" />
                  <h3>Unsaved Changes</h3>
                  <p>Are you sure you want to cancel? Any names you've entered will be lost.</p>
                  <div className="modal-footer-dual">
                    <button className="modal-save-btn-small" onClick={() => setShowConfirmExit(false)}>Go Back</button>
                    <button className="modal-cancel-btn" onClick={() => { setShowPartyModal(false); setShowConfirmExit(false); }}>Yes, Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="party-section-box">
                    <h4 className="party-section-title">Requesting Party</h4>
                    <div className="party-list-scroll-container">
                      {requestingParties.map((name, index) => (
                        <div key={index} className="party-input-row">
                          <input type="text" placeholder="Insert name here" value={name} onChange={(e) => handlePartyNameChange('req', index, e.target.value)} />
                          <button className="party-delete-btn" onClick={() => handleRemoveParty('req', index)}><FaTrash /></button>
                        </div>
                      ))}
                    </div>
                    <button className="add-another-btn" onClick={() => handleAddParty('req')}><FaPlus /> Add Another</button>
                  </div>

                  <div className="party-section-box">
                    <h4 className="party-section-title">Responding Party</h4>
                    <div className="party-list-scroll-container">
                      {respondingParties.map((name, index) => (
                        <div key={index} className="party-input-row">
                          <input type="text" placeholder="Insert name here" value={name} onChange={(e) => handlePartyNameChange('res', index, e.target.value)} />
                          <button className="party-delete-btn" onClick={() => handleRemoveParty('res', index)}><FaTrash /></button>
                        </div>
                      ))}
                    </div>
                    <button className="add-another-btn" onClick={() => handleAddParty('res')}><FaPlus /> Add Another</button>
                  </div>

                  <div className="modal-footer-dual">
                    <button className="modal-cancel-btn" onClick={handleCancelRequest}>Cancel</button>
                    <button className="modal-save-btn-small" onClick={handleModalSave}>Save</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="schedule-container">
        <div className="create-card">
          <h2 className="section-title">{editingId ? "Update Schedule" : "Create New Schedule"}</h2>
          
          <div className="input-group">
            <label>Purpose:</label>
            <input type="text" value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})} className="sched-input" />
          </div>

          <div className="row-group">
            <div className="input-group">
              <label>Requesting Party:</label>
              <button className="manage-party-trigger" onClick={() => setShowPartyModal(true)}>Manage Party</button>
            </div>
            <div className="input-group">
              <label>Responding Party:</label>
              <button className="manage-party-trigger" onClick={() => setShowPartyModal(true)}>Manage Party</button>
            </div>
          </div>

          <div className="availability-horizontal-section">
            <label className="group-label">Availability:</label>
            <div className="availability-row">
              <div className="input-field"><span className="inline-label">Day</span>
                <select value={formData.selectedDay} onChange={(e) => setFormData({...formData, selectedDay: e.target.value})} className="sched-input compact">
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="input-field"><span className="inline-label">Month</span>
                <select value={formData.selectedMonth} onChange={(e) => setFormData({...formData, selectedMonth: e.target.value})} className="sched-input compact">
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="input-field time-field"><span className="inline-label">Time</span>
                <div className="time-range-row">
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="sched-input" />
                  <span>-</span>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="sched-input" />
                </div>
              </div>
            </div>
          </div>

          <div className="row-group">
            <div className="input-group">
              <label>Labor Violation / Claims:</label>
              <select className="sched-input" value={formData.laborViolation} onChange={(e) => setFormData({...formData, laborViolation: e.target.value})}>
                <option value="Select">Select</option>
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
              <input type="text" className="sched-input" value={formData.otherIssues} onChange={(e) => setFormData({...formData, otherIssues: e.target.value})} />
            </div>
          </div>

          <div className="input-group" style={{ marginTop: '15px' }}>
            <label>Available Hearing Officer</label>
            <input type="text" value={formData.officer} readOnly className="sched-input read-only-input" />
          </div>

          <div className="sched-button-group">
            <button className="create-btn" onClick={handleSubmit}>{editingId ? "Update" : "Create"}</button>
            <button className="view-log-btn" onClick={() => setShowLog(true)}><FaHistory /> Activity Log</button>
          </div>
        </div>

        <div className="calendar-card fixed-calendar-card">
          <div className="calendar-header">
            <FaChevronLeft onClick={() => setCurrentDate(new Date(year, month - 1, 1))} style={{cursor: 'pointer'}} />
            <h3>{monthName} {year}</h3>
            <FaChevronRight onClick={() => setCurrentDate(new Date(year, month + 1, 1))} style={{cursor: 'pointer'}} />
          </div>
          <div className="calendar-grid">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} className="dow-label">{d}</div>)}
            {Array.from({ length: startingOffset }).map((_, i) => <div key={i}></div>)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                <div key={day} className={`day-num ${currentTime.getDate() === day && currentTime.getMonth() === month && currentTime.getFullYear() === year ? 'today-highlight' : ''}`}>{day}</div>
            ))}
          </div>

          <div className="recent-section">
            <h4 className="section-title small">Recent Hearings</h4>
            <div className="recent-hearings-list">
              {currentRecentPageItems.length > 0 ? currentRecentPageItems.map((h) => (
                <div key={h.id} className="recent-hearing-card-new">
                  <div className="rh-date-col">
                    <span className="rh-day-name">{h.dow?.substring(0, 3)}</span>
                    <span className="rh-day-number">{h.day}</span>
                  </div>
                  <div className="rh-content-col">
                    <div className="rh-main-info"><h4>{h.title}</h4><p>{h.time}</p></div>
                    <button className="rh-view-btn" onClick={() => {
                        setEditingId(h.id);
                        setFormData({
                            purpose: h.title,
                            selectedMonth: h.monthName || h.date.split(' ')[0],
                            selectedDay: h.day,
                            officer: h.officer,
                            laborViolation: h.laborViolation || 'Select',
                            otherIssues: h.otherIssues || ''
                        });
                        setRequestingParties(h.requestingParty.split(', '));
                        setRespondingParties(h.respondingParty.split(', '));
                    }}>View</button>
                  </div>
                </div>
              )) : <p className="no-hearings">No upcoming hearings for this month.</p>}
            </div>
            {totalRecentPages > 1 && (
              <div className="pagination-dots">
                {Array.from({ length: totalRecentPages }).map((_, i) => (
                  <span key={i} className={`dot-item ${hearingPage === i ? 'active' : ''}`} onClick={() => setHearingPage(i)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;