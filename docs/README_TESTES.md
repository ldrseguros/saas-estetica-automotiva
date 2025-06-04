# Guia de Testes - SaaS Estética Automotiva

Este guia fornece instruções detalhadas para testar todas as funcionalidades do sistema SaaS para estéticas automotivas, abrangendo todas as perspectivas de usuário.

## Preparação do Ambiente de Testes

### Windows

1. **Iniciar o ambiente de desenvolvimento**:

   - Execute o arquivo `test-environment.bat` como administrador
   - Este script irá iniciar tanto o backend quanto o frontend automaticamente

2. **Configurar ambiente multi-tenant** (opcional, mas recomendado para testes completos):
   - Execute o arquivo `setup-multitenant-test.bat` como administrador
   - Este script irá adicionar entradas ao arquivo hosts para permitir testes com subdomínios

### Linux/macOS

1. **Iniciar o ambiente de desenvolvimento**:

   ```bash
   chmod +x test-environment.sh
   ./test-environment.sh
   ```

2. **Configurar ambiente multi-tenant** (opcional):
   ```bash
   chmod +x setup-multitenant-test.sh
   sudo ./setup-multitenant-test.sh
   ```

## Roteiro de Testes Passo a Passo

### 1. Teste da Landing Page e Cadastro

1. **Acessar a Landing Page**:

   - Abra o navegador e acesse: `http://localhost:5173` ou `http://esteticasaas.local:5173` (se configurou hosts)
   - Verifique se a página inicial carrega corretamente com todos os elementos
   - Teste os links de navegação e a exibição dos planos de assinatura

2. **Testar o processo de cadastro**:
   - Clique em "Comece Agora" ou "Assinar Agora" em um dos planos
   - Preencha o formulário de cadastro em 3 etapas:
     - **Etapa 1**: Informações da empresa (teste a verificação de disponibilidade do subdomínio)
     - **Etapa 2**: Dados do administrador
     - **Etapa 3**: Escolha do plano e aceitação dos termos

### 2. Teste do Checkout e Pagamento

1. **Página de checkout**:
   - Após o cadastro, você deve ser redirecionado para a página de checkout
   - Verifique se os detalhes do plano escolhido são exibidos corretamente
2. **Simulação de pagamento**:
   - Em ambiente de desenvolvimento, use o botão "Pular Pagamento (Apenas DEV)"
   - Para testes mais completos, configure o Stripe CLI e use cartões de teste:
     - Sucesso: `4242 4242 4242 4242`
     - Falha: `4000 0000 0000 0002`

### 3. Teste como Dono da Estética (Administrador)

1. **Acesso ao dashboard**:
   - Faça login com as credenciais de administrador criadas no cadastro
   - Verifique se o dashboard carrega com todas as métricas e painéis
2. **Gerenciamento de serviços**:

   - Adicione alguns serviços que sua estética oferece
   - Defina preços, duração e descrições
   - Teste editar e desativar serviços

3. **Gerenciamento de funcionários** (se implementado):

   - Adicione um novo funcionário
   - Configure permissões
   - Teste o login com essas credenciais

4. **Status da assinatura**:
   - Acesse a página de assinatura através do menu
   - Verifique se o status e detalhes do plano estão corretos
   - Se integrado com Stripe, teste o acesso ao portal de gerenciamento

### 4. Teste como Funcionário

1. **Acesso como funcionário**:
   - Faça login com as credenciais de funcionário
   - Verifique as permissões limitadas em comparação com o administrador
2. **Gerenciamento de agendamentos**:
   - Visualize a agenda do dia
   - Confirme um agendamento
   - Marque um serviço como concluído

### 5. Teste como Cliente Final

1. **Agendamento público**:

   - Acesse a página de agendamento público: `http://localhost:5173/agendar-servico`
   - Selecione um serviço entre os disponíveis
   - Escolha data e horário disponíveis
   - Preencha informações pessoais e do veículo
   - Confirme o agendamento e verifique a referência gerada

2. **Verificação do agendamento**:
   - Faça login como administrador ou funcionário
   - Verifique se o novo agendamento aparece na lista de agendamentos
   - Teste confirmar ou reagendar o serviço

### 6. Teste de Multi-tenant

1. **Acesso por subdomínios**:

   - Se configurou o arquivo hosts, teste acessar diferentes subdomínios:
     - `http://estetica1.esteticasaas.local:5173`
     - `http://estetica2.esteticasaas.local:5173`
   - Verifique se cada tenant possui seus próprios dados isolados

2. **Isolamento de dados**:
   - Crie serviços diferentes em cada tenant
   - Verifique se os serviços de um tenant não aparecem para outro

## Casos de Teste Específicos para Pagamentos

### Teste de Cartões Stripe

| Número do Cartão    | Comportamento                   |
| ------------------- | ------------------------------- |
| 4242 4242 4242 4242 | Pagamento bem-sucedido          |
| 4000 0000 0000 0002 | Cartão recusado                 |
| 4000 0025 0000 3155 | Requer autenticação (3D Secure) |
| 4000 0000 0000 9995 | Fundos insuficientes            |

### Stripe CLI (Avançado)

Se instalou o Stripe CLI, você pode testar webhooks e eventos:

1. **Encaminhar webhooks**:

   ```
   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
   ```

2. **Simular eventos**:
   ```
   stripe trigger payment_intent.succeeded
   stripe trigger payment_intent.payment_failed
   ```

## Testes de Responsividade

Teste a aplicação em diferentes dispositivos e tamanhos de tela:

1. **Desktop**: Navegadores Chrome, Firefox, Edge
2. **Tablet**: iPad ou similar (768px largura)
3. **Mobile**: iPhone ou similar (375px largura)

## Fluxos de Teste Completos

### Fluxo de Assinatura

1. Cadastro na plataforma
2. Seleção de plano
3. Checkout e pagamento
4. Acesso ao dashboard
5. Verificação do status da assinatura
6. Atualização do plano (upgrade/downgrade)
7. Cancelamento de assinatura

### Fluxo de Agendamento

1. Cliente acessa página de agendamento
2. Seleciona serviço e data/hora
3. Preenche dados e confirma
4. Administrador/funcionário visualiza novo agendamento
5. Confirma agendamento
6. Executa serviço e marca como concluído

## Problemas Comuns e Soluções

- **Erro de conexão com backend**: Verifique se o servidor backend está rodando na porta correta
- **Problema com subdomínios**: Confirme que as entradas no arquivo hosts foram adicionadas corretamente
- **Erro de CORS**: Verifique as configurações de CORS no backend
- **Falhas de pagamento**: Confirme que as chaves do Stripe estão configuradas corretamente

## Reportando Bugs

Ao encontrar um problema durante os testes, registre as seguintes informações:

1. Página/funcionalidade onde ocorreu o problema
2. Passos para reproduzir
3. Comportamento esperado vs. comportamento observado
4. Captura de tela ou vídeo (se possível)
5. Ambiente (sistema operacional, navegador, dispositivo)

---

Para mais detalhes sobre os testes específicos, consulte o [Plano de Testes](./PLANO_DE_TESTES.md) completo.
