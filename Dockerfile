# Imagem oficial do Microsoft Playwright com tag exata correspondente a v1.63.0
FROM mcr.microsoft.com/playwright:v1.63.0-noble

WORKDIR /app

# Copia manifestos e arquivos de lock para cache otimizado de camadas Docker
COPY package.json package-lock.json* bun.lock* ./

# Instala todas as dependências (incluindo devDependencies como esbuild, vite e typescript)
# necessárias para executar a etapa de build da aplicação
RUN if [ -f package-lock.json ]; then \
      npm ci --include=dev; \
    else \
      npm install --include=dev; \
    fi

# Copia o código fonte do projeto (respeitando o .dockerignore revisado)
COPY . .

# Executa o script de build com Vite (frontend) e esbuild (server.ts -> dist/server.cjs)
RUN npm run build

# Define variáveis de ambiente para tempo de execução após o build ter sido concluído com sucesso
ENV NODE_ENV=production
ENV PORT=3000

# Expõe a porta padrão (o Render injeta process.env.PORT dinamicamente em tempo de execução)
EXPOSE 3000

# Inicia o servidor Node Express com o script start existente
CMD ["npm", "start"]
