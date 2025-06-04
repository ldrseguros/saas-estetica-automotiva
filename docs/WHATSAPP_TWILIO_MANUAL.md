# Manual de Integração WhatsApp via Twilio

## Índice

1. [Visão Geral](#visão-geral)
2. [Configuração do Twilio](#configuração-do-twilio)
3. [Políticas do WhatsApp Business API](#políticas-do-whatsapp-business-api)
4. [Configuração do Sistema](#configuração-do-sistema)
5. [Funcionalidades Implementadas](#funcionalidades-implementadas)
6. [Guia de Uso](#guia-de-uso)
7. [Resolução de Problemas](#resolução-de-problemas)
8. [Melhores Práticas](#melhores-práticas)

## Visão Geral

A integração do WhatsApp via Twilio permite que o sistema de gestão de estética automotiva envie mensagens automatizadas para os clientes através do WhatsApp, para:

- Confirmação de agendamentos
- Lembretes de serviços
- Notificações de conclusão de serviços
- Envio de relatórios fotográficos
- Comunicação direta com clientes

O sistema utiliza a API do Twilio como intermediário para se comunicar com a API do WhatsApp Business, permitindo o envio programático de mensagens para os clientes.

## Configuração do Twilio

### 1. Conta no Twilio

1. Crie uma conta em [https://www.twilio.com/](https://www.twilio.com/)
2. No painel do Twilio, acesse o "Messaging" e depois "Try WhatsApp"
3. Siga as instruções para ativar o Sandbox do WhatsApp

### 2. Obtendo as Credenciais

No Dashboard do Twilio, você precisará obter:

- **Account SID**: identificador da sua conta
- **Auth Token**: token de autenticação
- **WhatsApp Number**: número do WhatsApp fornecido pelo Twilio (formato: `whatsapp:+14155238886`)

### 3. Configurando Templates de Mensagem

Para enviar mensagens proativamente (fora da janela de 24h), você precisará:

1. Acessar o painel do WhatsApp Business no Twilio
2. Criar e submeter templates para aprovação
3. Após aprovados, os templates podem ser usados no sistema

## Políticas do WhatsApp Business API

### Janela de 24 Horas

- **Session Messages**: Quando um cliente envia uma mensagem, abre-se uma "janela de conversação" de 24 horas
- Durante essa janela, sua empresa pode enviar mensagens livremente
- A janela é renovada a cada nova mensagem recebida do cliente

### Mensagens de Template (HSM)

- Para enviar mensagens fora da janela de 24h, você DEVE usar um Template aprovado
- Templates são mensagens estruturadas com espaços para substituição de variáveis
- Geralmente usados para notificações e alertas
- Todo template precisa ser aprovado pelo WhatsApp antes de ser utilizado

### Restrições Importantes

- Não é permitido enviar mensagens promocionais não solicitadas
- Mensagens em massa são limitadas e monitoradas
- O WhatsApp pode bloquear números que desrespeitem as políticas
- O conteúdo das mensagens é moderado

## Configuração do Sistema

### Variáveis de Ambiente

As seguintes variáveis devem ser configuradas no arquivo `.env` do backend:

```
TWILIO_ACCOUNT_SID=seu_account_sid_aqui
TWILIO_AUTH_TOKEN=seu_auth_token_aqui
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Seu número do Twilio
```

### Estrutura da Integração

A integração do WhatsApp está estruturada da seguinte forma:

- **Frontend**:

  - Interface para criar e gerenciar templates
  - Interface para envio de mensagens
  - Interface para envio de relatórios com fotos

- **Backend**:
  - API para gerenciar templates de mensagens
  - Serviço de envio de mensagens via Twilio
  - Armazenamento de histórico de mensagens

## Funcionalidades Implementadas

### 1. Gerenciamento de Templates

- Criação, edição e exclusão de templates de mensagens
- Suporte a variáveis como `{{client_name}}`, `{{service_name}}`, `{{date}}`, `{{time}}`
- Categorização de templates por tipo

### 2. Envio de Mensagens

- Envio de mensagens para clientes específicos
- Suporte a mensagens simples e mensagens com mídia
- Substituição automática de variáveis nos templates

### 3. Teste e Depuração

- Funções para testar a conexão com o Twilio
- Função para enviar mensagens de teste
- Logs detalhados do processo de envio

### 4. Relatórios de Serviço

- Criação de relatórios com fotos "antes e depois"
- Envio de relatórios via WhatsApp para o cliente

## Guia de Uso

### Criação e Gerenciamento de Templates

1. Acesse a aba "Templates" na seção de WhatsApp do painel administrativo
2. Clique em "Novo Template" para criar um template
3. Defina um nome, tipo e o texto do template
4. Use variáveis como `{{client_name}}`, `{{service_name}}`, `{{date}}`, `{{time}}` onde necessário
5. Salve o template

### Envio de Mensagens

1. Acesse a aba "Enviar Mensagem" na seção de WhatsApp
2. Selecione o cliente para quem deseja enviar a mensagem
3. Escolha um template ou escreva uma mensagem personalizada
4. Adicione anexos se necessário
5. Clique em "Enviar Mensagem"

### Teste da Conexão

1. Acesse a aba "Templates" na seção de WhatsApp
2. Role até a seção "Testar WhatsApp"
3. Clique em "Testar Conexão" para verificar as credenciais do Twilio
4. Use a função "Enviar Mensagem de Teste" para enviar uma mensagem de teste

### Criação de Relatórios

1. Acesse a aba "Relatórios" na seção de WhatsApp
2. Selecione um agendamento para criar o relatório
3. Faça upload das fotos "antes" e "depois"
4. Adicione comentários sobre o serviço
5. Salve o relatório e/ou envie por WhatsApp

## Resolução de Problemas

### Erro "Mensagem não enviada"

**Possíveis causas:**

- Credenciais do Twilio incorretas
- Cliente sem número de WhatsApp cadastrado
- Formato incorreto do número de telefone
- Problemas na conexão com o Twilio

**Solução:**

1. Verifique se as variáveis de ambiente estão configuradas corretamente
2. Confirme que o cliente tem um número de WhatsApp válido cadastrado
3. Verifique os logs do servidor para detalhes do erro

### Substituição de Variáveis não Funciona

**Possíveis causas:**

- Formato incorreto da variável no template
- Dados não fornecidos no momento do envio

**Solução:**

1. Verifique se as variáveis estão no formato `{{variable_name}}`
2. Confirme que os dados necessários estão sendo passados na função `sendWhatsAppMessage`

### Cliente Não Recebe Mensagens

**Possíveis causas:**

- Número de telefone incorreto
- Cliente não adicionou o número do Twilio como contato
- Cliente não enviou a mensagem de opt-in (no modo sandbox)
- Mensagem bloqueada pelas políticas do WhatsApp

**Solução:**

1. Verifique se o número está formatado corretamente
2. No modo sandbox, o cliente precisa enviar a mensagem de código inicial "join [palavra]"
3. Peça ao cliente para adicionar o número do Twilio como contato
4. Verifique se a mensagem respeita as políticas do WhatsApp

## Melhores Práticas

### Conteúdo das Mensagens

- Mantenha as mensagens claras e concisas
- Evite conteúdo promocional excessivo
- Personalize as mensagens com o nome do cliente
- Inclua informações relevantes e úteis

### Frequência de Envio

- Evite enviar muitas mensagens em curto período
- Respeite as preferências do cliente
- Use mensagens apenas quando necessário e relevante

### Segurança e Privacidade

- Nunca solicite informações sensíveis via WhatsApp
- Não compartilhe dados de um cliente com outro
- Armazene o histórico de mensagens de forma segura
- Respeite as leis de proteção de dados (LGPD)

### Otimização da Taxa de Entrega

- Use templates aprovados para mensagens fora da janela de 24h
- Incentive os clientes a responderem suas mensagens
- Mantenha alta qualidade nas comunicações
- Evite padrões de comportamento que possam ser considerados spam

---

Este manual foi criado para o sistema SaaS de estética automotiva e deve ser atualizado conforme novas funcionalidades e políticas do WhatsApp/Twilio forem implementadas.

Última atualização: Agosto de 2023
