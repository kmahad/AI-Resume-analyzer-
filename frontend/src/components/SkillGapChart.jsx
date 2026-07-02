import React from 'react';

export default function SkillGapChart({ score, semanticScore, skillScore, keywordScore }) {
  // We represent the visual gap for 3 parameters: Skills, Semantic, Keywords
  const metrics = [
    { label: 'Skills Match', value: skillScore, color: '#b15efb', labelColor: 'rgba(177, 94, 251, 1)' },
    { label: 'Semantic Fit', value: semanticScore, color: '#00f2fe', labelColor: 'rgba(0, 242, 254, 1)' },
    { label: 'Keyword Density', value: keywordScore, color: '#42f59b', labelColor: 'rgba(66, 245, 155, 1)' }
  ];

  return (
    <div className="skill-gap-visualizer">
      <span className="skills-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#00f2fe" style={{ marginRight: '0.2rem' }}>
          <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
        </svg>
        Skill Gap Analysis
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '0.5rem 0' }}>
        {metrics.map((metric, idx) => {
          // Calculate values for a 100px width bar visualizer
          const barWidth = Math.max(4, metric.value); // min width 4%
          
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{metric.label}</span>
                <span style={{ color: metric.labelColor, fontWeight: 700 }}>{metric.value}% / 100%</span>
              </div>
              
              <div style={{ position: 'relative', height: '24px', display: 'flex', alignItems: 'center' }}>
                {/* Background Track (Target 100%) */}
                <div 
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px'
                  }}
                  title="Target Job Expectation (100%)"
                />
                
                {/* Foreground Fill (Resume Score) */}
                <div 
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${barWidth}%`,
                    height: '12px',
                    background: `linear-gradient(90deg, ${metric.color}90, ${metric.color})`,
                    boxShadow: `0 0 10px ${metric.color}35`,
                    borderRadius: '6px',
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />

                {/* Score Marker Dot */}
                <div 
                  style={{
                    position: 'absolute',
                    left: `calc(${barWidth}% - 6px)`,
                    top: '0px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: `0 0 8px ${metric.color}`,
                    transition: 'left 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color resume" />
          <span>Your Resume Fit</span>
        </div>
        <div className="legend-item">
          <div className="legend-color job" style={{ border: '1px solid rgba(255, 255, 255, 0.15)' }} />
          <span>Job Standard Target</span>
        </div>
      </div>
    </div>
  );
}
