import React, { useState, useRef } from 'react';

export default function ResumeUploader({ selectedFile, setSelectedFile }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.md'];
    const filename = file.name.lowerCase ? file.name.lowerCase() : file.name.toLowerCase();
    const isAllowed = allowedExtensions.some(ext => filename.endsWith(ext));
    
    if (isAllowed) {
      setSelectedFile(file);
    } else {
      alert("Unsupported file format! Please upload a PDF, DOCX, TXT, or MD file.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const openFileInput = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">Upload Resume</label>
      
      {!selectedFile ? (
        <div 
          className={`uploader-box ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileInput}
        >
          <input 
            ref={inputRef}
            type="file" 
            style={{ display: 'none' }} 
            onChange={handleChange}
            accept=".pdf,.docx,.doc,.txt,.md"
          />
          <div className="upload-icon-wrapper">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Drag & drop your resume here</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>or click to browse files</p>
          </div>
          <span className="file-spec-text">Supports PDF, DOCX, TXT, or MD (Max 10MB)</span>
        </div>
      ) : (
        <div className="uploaded-file-badge">
          <div className="file-info">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            <span className="file-name-txt" title={selectedFile.name}>{selectedFile.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>
              ({(selectedFile.size / 1024).toFixed(0)} KB)
            </span>
          </div>
          <button className="btn-remove-file" onClick={removeFile} title="Remove file">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
