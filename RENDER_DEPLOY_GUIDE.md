# 🚀 Guia Completo - Deploy Render.com

## 📋 **Checklist de Deploy**

### ✅ **Pré-requisitos Completos**
- [x] Arquivo `render.yaml` criado  
- [x] Repositório no GitHub atualizado
- [x] Configurações de CORS ajustadas

---

## 🌟 **PASSO A PASSO DETALHADO**

### **1. Acessar Render.com**
- Vá em: https://render.com
- Clique: "Get Started for Free"
- Login com GitHub

### **2. Criar Primeiro Serviço (SERVIDOR)**

1. **Dashboard** → "**New +**" → "**Web Service**"
2. **Connect repository** → `cidade-dorme`
3. **Configurar:**
   ```
   Name: cidade-dorme-server
   Environment: Node
   Region: Oregon (US West) - mais próximo
   Branch: main
   Root Directory: (vazio)
   Build Command: cd server && npm install
   Start Command: cd server && npm start
   ```

4. **Environment Variables:**
   ```
   NODE_ENV = production
   PORT = 10000
   CLIENT_URL = https://cidade-dorme-client.onrender.com
   ```

5. **Clique**: "Create Web Service"

### **3. Criar Segundo Serviço (CLIENTE)**

1. **Dashboard** → "**New +**" → "**Static Site**"
2. **Connect repository** → `cidade-dorme` (mesmo repo)
3. **Configurar:**
   ```
   Name: cidade-dorme-client  
   Branch: main
   Root Directory: (vazio)
   Build Command: cd client && npm install && npm run build
   Publish Directory: client/dist
   ```

4. **Environment Variables:**
   ```
   VITE_SERVER_URL = https://cidade-dorme-server.onrender.com
   ```

5. **Clique**: "Create Static Site"

---

## 🔧 **URLs Finais (Exemplo)**

Após o deploy, você receberá:

### **🖥️ Servidor (Backend):**
```
https://cidade-dorme-server.onrender.com
```

### **🌐 Cliente (Frontend):**  
```
https://cidade-dorme-client.onrender.com
```

**⚠️ IMPORTANTE**: Atualize as variáveis de ambiente com as URLs reais!

---

## 🔄 **Ajustar Variáveis (Após Deploy)**

### **No Servidor:**
1. Dashboard → `cidade-dorme-server` → Environment
2. Editar `CLIENT_URL` → Colocar URL real do cliente

### **No Cliente:**
1. Dashboard → `cidade-dorme-client` → Environment  
2. Editar `VITE_SERVER_URL` → Colocar URL real do servidor
3. **Redeploy** → Clique "Manual Deploy"

---

## ✅ **Verificação Final**

### **Teste o Servidor:**
Acesse: `https://SEU-SERVIDOR.onrender.com/health`

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "uptime": 123
}
```

### **Teste o Cliente:**
Acesse: `https://SEU-CLIENTE.onrender.com`

Deve carregar a interface do jogo!

---

## 🎮 **Testando o Jogo**

1. **Abra o cliente** no navegador
2. **Criar Sala** (como narrador)
3. **Abra nova aba** anônima  
4. **Entrar na Sala** com o código
5. **WebSockets funcionando!** ✅

---

## 🚨 **Problemas Comuns**

### **Build Failed - Server:**
```bash
# Verificar se o servidor inicia local:
cd server && npm install && npm start
```

### **Build Failed - Client:**
```bash  
# Verificar se o client builda:
cd client && npm install && npm run build
```

### **WebSocket Connection Failed:**
- Verificar se `VITE_SERVER_URL` está correto
- Verificar se `CLIENT_URL` está correto no servidor
- Aguardar alguns minutos (cold start)

---

## 🎯 **Dicas Importantes**

1. **Free Tier**: 750 horas/mês grátis
2. **Cold Start**: Primeiro acesso pode demorar 30s
3. **Keep Alive**: Use um serviço como UptimeRobot para manter ativo
4. **Logs**: Dashboard → Service → Logs para debug

**🎉 Seu jogo estará 100% funcional com WebSockets em tempo real!** 