FROM python:3.12-slim

WORKDIR /app

# System dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    ffmpeg \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Node dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# CPU-only PyTorch
RUN pip install --no-cache-dir \
    torch \
    --index-url https://download.pytorch.org/whl/cpu

# Whisper
RUN pip install --no-cache-dir openai-whisper

# Application
COPY . .

RUN mkdir -p uploads

ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/server.js"]