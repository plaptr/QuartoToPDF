FROM oven/bun:latest

# Install system dependencies including Chromium for decktape
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv \
    curl unzip \
    chromium \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2

RUN apt-get install -y pipx
# RUN pip3 install --user pipx
RUN pipx ensurepath
RUN pipx install quarto-cli

# Set Puppeteer to use system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package.json bun.lockb* ./
RUN bun install --verbose

EXPOSE 3000

COPY . .
CMD bun start