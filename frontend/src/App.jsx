import React, { useState, useEffect } from 'react';
import ResumeUploader from './components/ResumeUploader';
import JobDescriptionInput from './components/JobDescriptionInput';
import ScoreCard from './components/ScoreCard';
import SkillsList from './components/SkillsList';
import SkillGapChart from './components/SkillGapChart';
import SuggestionsPanel from './components/SuggestionsPanel';
import HistorySidebar from './components/HistorySidebar';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

export default function App() {
  // Input states
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobs, setJobs] = useState([{ id: 1, title: 'Job Description 1', text: '' }]);
  const [activeJobIndex, setActiveJobIndex] = useState(0);

  // App UI states
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [activeView, setActiveView] = useState('analyze'); // 'analyze' or 'compare'
  
  // Results states
  const [result, setResult] = useState(null);
  const [compareResults, setCompareResults] = useState(null);

  // History states
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  // Fetch analysis history on startup
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history`);
      if (response.ok) {
        const data = await response.json();
        setHistoryList(data);
      }
    } catch (e) {
      console.error('Failed to fetch history:', e);
    }
  };

  const simulateLoading = (callback) => {
    setLoading(true);
    const steps = [
      { text: 'Extracting text from resume...', delay: 0 },
      { text: 'Analyzing resume vocabulary and structure...', delay: 800 },
      { text: 'Extracting professional skills...', delay: 1600 },
      { text: 'Matching semantic embeddings...', delay: 2400 },
      { text: 'Generating improvement recommendations...', delay: 3200 }
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setLoadingStep(step.text);
      }, step.delay);
    });

    setTimeout(() => {
      callback();
    }, 4000);
  };

  const handleAnalyze = () => {
    if (!selectedFile) {
      alert("Please upload a resume first!");
      return;
    }

    // Check if we are doing single match or multiple comparison
    const activeJobsWithText = jobs.filter(j => j.text.trim().length > 0);
    
    if (activeJobsWithText.length === 0) {
      alert("Please paste a job description!");
      return;
    }

    if (activeJobsWithText.length === 1) {
      // Single Job Analysis
      const jobText = activeJobsWithText[0].text;
      
      simulateLoading(async () => {
        try {
          const formData = new FormData();
          formData.append('file', selectedFile);
          formData.append('job_description', jobText);

          const response = await fetch(`${API_BASE_URL}/api/analyzer/analyze`, {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Analysis failed');
          }

          const data = await response.json();
          setResult(data);
          setCompareResults(null);
          setActiveView('analyze');
          fetchHistory(); // Refresh history sidebar
        } catch (err) {
          alert(`Error: ${err.message}`);
        } finally {
          setLoading(false);
          setLoadingStep('');
        }
      });
    } else {
      // Multiple Jobs Comparison Mode
      const jobTexts = jobs.map(j => j.text);
      
      simulateLoading(async () => {
        try {
          const formData = new FormData();
          formData.append('file', selectedFile);
          formData.append('job_descriptions_json', JSON.stringify(jobTexts));

          const response = await fetch(`${API_BASE_URL}/api/analyzer/analyze-multiple`, {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Comparison failed');
          }

          const data = await response.json();
          setCompareResults(data.comparisons);
          setResult(null);
          setActiveView('compare');
          fetchHistory(); // Refresh history
        } catch (err) {
          alert(`Error: ${err.message}`);
        } finally {
          setLoading(false);
          setLoadingStep('');
        }
      });
    }
  };

  const handleSelectHistory = async (analysisId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history/${analysisId}`);
      if (!response.ok) throw new Error('Failed to load item');
      
      const data = await response.json();
      
      // Load selected analysis into result view
      setResult(data.result);
      setCompareResults(null);
      setActiveView('analyze');
      
      // Load text and filename back to inputs so user can modify and analyze again
      setJobs([{ id: 1, title: 'Job Description 1', text: data.job_description }]);
      setActiveJobIndex(0);
      
      // Mock File object for uploader badge
      setSelectedFile({
        name: data.filename,
        size: 0, // Placeholder
        mock: true
      });
      
      setHistoryOpen(false); // Close sidebar
    } catch (e) {
      alert(`Error loading history record: ${e.message}`);
    }
  };

  const handleDeleteHistory = async (analysisId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history/${analysisId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchHistory(); // Refresh list
        
        // If the current loaded result was deleted, clear it
        if (result && result.analysis_id === analysisId) {
          setResult(null);
        }
      }
    } catch (e) {
      console.error('Failed to delete history item:', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </div>
          <div className="logo-text">
            <h1>Resume Analyzer</h1>
            <span>AI Job Fit & ATS Matcher</span>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-glass" onClick={() => setHistoryOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.25rem' }}>
              <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
            </svg>
            History
          </button>
          
          {(result || compareResults) && (
            <button className="btn-glass active" onClick={handlePrint}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.25rem' }}>
                <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
              </svg>
              Export Report
            </button>
          )}
        </div>
      </header>

      {/* Main View */}
      <main className={`main-content ${loading || result || compareResults ? 'full-width' : ''}`}>
        
        {/* Loading overlay */}
        {loading ? (
          <div className="glass-card">
            <div className="loading-container">
              <div className="loader-ring" />
              <div className="loading-text">Analyzing Candidate-Job Fit</div>
              <div className="loading-subtext">{loadingStep}</div>
            </div>
          </div>
        ) : (
          <>
            {/* Input Phase (Only show if no results loaded) */}
            {!result && !compareResults && (
              <>
                <div className="glass-card">
                  <div className="card-title-container">
                    <h3 className="card-title">
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16h6v-6H9v6zm3-14C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                      </svg>
                      1. Upload Profile
                    </h3>
                  </div>
                  <ResumeUploader 
                    selectedFile={selectedFile} 
                    setSelectedFile={setSelectedFile} 
                  />
                </div>

                <div className="glass-card">
                  <div className="card-title-container">
                    <h3 className="card-title">
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                      2. Match Details
                    </h3>
                  </div>
                  <JobDescriptionInput 
                    jobs={jobs}
                    setJobs={setJobs}
                    activeJobIndex={activeJobIndex}
                    setActiveJobIndex={setActiveJobIndex}
                  />
                  <button 
                    className="btn-submit" 
                    onClick={handleAnalyze}
                    disabled={!selectedFile || jobs[activeJobIndex]?.text.trim().length === 0}
                  >
                    Analyze Match
                  </button>
                </div>
              </>
            )}

            {/* Single Analysis Result View */}
            {result && activeView === 'analyze' && (
              <div className="dashboard-grid">
                
                {/* Reset button to do another analysis */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    className="btn-glass"
                    onClick={() => {
                      setResult(null);
                      setCompareResults(null);
                    }}
                  >
                    ← Back to Upload
                  </button>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>File:</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#00f2fe' }}>{selectedFile?.name || result.filename}</span>
                  </div>
                </div>

                {/* Score breakdown & gauge */}
                <ScoreCard 
                  score={result.match_score}
                  semanticScore={result.semantic_score}
                  skillScore={result.skill_score}
                  keywordScore={result.keyword_score}
                />

                {/* Skill comparison grid & SVG gap visualization */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
                  <SkillsList 
                    matchedSkills={result.matched_skills}
                    missingSkills={result.missing_skills}
                    resumeSkills={result.resume_skills || []}
                  />
                  <SkillGapChart 
                    score={result.match_score}
                    semanticScore={result.semantic_score}
                    skillScore={result.skill_score}
                    keywordScore={result.keyword_score}
                  />
                </div>

                {/* Suggestions and resume tips */}
                <SuggestionsPanel 
                  suggestions={result.suggestions}
                  experienceYears={result.experience_years}
                  education={result.education}
                />
              </div>
            )}

            {/* Multiple Job Comparison View */}
            {compareResults && activeView === 'compare' && (
              <div className="compare-container">
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    className="btn-glass"
                    onClick={() => {
                      setResult(null);
                      setCompareResults(null);
                    }}
                  >
                    ← Back to Upload
                  </button>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Comparing: <strong style={{ color: '#00f2fe' }}>{selectedFile?.name}</strong> against {jobs.length} jobs
                  </span>
                </div>

                <div className="compare-grid">
                  {/* Sort results by score descending */}
                  {[...compareResults]
                    .sort((a, b) => b.match_score - a.match_score)
                    .map((item, idx) => {
                      const jobDetails = jobs[item.job_description_index];
                      const scoreThemeColor = item.match_score >= 70 ? '#00d285' : item.match_score >= 45 ? '#f59e0b' : '#ef4444';
                      
                      return (
                        <div key={idx} className="compare-card">
                          <span className="compare-rank-badge">Rank #{idx + 1}</span>
                          
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.5rem', textAlign: 'center' }}>
                            {jobDetails?.title || `Job Description ${item.job_description_index + 1}`}
                          </h3>
                          
                          <div className="compare-score-circle" style={{ borderColor: scoreThemeColor }}>
                            <span className="compare-score-num" style={{ color: scoreThemeColor }}>{item.match_score}%</span>
                            <span className="compare-score-lbl">Match</span>
                          </div>

                          <div className="compare-skills-summary">
                            <div className="compare-stat-row">
                              <span className="compare-stat-lbl">Matched Skills:</span>
                              <span className="compare-stat-val match">{item.matched_skills.length}</span>
                            </div>
                            <div className="compare-stat-row">
                              <span className="compare-stat-lbl">Missing Skills:</span>
                              <span className="compare-stat-val missing">{item.missing_skills.length}</span>
                            </div>
                            <div className="compare-stat-row">
                              <span className="compare-stat-lbl">Semantic Match:</span>
                              <span className="compare-stat-val">{item.semantic_score}%</span>
                            </div>
                          </div>

                          <button 
                            className="btn-glass" 
                            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
                            onClick={() => {
                              // Expand this particular job's detailed analysis
                              setResult(item);
                              setActiveView('analyze');
                            }}
                          >
                            View Full Report
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* History Slide-out Drawer */}
      <HistorySidebar 
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        historyList={historyList}
        onSelectHistory={handleSelectHistory}
        onDeleteHistory={handleDeleteHistory}
      />
    </div>
  );
}
