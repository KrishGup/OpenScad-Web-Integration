FROM python:3.11-slim

WORKDIR /app

# Install dependencies needed for OpenSCAD to run headless
RUN apt-get update && apt-get install -y \
    wget \
    xvfb \
    libgl1-mesa-glx \
    libfontconfig1 \
    libx11-xcb1 \
    libdbus-1-3 \
    libxrender1 \
    libxi6 \
    libxkbcommon0 \
    libxkbcommon-x11-0 \
    fuse \
    libfuse2 \
    libharfbuzz0b \
    libegl1 \
    libopengl0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set up OpenSCAD with architecture detection for x86_64 or ARM
RUN if [ ! -f /usr/local/bin/openscad ]; then \
    echo "OpenSCAD not found, downloading..."; \
    ARCH=$(uname -m); \
    if [ "$ARCH" = "x86_64" ]; then \
        echo "Detected x86_64 architecture"; \
        wget -q https://files.openscad.org/snapshots/OpenSCAD-2025.04.13.ai24871-x86_64.AppImage -O /usr/local/bin/openscad; \
    elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then \
        echo "Detected ARM architecture"; \
        wget -q https://files.openscad.org/snapshots/OpenSCAD-2023.09.11.ai-aarch64.AppImage -O /usr/local/bin/openscad; \
    else \
        echo "Unsupported architecture: $ARCH"; \
        exit 1; \
    fi; \
    chmod +x /usr/local/bin/openscad; \
else \
    echo "OpenSCAD already present, ensuring permissions are set"; \
    chmod +x /usr/local/bin/openscad; \
fi

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Create symbolic link for Xvfb
RUN echo '#!/bin/bash\nxvfb-run -a "$@"' > /usr/local/bin/xvfb-run-safe && \
    chmod +x /usr/local/bin/xvfb-run-safe

# Expose the port
EXPOSE 5000

# Run the application with Xvfb (needed for OpenSCAD to run headless)
CMD ["xvfb-run-safe", "python", "app.py"]