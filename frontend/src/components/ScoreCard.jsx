import React, { useEffect, useState } from 'react';

export default function ScoreCard({ score, semanticScore, skillScore, keywordScore }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Micro-animation for score ticking up
    const duration = 1000; // 1s
    const steps = 30;
    const stepTime = duration / steps;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Ease out quadratic
      const easeProgress = progress * (2 - progress);
      const nextScore = Math.min(score, Math.round(easeProgress * score));
      
      setAnimatedScore(nextScore);
      
      if (currentStep >= steps) {
        setAnimatedScore(score);
        clearInterval(interval);
      }
    }, stepTime);
    
    return () => clearInterval(interval);
  }, [score]);

  // SVG parameters
  const radius = 55;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius; // ~345.57
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Determine color theme based on score
  const getColor = (val) => {
    if (val < 45) return '#ef4444'; // Red
    if (val < 70) return '#f59e0b'; // Yellow/Orange
    return '#00d285'; // Green
  };

  const scoreColor = getColor(score);

  return (
    <div className="glass-card">
      <div className="card-title-container">
        <h3 className="card-title">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0 4H7v-2h10v2zm0-8H7V7h10v2z"/>
          </svg>
          ATS Fit Analysis
        </h3>
        <span 
          style={{ 
            fontSize: '0.8rem', 
            fontWeight: 700, 
            padding: '0.2rem 0.5rem', 
            borderRadius: '4px',
            background: `rgba(${score >= 70 ? '0, 210, 133' : score >= 45 ? '245, 158, 11' : '239, 68, 68'}, 0.1)`,
            color: scoreColor
          }}
        >
          {score >= 70 ? 'Strong Match' : score >= 45 ? 'Average Match' : 'Weak Match'}
        </span>
      </div>

      <div className="score-summary-row">
        {/* SVG Circular Progress Gauge */}
        <div className="circular-gauge-box">
          <svg className="svg-gauge">
            <circle 
              className="gauge-track" 
              cx="70" 
              cy="70" 
              r={radius} 
            />
            <circle 
              className="gauge-fill" 
              cx="70" 
              cy="70" 
              r={radius} 
              stroke={scoreColor}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              filter={`drop-shadow(0px 0px 6px ${scoreColor}50)`}
            />
          </svg>
          <div className="gauge-score-text">
            <span className="gauge-number">{animatedScore}%</span>
            <span className="gauge-label">Match</span>
          </div>
        </div>

        {/* Weighted Sub-Score Bars */}
        <div className="score-breakdowns">
          <div className="score-bar-group">
            <div className="score-bar-label">
              <span>Semantic Similarity (50%)</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>{semanticScore}%</span>
            </div>
            <div className="score-bar-bg">
              <div 
                className="score-bar-fill" 
                style={{ 
                  width: `${semanticScore}%`, 
                  background: 'var(--primary-grad)',
                  boxShadow: '0 0 8px rgba(0, 242, 254, 0.4)'
                }}
              />
            </div>
          </div>

          <div className="score-bar-group">
            <div className="score-bar-label">
              <span>Skill Alignment (30%)</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>{skillScore}%</span>
            </div>
            <div className="score-bar-bg">
              <div 
                className="score-bar-fill" 
                style={{ 
                  width: `${skillScore}%`, 
                  background: 'var(--purple-grad)',
                  boxShadow: '0 0 8px rgba(177, 94, 251, 0.4)'
                }}
              />
            </div>
          </div>

          <div className="score-bar-group">
            <div className="score-bar-label">
              <span>Keyword Keyword Match (20%)</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>{keywordScore}%</span>
            </div>
            <div className="score-bar-bg">
              <div 
                className="score-bar-fill" 
                style={{ 
                  width: `${keywordScore}%`, 
                  background: 'var(--success-grad)',
                  boxShadow: '0 0 8px rgba(66, 245, 155, 0.4)'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
