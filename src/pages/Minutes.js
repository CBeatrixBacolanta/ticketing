import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import "../styles/Minutes.css";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { 
  FaSearch, FaFileAlt, FaEllipsisV, FaChevronLeft, 
  FaChevronRight, FaTrashAlt, FaArchive, FaCalendarCheck, 
  FaUserTie, FaInbox, FaArrowLeft, FaClock 
} from "react-icons/fa";

const Minutes = () => {
  const navigate = useNavigate(); 
  const location = useLocation();
  const isUpdatingRef = useRef(false);
  
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem("allMinutesFiles");
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  const [hearings] = useState(() => {
    const saved = localStorage.getItem("hearings");
    if (!saved) return [];
    const allHearings = JSON.parse(saved);
    return allHearings.filter(h => {
      const status = h.status?.toLowerCase();
      return status !== "cancelled" && status !== "pending";
    });
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); 
  const [showModal, setShowModal] = useState(false);
  const [selectedHearingId, setSelectedHearingId] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const [isSelectionMode, setIsSelectionMode] = useState(false); 
  const [highlightId, setHighlightId] = useState(null);
  const [showBackToSchedule, setShowBackToSchedule] = useState(false);
  
  const itemsPerPage = 9;

  // Helper function to convert time to 24-hour format
  const convertTo24Hour = (timeStr) => {
    if (!timeStr) return "";
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return "";
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const modifier = match[3].toUpperCase();
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  };

  const getIconColorClass = (status) => {
    if (!status) return 'not-set';
    const statusLower = status.toLowerCase().trim();
    if (statusLower === 'settled') return 'settled';
    if (statusLower === 'partial') return 'partial';
    if (statusLower === 'lack of interest') return 'lack-of-interest';
    if (statusLower === 'approval for endorsement') return 'approval-for-endorsement';
    return 'not-set';
  };

  const getStatusDisplayText = (status) => {
    if (!status) return 'Status Not Set';
    const statusLower = status.toLowerCase().trim();
    if (statusLower === 'settled') return 'Settled';
    if (statusLower === 'partial') return 'Partial';
    if (statusLower === 'lack of interest') return 'Lack of Interest';
    if (statusLower === 'approval for endorsement') return 'Approval';
    return 'Status Not Set';
  };

  const formatCaseTitle = (requestingParties, respondingParties) => {
    let requestingText = "";
    let respondingText = "";
    
    if (requestingParties && requestingParties.length > 0) {
      const validRequesting = requestingParties.filter(p => p && p.trim());
      if (validRequesting.length === 1) {
        requestingText = validRequesting[0];
      } else if (validRequesting.length > 1) {
        requestingText = `${validRequesting[0]}, et al.`;
      }
    }
    
    if (respondingParties && respondingParties.length > 0) {
      const validResponding = respondingParties.filter(p => p && p.trim());
      if (validResponding.length === 1) {
        respondingText = validResponding[0];
      } else if (validResponding.length > 1) {
        respondingText = `${validResponding[0]}, et al.`;
      }
    }
    
    if (requestingText && respondingText) {
      return `${requestingText} v. ${respondingText}`;
    } else if (requestingText) {
      return requestingText;
    } else if (respondingText) {
      return respondingText;
    }
    
    return "Untitled Case";
  };

  const renderCaseTitle = (caseTitle) => {
    if (!caseTitle) return "Untitled Case";
    
    const parts = caseTitle.split(' v. ');
    
    if (parts.length === 2) {
      return (
        <div className="case-title-container">
          <span className="requesting-party">{parts[0]}</span>
          <span className="vs-separator">v.</span>
          <span className="responding-party">{parts[1]}</span>
        </div>
      );
    }
    
    return <div className="case-title-container">{caseTitle}</div>;
  };

  const getActivityType = (doc) => {
    if (doc.conferences && doc.conferences.length > 0 && doc.conferences[0].activityType) {
      return doc.conferences[0].activityType;
    }
    
    if (doc.matter) {
      const matterLower = doc.matter.toLowerCase();
      if (matterLower.includes('advice')) return 'Advice';
      if (matterLower.includes('sena')) return 'SEnA';
    }
    
    if (doc.hearingTitle) {
      const titleLower = doc.hearingTitle.toLowerCase();
      if (titleLower.includes('advice')) return 'Advice';
      if (titleLower.includes('sena')) return 'SEnA';
    }
    
    return 'SEnA';
  };

  const getCaseTitle = (doc) => {
    if (doc.hearingTitle && doc.hearingTitle !== "" && !doc.hearingTitle.startsWith("Minute ")) {
      return doc.hearingTitle;
    }
    
    if (doc.conferences && doc.conferences.length > 0) {
      const conf = doc.conferences[0];
      if (conf.requestingParties || conf.respondingParties) {
        const title = formatCaseTitle(conf.requestingParties, conf.respondingParties);
        if (title !== "Untitled Case") {
          return title;
        }
      }
    }
    
    if (doc.requestingParty || doc.respondingParty) {
      const requesting = doc.requestingParty ? doc.requestingParty.split(',').map(p => p.trim()) : [];
      const responding = doc.respondingParty ? doc.respondingParty.split(',').map(p => p.trim()) : [];
      const title = formatCaseTitle(requesting, responding);
      if (title !== "Untitled Case") {
        return title;
      }
    }
    
    return `Case ${doc.id}`;
  };

  const getHearingDisplayTitle = (hearing) => {
    const requesting = hearing.requestingParty ? hearing.requestingParty.split(',').map(p => p.trim()) : [];
    const responding = hearing.respondingParty ? hearing.respondingParty.split(',').map(p => p.trim()) : [];
    const title = formatCaseTitle(requesting, responding);
    
    if (title === "Untitled Case") {
      return hearing.title || "Untitled Hearing";
    }
    return title;
  };

  useEffect(() => {
    const returnData = localStorage.getItem('returnToViewSched');
    if (returnData) {
      setShowBackToSchedule(true);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idToHighlight = params.get('highlight');
    if (idToHighlight && documents.length > 0) {
      const itemIndex = documents.findIndex(d => String(d.id) === String(idToHighlight));
      if (itemIndex !== -1) {
        const targetPage = Math.ceil((itemIndex + 1) / itemsPerPage);
        setCurrentPage(targetPage);
        setHighlightId(idToHighlight);
        const timer = setTimeout(() => {
          setHighlightId(null); 
          navigate('/minutes', { replace: true }); 
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [location.search, documents, navigate]);

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const now = new Date();
    const uploadedAt = new Date(timestamp);
    const diffInSeconds = Math.floor((now - uploadedAt) / 1000);
    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    return uploadedAt.toLocaleDateString();
  };

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  useEffect(() => {
    const interval = setInterval(forceUpdate, 60000);
    return () => clearInterval(interval);
  }, [forceUpdate]);

  useEffect(() => {
    const handleMinutesUpdate = () => {
      console.log('Minutes updated event received, refreshing list...');
      const saved = localStorage.getItem("allMinutesFiles");
      if (saved) {
        const parsedDocs = JSON.parse(saved);
        setDocuments(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(parsedDocs)) {
            return parsedDocs;
          }
          return prev;
        });
      }
    };
    
    window.addEventListener('minutesUpdated', handleMinutesUpdate);
    return () => window.removeEventListener('minutesUpdated', handleMinutesUpdate);
  }, []);

  useEffect(() => {
    if (!isUpdatingRef.current) {
      isUpdatingRef.current = true;
      localStorage.setItem("allMinutesFiles", JSON.stringify(documents));
      window.dispatchEvent(new Event('minutesUpdated'));
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }
  }, [documents]);

  const handleBackToSchedule = () => {
    const returnData = localStorage.getItem('returnToViewSched');
    if (returnData) {
      localStorage.removeItem('returnToViewSched');
      navigate(-1);
    } else {
      navigate('/minutes');
    }
  };

  const getPartyNamesFromConferences = (doc) => {
    const partyNames = [];
    
    if (doc.conferences && doc.conferences.length > 0) {
      const conf = doc.conferences[0];
      
      if (conf.requestingParties && Array.isArray(conf.requestingParties)) {
        conf.requestingParties.forEach(party => {
          if (party && party.trim()) {
            partyNames.push(party.trim().toLowerCase());
          }
        });
      }
      
      if (conf.respondingParties && Array.isArray(conf.respondingParties)) {
        conf.respondingParties.forEach(party => {
          if (party && party.trim()) {
            partyNames.push(party.trim().toLowerCase());
          }
        });
      }
    }
    
    if (doc.requestingParty) {
      const parties = doc.requestingParty.split(',').map(p => p.trim().toLowerCase());
      partyNames.push(...parties);
    }
    
    if (doc.respondingParty) {
      const parties = doc.respondingParty.split(',').map(p => p.trim().toLowerCase());
      partyNames.push(...parties);
    }
    
    return partyNames;
  };

  const filteredDocs = documents.filter(doc => {
    const searchStr = searchTerm.toLowerCase().trim();
    
    if (!searchStr) return true;
    
    const matchesDocketNo = doc.docketNo && doc.docketNo.toLowerCase().includes(searchStr);
    const caseTitle = getCaseTitle(doc);
    const matchesCaseTitle = caseTitle.toLowerCase().includes(searchStr);
    const partyNames = getPartyNamesFromConferences(doc);
    const matchesPartyName = partyNames.some(partyName => partyName.includes(searchStr));
    const matchesOfficer = doc.officer && doc.officer.toLowerCase().includes(searchStr);
    const matchesSearch = matchesDocketNo || matchesCaseTitle || matchesPartyName || matchesOfficer;
    
    const currentStatus = doc.status?.toLowerCase() || "pending";
    const matchesFilter = filterStatus === "all" || currentStatus === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredDocs.length, totalPages, currentPage]);

  const currentItems = filteredDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectToggle = () => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setDocuments(prev => prev.map(doc => ({ ...doc, selected: false })));
    } else {
      const allVisibleSelected = currentItems.length > 0 && currentItems.every(doc => doc.selected === true);
      
      if (!allVisibleSelected) {
        setDocuments(prev => prev.map(doc => {
          const isVisible = currentItems.some(v => v.id === doc.id);
          return isVisible ? { ...doc, selected: true } : doc;
        }));
      } else {
        setDocuments(prev => prev.map(doc => ({ ...doc, selected: false })));
        setIsSelectionMode(false);
      }
    }
  };

  const toggleDocumentSelection = (docId, event) => {
    if (event) event.stopPropagation();
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, selected: !doc.selected } : doc
    ));
  };

  const handleCreateFromHearing = () => {
    if (!selectedHearingId) return;
    const linkedHearing = hearings.find(h => h.id.toString() === selectedHearingId.toString());
    
    const requestingParties = linkedHearing.requestingParty ? 
      linkedHearing.requestingParty.split(',').map(p => p.trim()).filter(p => p !== "") : [];
    const respondingParties = linkedHearing.respondingParty ? 
      linkedHearing.respondingParty.split(',').map(p => p.trim()).filter(p => p !== "") : [];
    
    const caseTitle = formatCaseTitle(requestingParties, respondingParties);
    const activityType = linkedHearing.title && linkedHearing.title.toLowerCase().includes('advice') ? 'Advice' : 'SEnA';
    
    const alreadyExists = documents.some(doc => getCaseTitle(doc) === caseTitle);
    
    if (alreadyExists) {
      toast.warning(`Alert: A minute for "${caseTitle}" already exists.`);
      return; 
    }

    const nextNumber = documents.length > 0 
      ? Math.max(...documents.map(d => parseInt(String(d.id).replace(/\D/g, '')) || 0)) + 1 
      : 1;
    
    // Extract the start time from the hearing's time field
    let startTime = "";
    if (linkedHearing.time) {
      if (linkedHearing.time.includes(' to ')) {
        startTime = linkedHearing.time.split(' to ')[0];
      } else {
        startTime = linkedHearing.time;
      }
    }
    
    const formattedTime = convertTo24Hour(startTime);
    
    // Get the date from the hearing
    let hearingDate = "";
    if (linkedHearing.year && linkedHearing.monthName && linkedHearing.day) {
      const monthIndex = new Date(Date.parse(linkedHearing.monthName + " 1, 2000")).getMonth();
      const dateObj = new Date(linkedHearing.year, monthIndex, parseInt(linkedHearing.day));
      hearingDate = dateObj.toISOString().split('T')[0];
    } else {
      hearingDate = new Date().toISOString().split('T')[0];
    }
    
    const newFile = {
      id: nextNumber,
      docketNo: "", 
      matter: "",  // BLANK - should NOT be pre-filled
      hearingTitle: caseTitle,  // Store formatted case title for display only
      activityType: activityType,
      officer: linkedHearing.officer || "N/A",
      timestamp: new Date().toISOString(),
      status: "",
      selected: false,
      conferences: [{
        date: hearingDate,
        time: formattedTime,
        requestingParties: requestingParties.slice(0, 3),
        respondingParties: respondingParties.slice(0, 3),
        concerns: "",
        status: "",
        paymentType: "",
        amountPaid: "0",
        totalAmount: "",
        activityType: activityType
      }]
    };

    setDocuments([newFile, ...documents]);
    setShowModal(false);
    setSelectedHearingId("");
    toast.success(`Minute created for "${caseTitle}"!`);
  };

  const handleDeleteSelected = () => {
    const selectedCount = documents.filter(d => d.selected).length;
    if (selectedCount === 0) {
      toast.info("No items selected");
      return;
    }
    
    const updatedDocuments = documents.filter(doc => !doc.selected);
    setDocuments(updatedDocuments);
    setIsSelectionMode(false);
    toast.success(`Deleted ${selectedCount} item${selectedCount > 1 ? 's' : ''}.`);
  };

  const handleArchive = (docId, event) => {
    event.stopPropagation();
    
    const docToArchive = documents.find(doc => doc.id === docId);
    
    if (docToArchive) {
      const archivedMinutes = JSON.parse(localStorage.getItem("archivedMinutes") || "[]");
      
      const archivedDoc = {
        ...docToArchive,
        archivedAt: new Date().toISOString(),
        originalId: docToArchive.id,
        archivedFrom: 'minutes',
        status: docToArchive.status || "Not Set"
      };
      
      archivedMinutes.push(archivedDoc);
      localStorage.setItem("archivedMinutes", JSON.stringify(archivedMinutes));
      
      const updatedDocuments = documents.filter(doc => doc.id !== docId);
      setDocuments(updatedDocuments);
      
      window.dispatchEvent(new Event('minutesArchived'));
      window.dispatchEvent(new Event('storage'));
      
      toast.success("Minute archived successfully! View it in Activity Log > Archives.");
    } else {
      toast.error("Failed to archive minute");
    }
  };

  const handleDelete = (docId, event) => {
    event.stopPropagation();
    console.log('Deleting document:', docId);
    
    const updatedDocuments = documents.filter(doc => doc.id !== docId);
    setDocuments(updatedDocuments);
    toast.success("Minute deleted successfully!");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const scrollArea = document.querySelector('.doc-grid-scroll-area');
    if (scrollArea) {
      scrollArea.scrollTop = 0;
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push('...');
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pageNumbers.push(1);
      pageNumbers.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      pageNumbers.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push('...');
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const handleCardClick = (doc, event) => {
    if (event) event.stopPropagation();
    if (isSelectionMode) {
      toggleDocumentSelection(doc.id, event);
    } else {
      console.log('Opening minute:', doc.id);
      navigate(`/minutes-info/${doc.id}`);
    }
  };

  const getSelectButtonText = () => {
    if (!isSelectionMode) {
      return 'SELECT';
    } else {
      const allVisibleSelected = currentItems.length > 0 && currentItems.every(doc => doc.selected === true);
      if (allVisibleSelected) {
        return 'UNSELECT ALL';
      } else {
        return 'SELECT ALL';
      }
    }
  };

  return (
    <div className="minutes-page">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="upload-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-box">
              <FaCalendarCheck className="modal-upload-icon" />
              <span>Link Minute to Hearing</span>
            </div>
            <div className="modal-body">
              <select className="modal-select-dropdown" value={selectedHearingId} onChange={(e) => setSelectedHearingId(e.target.value)}>
                <option value="">-- Choose Hearing --</option>
                {hearings.map(h => {
                  const displayTitle = getHearingDisplayTitle(h);
                  return <option key={h.id} value={h.id}>{displayTitle}</option>
                })}
              </select>
              <div className="modal-actions">
                <button className="modal-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="modal-btn-create" onClick={handleCreateFromHearing} disabled={!selectedHearingId}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="minutes-header">
        <div className="header-with-back">
          {showBackToSchedule && (
            <button className="back-to-schedule-btn" onClick={handleBackToSchedule}>
              <FaArrowLeft /> Back to Schedule
            </button>
          )}
          <div className="header-text-section">
            <h1>Minutes of Case Proceedings</h1>
            <p>View, manage, and track all client session minutes.</p>
          </div>
        </div>
      </header>

      <div className="horizontal-action-bar">
        <div className="search-box-wrapper">
          <FaSearch className="search-icon-fixed" />
          <input 
            type="text" 
            placeholder="Search by Docket #, Party Name, or Case Title..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <div className="filter-inline-container">
          <span className="filter-label-text">Filter By:</span>
          <select className="filter-select-box" value={filterStatus} onChange={(e) => { 
            setFilterStatus(e.target.value); 
            setCurrentPage(1); 
          }}>
            <option value="all">All Status</option>
            <option value="Settled">Settled</option>
            <option value="Partial">Partial</option>
            <option value="Lack of Interest">Lack of Interest</option>
            <option value="Approval for Endorsement">Approval</option>
          </select>
        </div>

        <div className="button-actions-group">
          <button className="btn-add-fixed" onClick={() => setShowModal(true)}>ADD MINUTE</button>
          <button 
            className={`btn-select-fixed ${isSelectionMode ? "active-mode" : ""}`} 
            onClick={handleSelectToggle}
          >
            {getSelectButtonText()}
          </button>
          <button className="btn-delete-fixed" onClick={handleDeleteSelected} disabled={!documents.some(d => d.selected)}>DELETE</button>
        </div>
      </div>

      <div className="grid-container-fixed">
        <div className="doc-grid-scroll-area">
          {currentItems.length > 0 ? (
            <div className="doc-grid">
              {currentItems.map((doc) => (
                <div 
                  key={doc.id} 
                  className={`document-card ${doc.selected ? "is-selected" : ""} ${String(doc.id) === String(highlightId) ? "glow-highlight" : ""}`} 
                  onClick={(e) => handleCardClick(doc, e)}
                >
                  <div className="card-left">
                    <FaFileAlt className={`doc-icon ${getIconColorClass(doc.status)}`} />
                    <div className="doc-details">
                      <div className="doc-id">
                        {renderCaseTitle(getCaseTitle(doc))}
                      </div>
                      
                      <div className="badges-row">
                        <span className={`activity-badge-small ${getActivityType(doc).toLowerCase()}`}>
                          {getActivityType(doc)}
                        </span>
                        <span className={`status-badge-small ${getIconColorClass(doc.status)}`}>
                          {getStatusDisplayText(doc.status)}
                        </span>
                      </div>
                      
                      <div className="doc-meta-info">
                        <div className="meta-row">
                          <span><FaUserTie /> {doc.officer}</span>
                          <span className="time-stamp"><FaClock /> {getRelativeTime(doc.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="options-menu" onClick={(e) => e.stopPropagation()}>
                    <FaEllipsisV className="doc-options" />
                    <div className="dropdown-menu">
                      <button onClick={(e) => handleArchive(doc.id, e)}>
                        <FaArchive /> Archive
                      </button>
                      <button className="delete-opt" onClick={(e) => handleDelete(doc.id, e)}>
                        <FaTrashAlt /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-container">
              <FaInbox className="empty-icon" />
              <h3>No Minutes Recorded</h3>
            </div>
          )}
        </div>
        
        {totalPages > 1 && (
          <footer className="grid-footer">
            <div className="pagination-controls">
              <FaChevronLeft 
                className={`arrow ${currentPage === 1 ? 'disabled' : ''}`} 
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)} 
              />
              {getPageNumbers().map((pageNum, idx) => (
                pageNum === '...' ? (
                  <span key={`dots-${idx}`} className="page-num dots">...</span>
                ) : (
                  <span 
                    key={idx} 
                    className={`page-num ${currentPage === pageNum ? 'active' : ''}`} 
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </span>
                )
              ))}
              <FaChevronRight 
                className={`arrow ${currentPage === totalPages ? 'disabled' : ''}`} 
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)} 
              />
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default Minutes;