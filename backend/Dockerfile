FROM python:3.12-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ffmpeg \
       nodejs \
       npm \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN pip install --no-cache-dir openai-whisper

RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "src/server.js"]