# 1. Imagem Base
FROM node:18-alpine

# 2. Diretório de trabalho
WORKDIR /app

# 3. Copiar dependências (Mantém igual)
COPY backend/package*.json ./

# 4. Instalar dependências (Mantém igual)
RUN npm install --production

# 5. CORREÇÃO AQUI:
# Em vez de copiar tudo (COPY . .), copiamos apenas o conteúdo da pasta backend
COPY backend/ .

# 6. Expor a porta
EXPOSE 3010

# 7. Comando para iniciar
CMD ["npm", "start"]