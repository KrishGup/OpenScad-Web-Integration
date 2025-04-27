/**
 * OpenSCAD Web Integration - Main Application
 * 
 * This is the main application component that integrates all other components
 * and provides the core functionality of the OpenSCAD Web Integration tool.
 * It handles code editing, rendering, exporting, saving, and loading OpenSCAD models.
 */
import { useState, useCallback, useEffect } from 'react'
import './App.css'
import CodeEditor from './components/CodeEditor'
import ModelViewer from './components/ModelViewer'
import Toolbar from './components/Toolbar'
import openscadService from './services/openscadService'

// Default OpenSCAD example code that is loaded when the application starts
const DEFAULT_CODE = `// OpenSCAD Example
cube([20, 20, 20], center = true);
translate([15, 15, 0])
  sphere(10);
`;

/**
 * Main Application Component
 * 
 * @component
 * @returns {JSX.Element} - Rendered application
 */
function App() {
  // State for storing the current OpenSCAD code
  const [code, setCode] = useState(DEFAULT_CODE);
  
  // State for tracking if a rendering operation is in progress
  const [isRendering, setIsRendering] = useState(false);
  
  // State for storing any error messages
  const [error, setError] = useState(null);
  
  // State for storing the URL to the rendered STL model
  const [modelUrl, setModelUrl] = useState(null);
  
  // State for storing the STL data when exporting
  const [stlData, setStlData] = useState(null);

  /**
   * Handle changes to the OpenSCAD code in the editor
   * 
   * @param {string} newCode - The updated OpenSCAD code
   */
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
    setError(null);
  }, []);

  /**
   * Handle rendering the OpenSCAD code by sending it to the backend
   * and updating the 3D model viewer with the result
   */
  const handleRender = useCallback(async () => {
    setIsRendering(true);
    setError(null);
    
    try {
      // Call the OpenSCAD service to render a 3D model
      const result = await openscadService.renderPreview(code);
      
      if (result.success) {
        // Get the base URL from environment variable or use localhost default
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const stlUrl = `${baseUrl}${result.stlPath}`;
        console.log("Model URL set to:", stlUrl);
        setModelUrl(stlUrl);
      } else {
        setError(result.error);
        setModelUrl(null);
      }
    } catch (err) {
      console.error('Error during rendering:', err);
      setError(err.message || 'Error during rendering');
      setModelUrl(null);
    } finally {
      setIsRendering(false);
    }
  }, [code]);

  /**
   * Handle exporting the current OpenSCAD code as an STL file for download
   */
  const handleExport = useCallback(async () => {
    if (!code) {
      setError('No code to export');
      return;
    }
    
    setIsRendering(true);
    setError(null);
    
    try {
      // Call the OpenSCAD service to convert to STL
      const result = await openscadService.convertToSTL(code);
      
      if (result.success) {
        // Create a download link for the STL file
        const url = URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'model.stl';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Error exporting STL');
    } finally {
      setIsRendering(false);
    }
  }, [code]);

  /**
   * Handle saving the current OpenSCAD code as a .scad file
   */
  const handleSave = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'model.scad';
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code]);

  /**
   * Handle loading a .scad file from the user's filesystem
   * 
   * @param {Event} event - The file input change event
   */
  const handleLoad = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setCode(content);
    };
    reader.readAsText(file);
  }, []);

  // Auto-render when the app first loads
  useEffect(() => {
    handleRender();
  }, []);

  // Application layout styles
  const appStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: '#1e1e1e',
    color: 'white',
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  };

  const headerStyle = {
    padding: '0.5rem 1rem',
    backgroundColor: '#252526',
    borderBottom: '1px solid #3c3c3c',
    height: '40px',
    display: 'flex',
    alignItems: 'center'
  };

  const errorStyle = {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc2626',
    color: 'white'
  };

  const mainContentStyle = {
    flex: 1,
    display: 'flex',
    overflow: 'hidden'
  };

  const panelStyle = {
    width: '50%',
    borderRight: '1px solid #3c3c3c',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <div style={appStyle}>
      {/* Application header */}
      <div style={headerStyle}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>OpenSCAD Web Editor</h1>
      </div>
      
      {/* Toolbar with action buttons */}
      <Toolbar 
        onRender={handleRender}
        onExport={handleExport}
        onSave={handleSave}
        onLoad={handleLoad}
        isRendering={isRendering}
      />
      
      {/* Error message display */}
      {error && (
        <div style={errorStyle}>
          Error: {error}
        </div>
      )}
      
      {/* Main content area with code editor and 3D viewer */}
      <div style={mainContentStyle}>
        {/* Left panel with code editor */}
        <div style={panelStyle}>
          <CodeEditor initialCode={code} onChange={handleCodeChange} />
        </div>
        
        {/* Right panel with 3D model viewer */}
        <div style={{ width: '50%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ModelViewer modelUrl={modelUrl} />
        </div>
      </div>
    </div>
  )
}

export default App
