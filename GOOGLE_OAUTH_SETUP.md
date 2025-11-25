# Configuração do Google OAuth

Para habilitar o login com Google, siga estes passos:

## 1. Criar um Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. No menu lateral, vá em **APIs e Serviços** > **Credenciais**

## 2. Configurar a Tela de Consentimento OAuth

1. Clique em **Tela de consentimento OAuth**
2. Escolha **Externo** (para testes) ou **Interno** (para uso organizacional)
3. Preencha os campos obrigatórios:
   - Nome do aplicativo: **RPG Edu Tracker**
   - E-mail de suporte ao usuário
   - Domínio autorizado (se aplicável)
4. Adicione escopos: `openid`, `profile`, `email`
5. Salve e continue

## 3. Criar Credenciais OAuth 2.0

1. Volte para **Credenciais**
2. Clique em **+ CRIAR CREDENCIAIS** > **ID do cliente OAuth**
3. Tipo de aplicativo: **Aplicativo da Web**
4. Nome: **RPG Edu Tracker Web Client**
5. **URIs de redirecionamento autorizados**:
   - Para desenvolvimento: `http://localhost:3000/api/auth/google/callback`
   - Para produção: `https://seu-dominio.com/api/auth/google/callback`
6. Clique em **CRIAR**
7. Copie o **ID do cliente** e o **Segredo do cliente**

## 4. Configurar as Variáveis de Ambiente

Abra o arquivo `.env` e atualize com suas credenciais:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
VITE_USE_GOOGLE_AUTH=true
```

## 5. Reiniciar o Servidor

Após configurar as variáveis de ambiente, reinicie o servidor:

```bash
npm run dev
```

## 6. Testar o Login

1. Acesse http://localhost:3000
2. Clique em **"Entrar com Google"**
3. Você será redirecionado para a página de login do Google
4. Após autorizar, será redirecionado de volta para a aplicação já autenticado

## Notas Importantes

- **Modo de Desenvolvimento**: Use `http://localhost:3000` como URL de redirecionamento
- **Modo de Produção**: Certifique-se de adicionar a URL de produção nos URIs de redirecionamento autorizados
- **Segurança**: Nunca compartilhe ou commite o arquivo `.env` com suas credenciais reais
- **Domínios Verificados**: Para produção, você pode precisar verificar a propriedade do domínio

## Alternativa: Manter o Login com Manus

Se preferir usar o sistema Manus OAuth original, configure:

```env
VITE_USE_GOOGLE_AUTH=false
```

E certifique-se de que as variáveis `OAUTH_SERVER_URL` e `VITE_OAUTH_PORTAL_URL` estejam configuradas corretamente.
