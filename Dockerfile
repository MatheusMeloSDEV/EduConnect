# 1. Imagem Base: Versão leve do Node (Alpine) para a imagem ficar pequena
FROM node:18-alpine

# 2. Diretório de trabalho dentro do container
WORKDIR /app

# 3. Copiar dependências primeiro (para otimizar o cache do Docker)
# O asterisco garante que copie tanto package.json quanto package-lock.json se existir
COPY backend/package*.json ./

# 4. Instalar apenas dependências de produção
# (Ignora o nodemon listado em devDependencies, deixando a imagem mais leve)
RUN npm install --production

# 5. Copiar o restante do código do projeto para dentro do container
COPY . .

# 6. Expor a porta (Confira no seu server.js qual porta você usa. Geralmente é 3000, 5000 ou 8080)
# Isso serve apenas de documentação para quem for rodar
EXPOSE 3010

# 7. Comando para iniciar (baseado no seu script "start")
CMD ["npm", "start"]
