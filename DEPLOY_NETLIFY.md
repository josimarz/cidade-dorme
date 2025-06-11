# 🚀 Deploy no Netlify - Cidade Dorme

Este guia explica como fazer o deploy da aplicação **Cidade Dorme** no Netlify.

## ⚠️ **Limitação Importante**

**WebSockets não funcionam completamente com Netlify Functions.** Para uma experiência completa com Socket.IO, considere as seguintes alternativas:

### Opções Recomendadas:
1. **Render.com** - Suporte completo a WebSockets
2. **Railway.app** - Deploy fullstack com WebSockets
3. **Vercel** - Com adaptações para API Routes
4. **Heroku** - Clássico para Node.js + WebSockets

## 📋 Instruções para Deploy no Netlify

### 1. Preparação
```bash
# Instalar dependências do projeto
cd client && npm install
cd ../server && npm install
```

### 2. Build da Aplicação
```bash
# Build do cliente (executado automaticamente pelo Netlify)
cd client && npm run build:netlify
```

### 3. Configuração no Netlify

#### Via GitHub:
1. Conecte seu repositório ao Netlify
2. Configure as seguintes configurações:
   - **Build command**: `cd client && npm run build:netlify`
   - **Publish directory**: `client/dist`
   - **Functions directory**: `netlify/functions`

#### Via Netlify CLI:
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login no Netlify
netlify login

# Deploy
netlify deploy --build

# Deploy para produção
netlify deploy --prod --build
```

### 4. Variáveis de Ambiente

No painel do Netlify, configure:
- `NODE_VERSION`: `18`
- `CLIENT_URL`: `https://SEU-SITE.netlify.app`

## 🔧 Arquivos de Configuração Criados

### `netlify.toml`
- Configuração principal do Netlify
- Redirecionamentos para SPA
- Configuração de funções serverless

### `netlify/functions/server.js`
- Função serverless adaptada do servidor
- Socket.IO configurado (limitado)
- Rotas da API

### `client/src/vite-env.d.ts`
- Tipagens TypeScript para variáveis de ambiente
- Suporte ao `import.meta.env`

## ⚡ Funcionalidades Suportadas

✅ **Funcionam no Netlify:**
- Interface web responsiva
- Roteamento SPA
- Build otimizado
- Deploy automático

⚠️ **Limitações no Netlify:**
- WebSockets (Socket.IO) podem não funcionar completamente
- Funções serverless têm timeout limitado
- Sem persistência de estado entre requests

## 🎯 Deploy Alternativo Recomendado

Para funcionalidade completa, use **Render.com**:

```bash
# 1. Criar conta no Render.com
# 2. Conectar repositório GitHub
# 3. Criar Web Service para o servidor:
#    - Build: cd server && npm install
#    - Start: cd server && npm start
#    - Port: 3000

# 4. Criar Static Site para o cliente:
#    - Build: cd client && npm run build
#    - Publish: client/dist
#    - Environment: VITE_SERVER_URL=https://seu-servidor.onrender.com
```

## 🔍 Teste Local

Simule o ambiente Netlify localmente:

```bash
# Instalar Netlify Dev
npm install -g netlify-cli

# Executar localmente
netlify dev
```

## 📞 Suporte

Se encontrar problemas com WebSockets no Netlify, considere migrar para uma das plataformas recomendadas que oferecem suporte completo a aplicações Node.js com WebSockets. 