import React from 'react';

export default function SuggestionsPanel({ suggestions = [], experienceYears = [], education = [] }) {
  
  // Clean up and categorize suggestions if needed, or render them cleanly
  const isFormatSuggestion = (txt) => {
    const t = txt.toLowerCase();
    return t.includes('section') || t.includes('layout') || t.includes('format');
  };

  return (
    <div className="glass-card">
      <div className="card-title-container">
        <h3 className="card-title">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
          </svg>
          Resume Booster Suggestions
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Actionable ATS Insights
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Extracted Metadata (Experience & Education) */}
        {(experienceYears.length > 0 || education.length > 0) && (
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem',
              background: 'rgba(255, 255, 255, 0.015)', 
              padding: '0.85rem 1rem', 
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.04)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                Detected Experience
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                {experienceYears.length > 0 ? `${experienceYears.join(', ')} years` : 'Not explicitly detected'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                Detected Education
              </span>
              <span 
                style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  color: '#fff', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  display: 'block'
                }}
                title={education.join(' | ')}
              >
                {education.length > 0 ? education[0] : 'Not explicitly detected'}
              </span>
            </div>
          </div>
        )}

        {/* Suggestions List */}
        <div className="suggestions-list">
          {suggestions.map((suggestion, index) => {
            const isFormat = isFormatSuggestion(suggestion);
            return (
              <div 
                key={index} 
                className={`suggestion-item ${isFormat ? 'format-tip' : ''}`}
              >
                {isFormat ? (
                  // Layout/formatting icon (Blueprint/Layout)
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 14h8V5H4v9zm0 5h8v-3H4v3zM14 5v7h8V5h-8zm0 14h8v-5h-8v5z"/>
                  </svg>
                ) : (
                  // Advice/Idea icon (Bulb)
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
                  </svg>
                )}
                <span>{suggestion}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
