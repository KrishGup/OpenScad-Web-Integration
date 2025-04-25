/**
 * CodeEditor Component
 * 
 * A simple text editor component that allows users to write and edit OpenSCAD code.
 * This component provides a styled text area with OpenSCAD syntax highlighting.
 */
import { useState, useEffect } from 'react';

/**
 * @component
 * @param {Object} props - Component props
 * @param {string} props.initialCode - Initial code to display in the editor
 * @param {Function} props.onChange - Callback function called when code changes
 * @returns {JSX.Element} - Rendered component
 */
const CodeEditor = ({ initialCode = '', onChange }) => {
  const [code, setCode] = useState(initialCode);

  // Call the onChange callback whenever the code changes
  useEffect(() => {
    if (onChange) {
      onChange(code);
    }
  }, [code, onChange]);

  // Editor container styles
  const containerStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  };

  // Editor header styles
  const headerStyle = {
    fontSize: '0.85rem',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    backgroundColor: '#252526',
    color: 'white',
    borderBottom: '1px solid #3c3c3c',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
  };

  // Editor textarea styles
  const textareaStyle = {
    width: '100%',
    height: '100%',
    padding: '1rem',
    paddingLeft: '1.5rem',
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    fontSize: '14px',
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    resize: 'none',
    outline: 'none',
    border: 'none',
    lineHeight: '1.5',
    flex: 1,
    overflow: 'auto',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        OpenSCAD Editor
      </div>
      <textarea
        style={textareaStyle}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter your OpenSCAD code here..."
        spellCheck="false"
      />
    </div>
  );
};

export default CodeEditor;