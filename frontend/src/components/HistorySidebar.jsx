import React from 'react';

export default function HistorySidebar({ 
  isOpen, 
  onClose, 
  historyList, 
  onSelectHistory, 
  onDeleteHistory 
}) {

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 70) return 'history-badge high';
    if (score >= 45) return 'history-badge mid';
    return 'history-badge low';
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`history-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <div className={`history-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="history-header">
          <h3 className="history-title">Analysis History</h3>
          <button 
            className="btn-glass" 
            onClick={onClose}
            style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none' }}
          >
            ✕ Close
          </button>
        </div>

        <div className="history-list">
          {historyList && historyList.length > 0 ? (
            historyList.map((item) => (
              <div 
                key={item.id} 
                className="history-card"
                onClick={() => onSelectHistory(item.id)}
              >
                <div className="history-card-header">
                  <span className="history-filename" title={item.filename}>
                    {item.filename}
                  </span>
                  <span className={getScoreBadgeClass(item.score)}>
                    {item.score}%
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                  <span className="history-date">
                    {formatDate(item.created_at)}
                  </span>
                </div>

                <button 
                  className="btn-delete-history"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Are you sure you want to delete this analysis?")) {
                      onDeleteHistory(item.id);
                    }
                  }}
                  title="Delete record"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <p className="history-empty-txt">No past analyses found. Start by uploading a resume!</p>
          )}
        </div>
      </div>
    </>
  );
}
