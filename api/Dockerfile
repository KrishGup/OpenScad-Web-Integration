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
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Download latest OpenSCAD snapshot (2025 development build)
RUN mkdir -p /usr/local/bin/openscad && \
    cd /tmp && \
    wget -q https://files.openscad.org/snapshots/OpenSCAD-2025.04.13.ai24871-x86_64.AppImage && \
    chmod +x OpenSCAD-2025.04.13.ai24871-x86_64.AppImage && \
    mv OpenSCAD-2025.04.13.ai24871-x86_64.AppImage /usr/local/bin/openscad/openscad && \
    ln -s /usr/local/bin/openscad/openscad /usr/local/bin/openscad

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