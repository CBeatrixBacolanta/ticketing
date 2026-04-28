import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../styles/ActivityLog.css';
import { 
  FaArrowLeft, FaEdit, FaHistory, FaListUl, 
  FaEllipsisV, FaFileAlt, FaCommentDots, FaTrashAlt,
  FaArchive, FaTimesCircle
} from 'react-icons/fa';

const ActivityLog = ({ onBack }) => {
  const [logs, setLogs] = useState([]);
  const [viewMode, setViewMode] = useState('active'); 
  const [activeMenuId, setActiveMenuId] = useState(null); 
  const [now, setNow] = useState(new Date()); 

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // 1. Live Status Timer
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // 2. Click Outside Dropdown Logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    if (activeMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId]);

  // 3. Status Calculator (Pending, In Session, Finished)
  const getLiveStatus = useCallback((row) => {
    if (row.status === 'Cancelled' || row.status === 'Done') return row.status;

    try {
      const monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const year = row.year || now.getFullYear();
      const monthIndex = monthsArr.indexOf(row.monthName);
      const day = parseInt(row.day);

      const [startStr, endStr] = row.time.split(' to ');

      const parseTimeToDate = (timeStr) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours, 10);
        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return new Date(year, monthIndex, day, hours, parseInt(minutes, 10), 0);
      };

      const startTime = parseTimeToDate(startStr);
      const endTime = parseTimeToDate(endStr);

      if (now >= startTime && now <= endTime) return "In Session";
      else if (now < startTime) return "Pending";
      else return "Finished";
    } catch (error) {
      return row.status || "Pending";
    }
  }, [now]);

  // 4. Data Loading Logic
  const loadLogs = useCallback(() => {
    const savedHearings = JSON.parse(localStorage.getItem('hearings')) || [];
    const savedMinutesFiles = JSON.parse(localStorage.getItem('allMinutesFiles')) || [];
    
    const processedLogs = [...savedHearings].sort((a, b) => b.id - a.id).map(hearing => {
      // Find if there's a minute file linked to this hearing
      const minuteFile = savedMinutesFiles.find(m => m.hearingTitle === hearing.title || m.matter === hearing.title);
      const hasMinutes = !!minuteFile;
      const minuteId = minuteFile ? minuteFile.id : null;
      return { ...hearing, hasMinutes, minuteId };
    });
    
    if (viewMode === 'active') {
      setLogs(processedLogs.filter(h => {
        const status = h.status?.toLowerCase();
        return status !== 'done' && status !== 'cancelled';
      }));
    } else {
      setLogs(processedLogs.filter(h => {
        const status = h.status?.toLowerCase();
        return status === 'done' || status === 'cancelled';
      }));
    }
  }, [viewMode]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // 5. Action Handlers
  const handleToggleMenu = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(prevId => (prevId === id ? null : id));
  };

  const handleArchive = (id) => {
    const saved = JSON.parse(localStorage.getItem('hearings')) || [];
    const updated = saved.map(h => h.id === id ? { ...h, status: 'Done' } : h);
    localStorage.setItem('hearings', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    loadLogs();
    setActiveMenuId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Permanently delete this record?")) {
      const saved = JSON.parse(localStorage.getItem('hearings')) || [];
      const updated = saved.filter(h => h.id !== id);
      localStorage.setItem('hearings', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      loadLogs();
      setActiveMenuId(null);
    }
  };

  const openCancelModal = (hearing) => {
    setSelectedHearing(hearing);
    setShowCancelModal(true);
    setActiveMenuId(null);
  };

  const submitCancellation = () => {
    const finalReason = cancelReason === 'Other' ? otherReason : cancelReason;
    if (!finalReason) return alert("Please select a reason.");
    const saved = JSON.parse(localStorage.getItem('hearings')) || [];
    const updated = saved.map(h => 
      h.id === selectedHearing.id ? { ...h, status: 'Cancelled', cancelReason: finalReason } : h
    );
    localStorage.setItem('hearings', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setShowCancelModal(false);
    setCancelReason('');
    setOtherReason('');
    loadLogs();
  };

  // Handle minutes button click - navigate to specific minute
  const handleViewMinutes = (row) => {
    if (row.status === 'Cancelled') return;
    
    if (row.minuteId) {
      // Navigate to existing minute - pass returnToActivityLog flag
      navigate(`/minutes-info/${row.minuteId}`, { 
        state: { 
          returnToActivityLog: true,
          scheduleId: row.id
        } 
      });
    } else {
      // No minute exists yet, create a new one from this hearing
      navigate(`/minutes-info/new`, { 
        state: { 
          initialData: row,
          returnToActivityLog: true,  // This tells MinutesInfo to return to Activity Log
          scheduleId: row.id
        } 
      });
    }
  };

  return (
    <div className="activity-log-page">
      {/* FULL CANCEL MODAL */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Hearing</h3>
            <p>Reason for: <strong>{selectedHearing?.title}</strong></p>
            <div className="reason-options">
              {['Health Problems', 'Personal Problems', 'Schedule Conflict', 'Officer Unavailable', 'Other'].map(r => (
                <label key={r} className="reason-label">
                  <input type="radio" name="reason" value={r} onChange={(e) => setCancelReason(e.target.value)} /> {r}
                </label>
              ))}
            </div>
            {cancelReason === 'Other' && (
              <input type="text" placeholder="Specify reason..." className="other-reason-input" onChange={(e) => setOtherReason(e.target.value)} />
            )}
            <div className="modal-footer">
              <button className="modal-btn-secondary" onClick={() => setShowCancelModal(false)}>Back</button>
              <button className="modal-btn-primary" onClick={submitCancellation}>Submit</button>
            </div>
          </div>
        </div>
      )}

      <div className="log-header-section">
        <button className="back-button" onClick={onBack}><FaArrowLeft /> Activity Log</button>
        <div className="view-toggle-container">
          <button className={`toggle-btn ${viewMode === 'active' ? 'active' : ''}`} onClick={() => setViewMode('active')}><FaListUl /> Active</button>
          <button className={`toggle-btn ${viewMode === 'archived' ? 'active' : ''}`} onClick={() => setViewMode('archived')}><FaHistory /> Archives</button>
        </div>
      </div>

      <div className="log-container-card">
        <div className="table-wrapper-inner">
          <table className="activity-table">
            <thead>
              <tr>
                <th className="col-no">No.</th>
                <th className="col-officer">Officer</th>
                <th className="col-date">Date</th>
                <th className="col-time">Time</th>
                <th className="col-purpose">Purpose</th>
                <th className="col-status">Status</th>
                <th className="col-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((row, index) => {
                  const currentStatus = getLiveStatus(row);
                  return (
                    <tr key={row.id}>
                      <td className="col-no">{index + 1}</td>
                      <td className="col-officer"><strong>{row.officer}</strong></td>
                      <td className="col-date">{row.date}</td>
                      <td className="col-time">{row.time}</td>
                      <td className="col-purpose">{row.title}</td>
                      <td className="col-status">
                        <span className={`status-pill ${currentStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                          {currentStatus}
                        </span>
                      </td>
                      <td className="col-action">
                        {viewMode === 'active' ? (
                          <div className="active-action-group">
                            <button className="arch-btn edit" title="Edit" onClick={() => navigate('/schedule-form', { state: { initialData: row } })}><FaEdit /></button>
                            <div className="dot-menu-container">
                              <button className="opt-btn-trigger" onClick={(e) => handleToggleMenu(e, row.id)}><FaEllipsisV /></button>
                              {activeMenuId === row.id && (
                                <div className="dropdown-menu show" ref={dropdownRef}>
                                  <button onClick={() => handleArchive(row.id)} className="drop-item archive"><FaArchive /> Archive</button>
                                  <button onClick={() => openCancelModal(row)} className="drop-item cancel"><FaTimesCircle /> Cancel</button>
                                  <button onClick={() => handleDelete(row.id)} className="drop-item delete"><FaTrashAlt /> Delete</button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="archive-actions-group">
                            <button className="arch-btn remark" title="View Remarks" onClick={() => navigate(`/remarks/${row.id}`)}><FaCommentDots /></button>
                            <button 
                              className={`arch-btn minutes ${row.hasMinutes ? 'exists' : 'empty'} ${row.status === 'Cancelled' ? 'disabled' : ''}`} 
                              onClick={() => handleViewMinutes(row)} 
                              disabled={row.status === 'Cancelled'}
                            >
                              <FaFileAlt />
                            </button>
                            <button className="arch-btn delete" title="Delete" onClick={() => handleDelete(row.id)}><FaTrashAlt /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="7" className="empty-msg">No {viewMode} records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;