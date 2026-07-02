import React from 'react';

export default function JobDescriptionInput({ 
  jobs, 
  setJobs, 
  activeJobIndex, 
  setActiveJobIndex 
}) {

  const addTab = () => {
    const nextId = jobs.length > 0 ? Math.max(...jobs.map(j => j.id)) + 1 : 1;
    const newJob = {
      id: nextId,
      title: `Job Description ${nextId}`,
      text: ''
    };
    setJobs([...jobs, newJob]);
    setActiveJobIndex(jobs.length); // Switch to the new tab
  };

  const removeTab = (e, indexToRemove) => {
    e.stopPropagation();
    if (jobs.length <= 1) return; // Keep at least one tab
    
    const updatedJobs = jobs.filter((_, idx) => idx !== indexToRemove);
    setJobs(updatedJobs);
    
    // Adjust active index
    if (activeJobIndex >= updatedJobs.length) {
      setActiveJobIndex(updatedJobs.length - 1);
    } else if (activeJobIndex === indexToRemove && activeJobIndex > 0) {
      setActiveJobIndex(activeJobIndex - 1);
    }
  };

  const handleTextChange = (e) => {
    const updatedJobs = [...jobs];
    updatedJobs[activeJobIndex].text = e.target.value;
    
    // Try to auto-update title based on first line if it's short
    const firstLine = e.target.value.split('\n')[0].trim();
    if (firstLine && firstLine.length < 30 && !firstLine.includes(' ')) {
      // Just single word or very short, can keep it or try to parse job title
    }
    
    setJobs(updatedJobs);
  };

  const handleTitleChange = (index, newTitle) => {
    const updatedJobs = [...jobs];
    updatedJobs[index].title = newTitle || `Job ${index + 1}`;
    setJobs(updatedJobs);
  };

  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="form-label">Job Description(s)</label>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {jobs.length > 1 ? `${jobs.length} Jobs Added (Compare Mode)` : 'Paste details below'}
        </span>
      </div>

      {/* Tabs Row */}
      <div className="jd-tabs">
        {jobs.map((job, idx) => (
          <div 
            key={job.id} 
            className={`jd-tab ${activeJobIndex === idx ? 'active' : ''}`}
            onClick={() => setActiveJobIndex(idx)}
          >
            <input
              type="text"
              value={job.title}
              onChange={(e) => handleTitleChange(idx, e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                fontSize: 'inherit',
                fontFamily: 'inherit',
                fontWeight: 'inherit',
                width: '120px',
                outline: 'none'
              }}
              title="Click to rename tab"
              onClick={(e) => e.stopPropagation()}
            />
            {jobs.length > 1 && (
              <span 
                onClick={(e) => removeTab(e, idx)}
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  marginLeft: '0.25rem',
                  cursor: 'pointer',
                  opacity: 0.6
                }}
                title="Remove job"
              >
                ×
              </span>
            )}
          </div>
        ))}
        <button type="button" className="btn-add-tab" onClick={addTab} title="Add another job to compare">
          + Add Job
        </button>
      </div>

      {/* Textarea */}
      <textarea
        key={activeJobIndex}
        className="textarea-jd"
        placeholder="Paste the job description here..."
        value={jobs[activeJobIndex]?.text || ''}
        onChange={handleTextChange}
      />
    </div>
  );
}
