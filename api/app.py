import os
import subprocess
import tempfile
import logging
import platform
import base64
import json
import mimetypes
import uuid
import shutil
from pathlib import Path
from flask import Flask, jsonify, request, send_file, after_this_request
from flask_restful import Api, Resource
from flask_cors import CORS, cross_origin
import sys

# Initialize Flask application with RESTful API and CORS support
app = Flask(__name__)
api = Api(app)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)

# Set the OpenSCAD path based on the platform
if platform.system() == 'Windows':
    # On Windows, use the Windows executable
    OPENSCAD_PATH = './bin/openscad.exe'
else:
    # In Docker (Linux), use the installed OpenSCAD from the container
    OPENSCAD_PATH = '/usr/local/bin/openscad'

# Log the selected OpenSCAD path
logging.info(f"Using OpenSCAD at: {OPENSCAD_PATH}")

# Create a persistent directory for storing models
MODELS_DIR = os.path.join(tempfile.gettempdir(), 'openscad_models')
os.makedirs(MODELS_DIR, exist_ok=True)
logging.info(f"Using models directory: {MODELS_DIR}")

# Set up libraries directory for OpenSCAD includes
LIBRARIES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'libraries')
os.makedirs(LIBRARIES_DIR, exist_ok=True)
logging.info(f"Using libraries directory: {LIBRARIES_DIR}")

# Store rendered STL file paths
stl_cache = {}

class HelloWorld(Resource):
    """API health check endpoint."""
    def get(self):
        """Return a simple message to confirm API is running."""
        return {"message": "OpenSCAD API is running!"}

class RenderScad(Resource):
    """Renders OpenSCAD code and returns path to the generated STL file."""
    def post(self):
        """
        Process OpenSCAD code to generate an STL file.
        
        Expected JSON payload:
        {
            "scadCode": "... OpenSCAD code ..."
        }
        
        Returns:
        {
            "stlPath": "/api/view3d?file=filename.stl"
        }
        """
        data = request.get_json()
        scad_code = data['scadCode']
        
        # Create unique filenames with UUID to avoid conflicts
        model_id = str(uuid.uuid4())
        model_dir = os.path.join(MODELS_DIR, model_id)
        os.makedirs(model_dir, exist_ok=True)
        
        scad_file_path = os.path.join(model_dir, f"{model_id}.scad")
        stl_file_path = os.path.join(model_dir, f"{model_id}.stl")
        
        # Copy all library files to the model directory so OpenSCAD can find them
        for lib_file in os.listdir(LIBRARIES_DIR):
            if lib_file.endswith('.scad'):
                src_path = os.path.join(LIBRARIES_DIR, lib_file)
                dst_path = os.path.join(model_dir, lib_file)
                shutil.copy2(src_path, dst_path)
                logging.info(f"Copied library file: {lib_file} to {dst_path}")
        
        # Write SCAD code to file
        with open(scad_file_path, 'w', encoding='utf-8') as scad_file:
            scad_file.write(scad_code)
        
        try:
            # Run OpenSCAD to generate STL
            logging.info(f"Generating STL file at: {stl_file_path}")
            result = subprocess.run(
                [OPENSCAD_PATH, '-o', stl_file_path, scad_file_path], 
                check=True, 
                capture_output=True, 
                text=True
            )
            logging.info(f"OpenSCAD output: {result.stdout}")
            
            # Store the file path in cache with the model_id as key
            stl_basename = os.path.basename(stl_file_path)
            stl_cache[stl_basename] = stl_file_path
            
            # Verify the STL file was created
            if not os.path.exists(stl_file_path):
                logging.error(f"STL file was not created at {stl_file_path}")
                return {"error": "Failed to generate STL file"}, 500
                
            logging.info(f"STL file created successfully: {stl_file_path}")
            
            # Return the STL file path for 3D rendering with /api/ prefix
            return {"stlPath": f"/api/view3d?file={stl_basename}"}
        except FileNotFoundError:
            logging.error("OpenSCAD executable not found. Ensure it is installed and in the system's PATH.")
            return {"error": "OpenSCAD executable not found"}, 500
        except subprocess.CalledProcessError as e:
            logging.error(f"OpenSCAD process failed: {e.stderr}")
            return {"error": "OpenSCAD process failed", "details": e.stderr}, 500
        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return {"error": f"Unexpected error: {str(e)}"}, 500

class GetStl(Resource):
    """Generates and provides an STL file for download."""
    def post(self):
        """
        Process OpenSCAD code and return the generated STL file for download.
        
        Expected JSON payload:
        {
            "scadCode": "... OpenSCAD code ..."
        }
        
        Returns:
        The STL file as an attachment for download.
        """
        data = request.get_json()
        scad_code = data['scadCode']
        
        # Create unique filenames with UUID to avoid conflicts
        model_id = str(uuid.uuid4())
        model_dir = os.path.join(MODELS_DIR, model_id)
        os.makedirs(model_dir, exist_ok=True)
        
        scad_file_path = os.path.join(model_dir, f"{model_id}.scad")
        stl_file_path = os.path.join(model_dir, f"{model_id}.stl")
        
        # Copy all library files to the model directory so OpenSCAD can find them
        for lib_file in os.listdir(LIBRARIES_DIR):
            if lib_file.endswith('.scad'):
                src_path = os.path.join(LIBRARIES_DIR, lib_file)
                dst_path = os.path.join(model_dir, lib_file)
                shutil.copy2(src_path, dst_path)
                logging.info(f"Copied library file: {lib_file} to {dst_path}")
        
        # Write SCAD code to file
        with open(scad_file_path, 'w', encoding='utf-8') as scad_file:
            scad_file.write(scad_code)
        
        try:
            # Run OpenSCAD to generate STL
            result = subprocess.run(
                [OPENSCAD_PATH, '-o', stl_file_path, scad_file_path], 
                check=True, 
                capture_output=True, 
                text=True
            )
            logging.info(f"OpenSCAD output: {result.stdout}")
            
            # Verify the STL file was created
            if not os.path.exists(stl_file_path):
                logging.error(f"STL file was not created at {stl_file_path}")
                return {"error": "Failed to generate STL file"}, 500
        except FileNotFoundError:
            logging.error("OpenSCAD executable not found. Ensure it is installed and in the system's PATH.")
            return {"error": "OpenSCAD executable not found"}, 500
        except subprocess.CalledProcessError as e:
            logging.error(f"OpenSCAD process failed: {e.stderr}")
            return {"error": "OpenSCAD process failed", "details": e.stderr}, 500
        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return {"error": f"Unexpected error: {str(e)}"}, 500
        
        # Return the generated STL file
        return send_file(stl_file_path, mimetype='application/octet-stream', 
                         as_attachment=True, download_name='model.stl')

class View3D(Resource):
    """Serves STL files for viewing in the browser."""
    @cross_origin()
    def get(self):
        """
        Return an STL file for 3D viewing in the browser.
        
        Expected URL parameter:
        file: name of the STL file to view
        
        Returns:
        The STL file with proper MIME type for rendering.
        """
        filename = request.args.get('file')
        if not filename or not filename.endswith('.stl'):
            logging.error(f"Invalid file parameter: {filename}")
            return {"error": "Invalid file parameter"}, 400
        
        # Check if the file is in our cache
        if filename in stl_cache:
            stl_file_path = stl_cache[filename]
            logging.info(f"File found in cache: {stl_file_path}")
        else:
            # Fallback to models directory if not in cache
            # Look through all subdirectories in MODELS_DIR
            for root, dirs, files in os.walk(MODELS_DIR):
                if filename in files:
                    stl_file_path = os.path.join(root, filename)
                    logging.info(f"Found file in models subdirectory: {stl_file_path}")
                    break
            else:
                stl_file_path = os.path.join(MODELS_DIR, filename)
                logging.info(f"Looking for file in models directory: {stl_file_path}")
        
        if not os.path.exists(stl_file_path):
            # Log all files in the directory to help debug
            logging.error(f"File not found: {stl_file_path}")
            try:
                dir_contents = os.listdir(MODELS_DIR)
                logging.info(f"Files in models directory: {dir_contents}")
                # Also list all subdirectories
                for dir_path in os.listdir(MODELS_DIR):
                    full_path = os.path.join(MODELS_DIR, dir_path)
                    if os.path.isdir(full_path):
                        sub_contents = os.listdir(full_path)
                        logging.info(f"Files in subdirectory {dir_path}: {sub_contents}")
            except Exception as e:
                logging.error(f"Error listing directory contents: {str(e)}")
            return {"error": "File not found"}, 404
            
        try:
            # Log file details
            file_size = os.path.getsize(stl_file_path)
            logging.info(f"Serving STL file: {stl_file_path}, size: {file_size} bytes")
            
            # Set proper MIME type and headers for STL files
            @after_this_request
            def add_header(response):
                response.headers['Access-Control-Allow-Origin'] = '*'
                response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
                response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
                response.headers['Content-Type'] = 'model/stl'
                return response
                
            # Return the STL file for display
            return send_file(stl_file_path, 
                             mimetype='model/stl',
                             as_attachment=False)
        except Exception as e:
            logging.error(f"Error serving STL file: {str(e)}")
            return {"error": f"Error serving STL file: {str(e)}"}, 500

class UploadLibrary(Resource):
    """Handles uploads of custom OpenSCAD library files."""
    def post(self):
        """
        Upload a custom OpenSCAD library (.scad file)
        
        Expected form data:
        file: The .scad file to upload
        
        Returns:
        {
            "success": true,
            "message": "Library file uploaded successfully"
        }
        """
        if 'file' not in request.files:
            return {"error": "No file part in the request"}, 400
            
        file = request.files['file']
        if file.filename == '':
            return {"error": "No file selected"}, 400
            
        if not file.filename.endswith('.scad'):
            return {"error": "Only .scad files are allowed"}, 400
            
        try:
            # Save the library file
            filename = file.filename
            file_path = os.path.join(LIBRARIES_DIR, filename)
            file.save(file_path)
            logging.info(f"Uploaded library file: {filename}")
            
            return {"success": True, "message": f"Library file {filename} uploaded successfully"}
        except Exception as e:
            logging.error(f"Error uploading library file: {str(e)}")
            return {"error": f"Error uploading library file: {str(e)}"}, 500

# Register routes
api.add_resource(HelloWorld, '/api/hello')
api.add_resource(RenderScad, '/api/render')
api.add_resource(GetStl, '/api/getstl')
api.add_resource(View3D, '/api/view3d')
api.add_resource(UploadLibrary, '/api/upload-library')

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)