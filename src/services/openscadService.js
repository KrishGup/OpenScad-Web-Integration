/**
 * OpenSCAD Service
 * 
 * This service handles all communication with the backend API for OpenSCAD operations.
 * It provides methods for rendering OpenSCAD code and generating downloadable STL files.
 */

// Base URL for the API backend - use environment variable if available, otherwise default to localhost
const BASE_URL = import.meta.env.VITE_API_URL ? 
  `${import.meta.env.VITE_API_URL}/api` : 
  'http://localhost:5000/api';

class OpenSCADService {
  constructor() {
    this.currentCode = '';
  }

  /**
   * Renders OpenSCAD code on the server and returns a path to the generated STL file
   * 
   * @param {string} code - The OpenSCAD code to render
   * @returns {Promise<Object>} - Object containing success status and STL path or error
   */
  async renderPreview(code) {
    try {
      const response = await fetch(`${BASE_URL}/render`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scadCode: code }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error rendering SCAD: ${errorText}`);
      }

      // Handle the JSON response that now contains STL path
      const data = await response.json();
      
      return {
        success: true,
        stlPath: data.stlPath
      };
    } catch (error) {
      console.error('Error rendering SCAD:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Converts OpenSCAD code to a downloadable STL file
   * 
   * @param {string} code - The OpenSCAD code to convert
   * @returns {Promise<Object>} - Object containing success status and the STL data blob or error
   */
  async convertToSTL(code) {
    try {
      this.currentCode = code;
      
      const response = await fetch(`${BASE_URL}/getstl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scadCode: code }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error converting to STL: ${errorText}`);
      }

      // Get the STL file as a blob
      const blob = await response.blob();
      
      return {
        success: true,
        message: 'STL generated successfully',
        data: blob
      };
    } catch (error) {
      console.error('Error converting to STL:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Converts a relative API path to a full URL
   * 
   * @param {string} path - The relative path from the API
   * @returns {string|null} - The full URL or null if no path provided
   */
  getFullUrl(path) {
    // Convert relative URL to full URL with proper base
    if (!path) return null;
    
    // Check if the path already has the base URL
    if (path.startsWith('http')) {
      return path;
    }
    
    // Replace /api/ with the actual API base URL
    if (path.startsWith('/api/')) {
      return `${BASE_URL}${path.substring(4)}`;
    }
    
    return `${BASE_URL}${path}`;
  }
}

export default new OpenSCADService();