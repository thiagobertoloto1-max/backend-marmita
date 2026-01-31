# Divino Sabor - Sistema de Marmitas

Sistema de pedidos online para delivery de marmitas com pagamento via PIX integrado à AnubisPay.

## Configuração do Pagamento PIX (AnubisPay)

### 1. Configurar Secrets

No painel da Lovable, adicione os seguintes secrets:

- `ANUBISPAY_PUBLIC_KEY` - Sua chave pública da AnubisPay
- `ANUBISPAY_SECRET_KEY` - Sua chave secreta da AnubisPay

Você encontra suas credenciais no painel da AnubisPay em "Credenciais API".

### 2. Configurar Webhook

No painel da AnubisPay, configure o webhook para receber notificações de pagamento:

**URL do Webhook:**
```
https://rxaygagrjikvfscetqhs.supabase.co/functions/v1/pix-webhook
```

**Eventos a monitorar:**
- Pagamento confirmado
- Pagamento expirado
- Pagamento cancelado

### 3. Testar Integração

1. Crie um pedido de teste no site
2. Escolha pagamento via PIX
3. Verifique se o QR Code aparece corretamente
4. Use o ambiente de testes da AnubisPay para simular pagamento
5. Confirme que o status do pedido atualiza para "Pagamento confirmado"

## Arquitetura

### Edge Functions (Backend)

- `pix-create` - Cria cobrança PIX na AnubisPay
- `pix-status` - Consulta status de pagamento
- `pix-webhook` - Recebe notificações de pagamento

### Banco de Dados

- `orders` - Pedidos com dados do cliente e itens
- `pix_charges` - Cobranças PIX vinculadas aos pedidos

## Tecnologias

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Lovable Cloud)
- AnubisPay API

## Desenvolvimento Local

```sh
# Clone o repositório
git clone <YOUR_GIT_URL>

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## Deploy

Clique em "Publish" no Lovable para publicar sua aplicação.

## Suporte

Para dúvidas sobre a integração AnubisPay, consulte: https://anubispay.readme.io
