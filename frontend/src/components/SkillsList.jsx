import React from 'react';

export default function SkillsList({ matchedSkills = [], missingSkills = [], resumeSkills = [] }) {
  return (
    <div className="glass-card" style={{ gap: '1.25rem' }}>
      <div className="card-title-container">
        <h3 className="card-title">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
          </svg>
          Skill Mapping
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {matchedSkills.length} matched / {missingSkills.length} missing
        </span>
      </div>

      {/* Main grid containing Matched and Missing comparisons */}
      <div className="skills-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Matched Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span className="skills-subtitle" style={{ color: '#42f59b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#42f59b">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Matched Skills ({matchedSkills.length})
          </span>
          {matchedSkills.length > 0 ? (
            <div className="skills-grid">
              {matchedSkills.map((skill, index) => (
                <div key={index} className="skill-badge matched">
                  <svg viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  {skill}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              No matched skills identified.
            </p>
          )}
        </div>

        {/* Missing Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span className="skills-subtitle" style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#f87171">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            Missing Skills ({missingSkills.length})
          </span>
          {missingSkills.length > 0 ? (
            <div className="skills-grid">
              {missingSkills.map((skill, index) => (
                <div 
                  key={index} 
                  className="skill-badge missing"
                  title="Missing from your resume. Try mentioning this skill in projects or experience."
                  style={{ cursor: 'help' }}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  {skill}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: '#42f59b', fontStyle: 'italic', fontWeight: 500 }}>
              🎉 Perfect! All skills from the job description are in your resume!
            </p>
          )}
        </div>
      </div>

      {/* Horizontal Divider */}
      <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.06)', margin: '0.5rem 0' }} />

      {/* All Resume Skills Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <span className="skills-subtitle" style={{ color: '#b15efb', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#b15efb">
            <path d="M12 3c-1.2 0-2.4.4-3.4 1.2L4.8 7.6C3 9 2 11.2 2 13.5v5C2 19.9 3.1 21 4.5 21h15c1.4 0 2.5-1.1 2.5-2.5v-5c0-2.3-1-4.5-2.8-5.9l-3.8-3.4c-1-.8-2.2-1.2-3.4-1.2zm0 2c.7 0 1.3.2 1.9.7l3.8 3.4c1.1.9 1.8 2.3 1.8 3.9v4.5c0 .3-.2.5-.5.5h-15c-.3 0-.5-.2-.5-.5v-4.5c0-1.6.7-3 1.8-3.9l3.8-3.4c.6-.5 1.2-.7 1.9-.7zm-4 7c-.6 0-1 .4-1 1s.4 1 1 1h8c.6 0 1-.4 1-1s-.4-1-1-1H8z"/>
          </svg>
          Skills Extracted from Resume ({resumeSkills.length})
        </span>
        {resumeSkills.length > 0 ? (
          <div className="skills-grid">
            {resumeSkills.map((skill, index) => (
              <div key={index} className="skill-badge resume">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {skill}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            No skills extracted from your resume. Verify if your file is machine-readable.
          </p>
        )}
      </div>
    </div>
  );
}
