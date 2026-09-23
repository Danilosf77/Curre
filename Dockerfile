# Dockerfile otimizado para Render Web Service com Chromium Headless (Playwright)
FROM node:20-bookworm-slim

# Instala dependências de sistema necessárias para o Chromium headless e fontes
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    fonts-liberation \
    fonts-noto-color-emoji \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia manifests primeiro para aproveitar cache de camadas
COPY package*.json ./

# Instala dependências do projeto
RUN npm ci

# Instala o navegador Chromium do Playwright
RUN npx playwright install chromium

# Copia o código fonte
COPY . .

# Executa o build da aplicação (Vite + esbuild para dist/server.cjs)
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Executa o servidor Node Express
CMD ["npm", "start"]
