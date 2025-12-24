FROM node:18-bullseye

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    libgl1 \
    libglib2.0-0 \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install --no-cache-dir \
    torch==2.2.2+cpu \
    torchvision==0.17.2+cpu \
    --index-url https://download.pytorch.org/whl/cpu

RUN pip3 install "numpy<2"
RUN pip3 install --no-cache-dir \
    insightface \
    onnxruntime \
    opencv-python-headless \
    PyWavelets


WORKDIR /app

RUN pip3 install --no-cache-dir "numpy<2" insightface
RUN python3 -c "from insightface.app import FaceAnalysis; app=FaceAnalysis(name='buffalo_l',providers=['CPUExecutionProvider']); app.prepare(ctx_id=0); print('buffalo_l CACHED')"
COPY . .

RUN npm install --production

ENV PORT=8080
CMD ["bash", "-c", "python3 face_service.py & node backend.js"]

