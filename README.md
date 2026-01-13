# EDUConnect Mobile

📘 **EDUConnect Mobile — Documentação da Aplicação**

## 1. Introdução

O **EDUConnect Mobile** é a extensão móvel da plataforma educacional EDUConnect, desenvolvida para proporcionar acesso rápido e prático a professores e alunos. Utilizando **React Native** com **Expo**, o aplicativo oferece uma experiência fluida em dispositivos Android e iOS, integrando-se perfeitamente ao ecossistema existente da aplicação web e backend.

***

## 2. Objetivo

Levar a experiência do EduConnect para a palma da mão, permitindo que o aprendizado e a colaboração ocorram em qualquer lugar. O aplicativo foca na acessibilidade e na facilidade de configuração, permitindo testes rápidos em ambientes de desenvolvimento local através de uma interface de configuração de IP dedicada.

***

## 3. Público-alvo

- **Professores:** Gerenciamento de artigos e acompanhamento de atividades em trânsito.
- **Alunos:** Leitura de artigos, interação e estudos via smartphone.

***

## 4. Autor

**Matheus Melo Santos**  
[matheusmvsj@hotmail.com](mailto:matheusmvsj@hotmail.com)

***

## 5. Funcionalidades

- **Navegação Híbrida:** Integração otimizada com a plataforma Web via WebView avançada.
- **Configuração de Ambiente:** Tela nativa para configuração dinâmica de IP/URL (essencial para testes locais em redes Wi-Fi).
- **Interface Nativa:** Container seguro e performático para execução do frontend React.
- **Cross-Platform:** Código único rodando em Android e iOS.
- **Suporte a Uploads:** Permissões configuradas para envio de arquivos e avatares diretamente pelo celular.

***

## 6. Tecnologias

- **Framework:** React Native (via Expo SDK 50)
- **Linguagem:** TypeScript / JavaScript
- **Componentes:** React Native WebView, Expo Status Bar
- **Gerenciamento de Pacotes:** NPM

***

## 7. Estrutura do Projeto Mobile

- `App.tsx` – Ponto de entrada principal. Gerencia o estado de conexão e alterna entre a tela de configuração de IP e a WebView.
- `metro.config.js` – Configuração do bundler para isolar dependências do monorepo e evitar conflitos.
- `app.json` – Configurações do Expo (ícones, splash screens, permissões).
- `assets/` – Imagens e ícones da aplicação.

***

## 8. Setup & Execução

### Pré-requisitos
- Node.js v18+
- Aplicativo **Expo Go** instalado no seu celular (disponível na App Store e Google Play).
- Computador e celular conectados na mesma rede Wi-Fi.

### Instalação

1. Navegue até a pasta mobile:
   ```bash
   cd mobile
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

### Executando o App

1. Inicie o servidor de desenvolvimento:
   ```bash
   npx expo start
   ```

2. **No seu celular:**
   - Abra o aplicativo **Expo Go**.
   - Escaneie o QR Code exibido no terminal.

3. **Configuração Inicial (Tela do App):**
   - Ao abrir, o app mostrará uma tela de configuração.
   - Insira o endereço IP local da sua máquina onde o Frontend está rodando (ex: `http://192.168.1.15:3001`).
   - *Dica:* Ao rodar `npm run dev` no frontend, o Vite geralmente mostra o "Network URL". Use esse endereço.
   - Clique em "Conectar".

***

## 9. Experiências e Desafios

- **Isolamento de Dependências:** Configuração específica do Metro Bundler para garantir que o projeto mobile não conflitasse com as dependências do projeto raiz/web.
- **Conectividade Local:** Implementação de uma interface amigável para input manual de IP, resolvendo a dificuldade comum de conectar dispositivos móveis a servidores localhost (localhost no celular não é o localhost do PC).
- **Integração WebView:** Ajustes de permissões para garantir que uploads de arquivos e navegação funcionassem como em um navegador nativo.

***

## 10. Melhorias Futuras

- Implementação de notificações Push para novos artigos.
- Cache offline para leitura de artigos sem internet.
- Conversão gradativa de telas críticas (Login, Home) para componentes 100% nativos para maior performance.
- Integração com biometria para login rápido.

***

## 11. Considerações Finais

O **EDUConnect Mobile** completa o ecossistema do projeto TechChallenge, garantindo que a tecnologia sirva à educação sem barreiras de dispositivo, mantendo a consistência visual e a integridade dos dados da plataforma original.

***
