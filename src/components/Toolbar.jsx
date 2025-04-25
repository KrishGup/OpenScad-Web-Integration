/**
 * Toolbar Component
 * 
 * A toolbar component that provides buttons for rendering, exporting, saving, and loading
 * OpenSCAD models. This component acts as the main control panel for the application.
 */
import { useState } from 'react';

/**
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onRender - Callback function called when the Render button is clicked
 * @param {Function} props.onExport - Callback function called when the Export STL button is clicked
 * @param {Function} props.onSave - Callback function called when the Save button is clicked
 * @param {Function} props.onLoad - Callback function called when a file is selected to load
 * @param {boolean} props.isRendering - Flag indicating if a rendering is in progress
 * @returns {JSX.Element} - Rendered component
 */
const Toolbar = ({ onRender, onExport, onSave, onLoad, isRendering }) => {
  // Toolbar container styling
  const toolbarStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    gap: '0.75rem',
    backgroundColor: '#333333',
    borderBottom: '1px solid #3c3c3c',
    height: '40px'
  };

  // Standard button styling
  const buttonStyle = {
    backgroundColor: '#1e1e1e',
    color: 'white',
    border: '1px solid #3c3c3c',
    borderRadius: '3px',
    padding: '0.25rem 0.75rem',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    height: '28px'
  };

  // Primary action button styling (Render)
  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#0e639c',
    borderColor: '#1177bb'
  };
  
  // Dropdown select styling
  const selectStyle = {
    backgroundColor: '#252526',
    color: 'white',
    border: '1px solid #3c3c3c',
    borderRadius: '3px',
    padding: '0.25rem 0.75rem',
    fontSize: '0.85rem',
    height: '28px'
  };

  return (
    <div style={toolbarStyle}>
      {/* Render button with loading indicator */}
      <button 
        style={primaryButtonStyle}
        onClick={onRender}
        disabled={isRendering}
      >
        {isRendering ? (
          <>
            <svg style={{ 
                animation: 'spin 1s linear infinite',
                marginRight: '0.5rem', 
                height: '0.85rem', 
                width: '0.85rem',
                color: 'white'
              }}
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Rendering...
          </>
        ) : (
          'Render'
        )}
      </button>
      
      {/* Export STL button - generates downloadable STL file */}
      <button 
        style={buttonStyle}
        onClick={onExport}
      >
        Export STL
      </button>
      
      {/* Save button - saves current code */}
      <button 
        style={buttonStyle}
        onClick={onSave}
      >
        Save
      </button>
      
      {/* Load button - styled as a label for the hidden file input */}
      <label style={{...buttonStyle, margin: 0}}>
        Load
        <input 
          type="file" 
          style={{ display: 'none' }}
          accept=".scad"
          onChange={onLoad}
        />
      </label>
      
      {/* Spacer to push the select to the right */}
      <div style={{ flex: 1 }}></div>
      
      {/* Examples dropdown menu */}
      <select style={selectStyle}>
        <option value="examples">Examples</option>
        <option value="cube">Cube</option>
        <option value="sphere">Sphere</option>
        <option value="cylinder">Cylinder</option>
        <option value="complex">Complex Example</option>
      </select>
    </div>
  );
};

export default Toolbar;