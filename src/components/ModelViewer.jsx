/**
 * ModelViewer Component
 * 
 * A 3D viewer component that renders STL models using Three.js and React Three Fiber.
 * This component provides a 3D view of OpenSCAD models with interactive camera controls.
 */
import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Center } from '@react-three/drei';
import { STLLoader } from 'three-stdlib';
import * as THREE from 'three';

/**
 * Component for loading and displaying an STL model
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.url - URL of the STL file to load
 * @param {Function} props.onLoad - Callback function called when the model loads successfully
 * @param {Function} props.onError - Callback function called when there's an error loading the model
 * @returns {JSX.Element|null} - Rendered component or null if loading/error
 */
function STLModel({ url, onLoad, onError }) {
  const [error, setError] = useState(null);
  const [geometry, setGeometry] = useState(null);
  
  useEffect(() => {
    if (!url) return;
    
    let isMounted = true;
    // Manually load STL instead of using useLoader to better handle errors
    const loader = new STLLoader();
    
    console.log('Loading STL from URL:', url);
    
    const abortController = new AbortController();
    const signal = abortController.signal;
    
    // First fetch the file to check if it exists
    fetch(url, { signal })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.arrayBuffer();
      })
      .then(buffer => {
        if (!isMounted) return;
        
        try {
          // Parse the STL file buffer
          const loadedGeometry = loader.parse(buffer);
          console.log('STL loaded and parsed successfully');
          setGeometry(loadedGeometry);
          setError(null);
          if (onLoad) onLoad();
        } catch (err) {
          console.error('Error parsing STL:', err);
          setError(err);
          if (onError) onError(err);
        }
      })
      .catch(err => {
        if (!isMounted) return;
        
        console.error('Error loading STL:', err);
        setError(err);
        if (onError) onError(err);
      });
    
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [url, onLoad, onError]);
  
  // If there's an error, render nothing (error will be shown elsewhere)
  if (error) {
    return null;
  }
  
  // If no geometry yet, render nothing
  if (!geometry) {
    return null;
  }
  
  // Calculate the proper scale for the model to fit nicely in view
  const boundingBox = new THREE.Box3().setFromObject(
    new THREE.Mesh(geometry)
  );
  const size = boundingBox.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? 10 / maxDim : 0.1;
  
  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} scale={scale} castShadow>
      <meshStandardMaterial color="#1e88e5" metalness={0.5} roughness={0.5} />
    </mesh>
  );
}

/**
 * Camera controller that resets the camera position when the model changes
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.modelUrl - URL of the currently loaded model
 * @returns {null} - This component doesn't render anything visible
 */
function CameraController({ modelUrl }) {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    if (modelUrl && controls) {
      // Reset camera position when model changes
      controls.reset();
    }
  }, [modelUrl, controls]);
  
  return null;
}

/**
 * Component that renders a grid and build plate for the 3D model
 * 
 * @component
 * @returns {JSX.Element} - Rendered component
 */
function BuildPlate() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial 
        color="#444444" 
        metalness={0.1} 
        roughness={0.8}
        side={THREE.DoubleSide}
      />
      <gridHelper 
        args={[200, 40, "#777777", "#555555"]} // Changed from [200, 200] to [200, 40] for larger squares
        position={[0, 0.01, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </mesh>
  );
}

/**
 * Component that renders a placeholder model when no STL is loaded
 * 
 * @component
 * @returns {JSX.Element} - Rendered component
 */
const PlaceholderModel = () => {
  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 10, 10]} />
        <meshStandardMaterial color="#1e88e5" wireframe opacity={0.5} transparent />
      </mesh>
    </group>
  );
};

/**
 * Main ModelViewer component that displays 3D STL models
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.modelUrl - URL of the STL model to display
 * @returns {JSX.Element} - Rendered component
 */
const ModelViewer = ({ modelUrl }) => {
  const containerStyle = {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  };

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
    justifyContent: 'space-between',
  };
  
  const viewerStyle = {
    width: '100%',
    flex: 1,
    backgroundColor: '#1e1e1e',
    position: 'relative',
  };
  
  const loadingStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
    fontSize: '1.2rem',
    background: 'rgba(0,0,0,0.7)',
    padding: '10px 20px',
    borderRadius: '4px',
    zIndex: 10,
  };
  
  const errorStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#ff6b6b',
    fontSize: '1rem',
    textAlign: 'center',
    maxWidth: '80%',
    background: 'rgba(0,0,0,0.7)',
    padding: '20px',
    borderRadius: '4px',
    zIndex: 10,
  };
  
  const retryButtonStyle = {
    background: '#3a86ff',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '15px',
    fontSize: '0.9rem',
  };
  
  const canvasContainerStyle = {
    width: '100%',
    height: '100%',
  };

  const [isLoading, setIsLoading] = useState(!!modelUrl);
  const [error, setError] = useState(null);
  const [modelKey, setModelKey] = useState(0); // Key used to force re-rendering the model
  
  /**
   * Handle successful model loading
   */
  const handleModelLoad = () => {
    setIsLoading(false);
    setError(null);
  };
  
  /**
   * Handle model loading errors
   * @param {Error} err - Error object
   */
  const handleModelError = (err) => {
    setIsLoading(false);
    setError(`Failed to load 3D model: ${err.message}`);
  };
  
  /**
   * Reset error and retry loading the model
   */
  const handleRetry = () => {
    if (modelUrl) {
      setIsLoading(true);
      setError(null);
      setModelKey(prev => prev + 1); // Change key to force re-render
    }
  };
  
  // Effect for handling model URL changes
  useEffect(() => {
    if (modelUrl) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsLoading(false);
    }
  }, [modelUrl]);
  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span>3D Viewer</span>
        {isLoading && <span style={{ fontSize: '0.7rem' }}>Loading...</span>}
      </div>
      <div style={viewerStyle}>
        {isLoading && (
          <div style={loadingStyle}>
            Loading 3D model...
          </div>
        )}
        
        {error && (
          <div style={errorStyle}>
            <div>{error}</div>
            <button style={retryButtonStyle} onClick={handleRetry}>
              Retry
            </button>
          </div>
        )}
        
        <div style={canvasContainerStyle}>
          <Canvas
            shadows
            camera={{ position: [30, 30, 30], fov: 50 }}
            gl={{ antialias: true }}
          >
            <PerspectiveCamera makeDefault position={[30, 30, 30]} />
            <OrbitControls 
              enableDamping 
              dampingFactor={0.1} 
              makeDefault
            />
            <CameraController modelUrl={modelUrl} />
            
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight 
              position={[10, 10, 10]} 
              intensity={1} 
              castShadow 
              shadow-mapSize={[2048, 2048]}
            />
            
            {/* Build plate - replaces the old grid */}
            <BuildPlate />
            
            {/* Center and load the STL if URL is provided */}
            <Center>
              {!error && modelUrl ? (
                <STLModel 
                  key={modelKey} 
                  url={modelUrl} 
                  onLoad={handleModelLoad}
                  onError={handleModelError}
                />
              ) : (
                <PlaceholderModel />
              )}
            </Center>
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default ModelViewer;