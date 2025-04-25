# OpenSCAD Web Integration

A web-based editor and renderer for OpenSCAD models using React for the frontend and Python Flask for the backend, enabling users to create, edit, and render OpenSCAD models directly in the browser.

## Features

- Edit OpenSCAD code in a web browser interface
- Real-time 3D rendering of OpenSCAD models 
- Export models as STL files for 3D printing
- Upload and use custom OpenSCAD libraries
- Integration with actual OpenSCAD executable for accurate rendering
- Cross-platform support (Windows and Linux)

## Architecture Overview

This application consists of two main components:

1. **Frontend**: A React application built with Vite that provides the user interface for editing OpenSCAD code and viewing the rendered 3D models.

2. **Backend**: A Python Flask API that communicates with the OpenSCAD executable to render models and return STL files.

## Project Structure

```
├── api/                      # Backend Flask API
│   ├── app.py                # Main API implementation
│   ├── Dockerfile            # Docker configuration for the backend
│   ├── requirements.txt      # Python dependencies
│   ├── bin/                  # OpenSCAD binaries (not included in repository)
│   │   ├── openscad.AppImage # Linux OpenSCAD binary (download separately)
│   │   └── openscad.exe      # Windows OpenSCAD binary (download separately)
│   └── libraries/            # Custom OpenSCAD libraries
│       └── ub.scad           # Example library
├── public/                   # Static frontend assets
├── src/                      # React frontend source code
│   ├── components/           # React components
│   │   ├── CodeEditor.jsx    # Code editing component
│   │   ├── ModelViewer.jsx   # 3D model viewing component
│   │   └── Toolbar.jsx       # Application toolbar
│   ├── services/             
│   │   └── openscadService.js # Service for API communication
│   ├── App.jsx               # Main application component
│   └── main.jsx              # Application entry point
├── Dockerfile                # Docker configuration for production
├── docker-compose.yml        # Docker Compose configuration
├── nginx.conf                # Nginx configuration for production
├── vite.config.js            # Vite configuration
└── package.json              # Frontend dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+ (for backend)
- OpenSCAD (binaries need to be downloaded separately - see below)

### Required OpenSCAD Binaries

Due to GitHub file size limitations, the OpenSCAD binaries are not included in this repository. You need to download them separately:

1. Create a directory `api/bin` if it doesn't exist already
2. Download the appropriate binary for your operating system:
   - **Windows**: Download `openscad.exe` from the [OpenSCAD website](https://openscad.org/downloads.html) and place it in the `api/bin` directory
   - **Linux**: Download the `openscad.AppImage` from the [OpenSCAD website](https://openscad.org/downloads.html), make it executable with `chmod +x openscad.AppImage`, and place it in the `api/bin` directory
   
   *Note for full functionality and support with third party libraries scroll down and select a [Snapshot Release](https://openscad.org/downloads.html#snapshots) as certain libraries make use of newer features not currently present in the latest 2021 full release.

### Setting Up and Running the Frontend

1. Clone the repository:
   ```bash
   git clone https://github.com/KrishGup/OpenScad-Web-Integration.git
   cd OpenScad-Web-Integration
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

### Setting Up and Running the Backend

1. Navigate to the API directory:
   ```bash
   cd api
   ```

2. Create a Python virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Download the OpenSCAD binaries as described in the "Required OpenSCAD Binaries" section above.

5. Start the Flask API server:
   ```bash
   python app.py
   ```

6. The API will be available at http://localhost:5000

### Using Docker (Note: Currently has some issues)

The project includes Docker configuration for both development and production environments. Note that there are some known issues with the Docker setup that will be addressed in future updates.

To start the containers (for reference only):

```bash
docker-compose up
```

Important: If using Docker, you still need to ensure the OpenSCAD binaries are present in the `api/bin` directory before building the Docker images.

## How It Works

1. **User Interface**: The frontend provides a code editor for writing OpenSCAD code and a 3D viewer for displaying the rendered models.
   
2. **Rendering Process**:
   - When a user writes OpenSCAD code in the editor, it's sent to the backend API.
   - The API saves the code to a temporary file and runs the OpenSCAD executable on it.
   - OpenSCAD converts the code to an STL 3D model file.
   - The backend sends the path to the STL file back to the frontend.
   - The frontend fetches and renders the STL file in the 3D viewer.

3. **Library Support**: Users can upload custom OpenSCAD libraries that will be available for use in their code.

## API Endpoints

- `GET /api/hello` - Health check endpoint
- `POST /api/render` - Render OpenSCAD code and return STL path
- `POST /api/getstl` - Generate and download STL file
- `GET /api/view3d` - View a specific STL file
- `POST /api/upload-library` - Upload a custom OpenSCAD library

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
