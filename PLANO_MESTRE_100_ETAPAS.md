# PLANO MESTRE DE ENGENHARIA INDUSTRIAL — 100 ETAPAS (+10 QA)
## CAPITANIA #13: V5 APOLLO POSTER (PORTA DEDICADA :3011)

**Holding V5 Apollo — Central Onicanal de Despacho, Agendamento e Engajamento**  
*Engenheiro Responsável: Apollo La Plata <v5estudio@hotmail.com>*  
*Data de Criação: 27 de Outubro de 2026*

---

### VISÃO GERAL E MISSÃO TÉCNICA
O **V5 Apollo Poster** é a central de distribuição e despacho onicanal da Holding V5 Apollo. Ele não produz o conteúdo de raiz nem gerencia assinaturas de membros — seu propósito estrito e absoluto é receber o conteúdo do **V5 Auto Blog**, as mídias do **V5 Edit & Broadcaster** e os achadinhos do **V5 Finders**, e despachá-los nos formatos perfeitos para múltiplos canais (Email, Blog, Redes Sociais, WhatsApp e Telegram) 100% via APIs em nuvem e Webhooks.

---

### ESTRUTURAÇÃO DAS 11 FASES (110 ETAPAS NUMERADAS)

```
Fase 1  (Etapas 001 - 010): Fundações de UI, Estado Global do Despacho, Tipos e Barramento
Fase 2  (Etapas 011 - 020): Calendário Mestre Onicanal (Visual 30 dias, filtros e slots)
Fase 3  (Etapas 021 - 030): Motor Dual Beehiiv/Substack (Editor Markdown e extrator de metadados)
Fase 4  (Etapas 031 - 040): Ponta E-mail da Newsletter (HTML responsivo inline, UTMs e templates)
Fase 5  (Etapas 041 - 050): Ponta Blog REST API (Payloads Schema.org, slugs e conectores AutoBlog)
Fase 6  (Etapas 051 - 060): Ponta Social Teasers (Ganchos para Instagram, Threads, X e WhatsApp)
Fase 7  (Etapas 061 - 070): Comment-to-DM Engine (ChatbotX architecture, gatilhos e anti-spam)
Fase 8  (Etapas 071 - 080): Transmissão de Grupos VIP Finders (Telegram/WhatsApp, cupons e preço tachado)
Fase 9  (Etapas 081 - 090): Fila de Agendamento em Background (Workers, polling e execução)
Fase 10 (Etapas 091 - 100): Dashboard de Analytics de Entrega, Logs e Status HTTP 200/201
Fase 11 (Etapas 101 - 110): Auditoria, QA, Responsividade, Sincronização Hive Bus e Homologação
```

---

### FASE 1: FUNDAÇÕES DE UI, ESTADO GLOBAL, TIPOS E BARRAMENTO (001 - 010)
- [x] **Etapa 001:** Modelagem Completa de Tipos TypeScript (`src/types/poster.ts`) cobrindo todos os 4 pilares, métricas, modelos de postagens e eventos de despacho.
- [x] **Etapa 002:** Criação da Store Global Zustand unificada (`src/store/usePosterStore.ts`) com persistência em `localStorage` para unificar o estado dos 4 módulos.
- [x] **Etapa 003:** Barramento de Eventos e Telemetria Interna (`src/lib/events/dispatchEvents.ts`) para registrar histórico e telemetria de transmissões em tempo real.
- [x] **Etapa 004:** Utilitários de Saneamento de Texto, Formatação de Moeda BRL, Cálculo de Leitura e Geração de Slugs (`src/lib/utils/formatters.ts`).
- [x] **Etapa 005:** Componente de Layout Global e Header Unificado com Navegação Onicanal e Seletor de Tabs com persistência de navegação.
- [x] **Etapa 006:** Banner Dinâmico de Ativação e Conectividade do Gateway V5 Apollo API (`src/components/ui/V5AppActivationBanner.tsx`).
- [x] **Etapa 007:** Sistema de Toasts e Notificações de Status de Despacho com Framer Motion e dismiss automático.
- [x] **Etapa 008:** Modal Genérico de Confirmação Pré-Disparo com resumo dos canais selecionados e checklist pré-voo.
- [x] **Etapa 009:** Mocks e Seeds Iniciais de Homologação para testes autônomos dos 4 módulos.
- [x] **Etapa 010:** Validação de Build Next.js 14 (`npm run build`) com Exit Code 0 e auditoria de tipos da Fundação.

---

### FASE 2: CALENDÁRIO MESTRE ONICANAL (VISUAL 30 DIAS) (011 - 020)
- [x] **Etapa 011:** Construção da Grade Mensal Dinâmica de 30 Dias (`MasterCalendar.tsx`) com cálculo de semanas e dias do mês corrente.
- [x] **Etapa 012:** Alternador de Visualização (Grade Mensal 30D vs. Linha do Tempo Semanal 7D vs. Lista Compacta de Fila).
- [x] **Etapa 013:** Filtro Multi-Plataforma Interativo (Instagram, TikTok, YouTube Shorts, Kwai, WordPress, AutoBlog, E-mail, WhatsApp, Telegram).
- [x] **Etapa 014:** Filtro por Status Operacional (`draft`, `scheduled`, `published`, `failed`).
- [x] **Etapa 015:** Badges e Ícones Customizados de Plataforma com Paleta Semântica Oficial de Identificação Rápida.
- [x] **Etapa 016:** Indicador de Horários Nobres de Audiência (Heatmap / Slots de pico de engajamento às 11h30, 18h00 e 21h00).
- [x] **Etapa 017:** Modal Completo de Agendamento de Novo Post com seleção de data, hora e mídia associada.
- [x] **Etapa 018:** Ações Rápidas de Item no Calendário (Editar, Duplicar, Reagendar para amanhã, Excluir).
- [x] **Etapa 019:** Reagendamento Rápido com seletor de data e hora sem sair do card.
- [x] **Etapa 020:** Validação de Build Next.js 14 (`npm run build`) com Exit Code 0 e homologação do Calendário Mestre.

---

### FASE 3: MOTOR DUAL BEEHIIV/SUBSTACK (EDITOR MARKDOWN) (021 - 030)
- [x] **Etapa 021:** Estruturação do Editor Dual Avançado (`BeehiivNewsletterEditor.tsx`) com divisão em tela dividida (Split-Pane).
- [x] **Etapa 022:** Toolbar de Formatação Markdown Rápida (H1, H2, H3, Citações, Listas, Negrito, Links).
- [x] **Etapa 023:** Inserção do Divisor "Paywall Break / Linha de Assinatura" no Markdown nativo.
- [x] **Etapa 024:** Extrator Automático de Metadados: Cálculo de Tempo de Leitura, Contagem de Palavras e Densidade Semântica.
- [x] **Etapa 025:** Sanitizador de Markdown para remoção de caracteres de controle e tags maliciosas.
- [x] **Etapa 026:** Alternador de Abas de Visualização (Editor Puro vs. Preview E-mail HTML vs. Preview AutoBlog Web).
- [x] **Etapa 027:** Suporte a Inserção de Mídia e Imagens de Capa com URL canônica e tag ALT automática.
- [x] **Etapa 028:** Painel Lateral de Configurações de Publicação (Audiência, Categoria, Tags e Slug customizado).
- [x] **Etapa 029:** Persistência de Rascunho Automática (Auto-Save a cada 3 segundos com status visual discreto).
- [x] **Etapa 030:** Validação de Build Next.js 14 (`npm run build`) com Exit Code 0 e homologação do Editor Dual.

---

### FASE 4: PONTA E-MAIL DA NEWSLETTER (HTML RESPONSIVO INLINE) (031 - 040)
- [x] **Etapa 031:** Aprimoramento do Compilador `compileEmailHtml` em `multimodalEngine.ts` com suporte completo a tabelas inline de e-mail.
- [x] **Etapa 032:** Injeção de Preheader Invisível (Texto de apoio que aparece no preview de caixas de entrada Gmail/Apple Mail).
- [x] **Etapa 033:** Construtor Dinâmico de Parâmetros UTM (`utm_source=v5poster&utm_medium=newsletter&utm_campaign=...`) em todos os links.
- [x] **Etapa 034:** Renderizador do Botão CTA de Alta Conversão com estilos inline compatíveis com Outlook Desktop.
- [x] **Etapa 035:** Rodapé Institucional Obrigatório de E-mail (Endereço, Unsubscribe link, Preferências e Copyright Holding).
- [x] **Etapa 036:** Seletor de Provedor de Disparo de E-mail (Resend API, Amazon SES, SMTP Customizado).
- [x] **Etapa 037:** Visualizador Interativo de Preview de E-mail com simulação Desktop (600px) e Mobile (360px).
- [x] **Etapa 038:** Função de Teste de Envio Rápido (Disparo de E-mail de Prova para o endereço do operador).
- [x] **Etapa 039:** Validador de Spam Score pré-envio (detecção de palavras gatilho de spam e taxa de texto/link).
- [x] **Etapa 040:** Validação de Build Next.js 14 (`npm run build`) com Exit Code 0 e homologação da Ponta E-mail.

---

### FASE 5: PONTA BLOG REST API (SCHEMAS & CONECTORES AUTOBLOG) (041 - 050)
- [x] **Etapa 041:** Compilador de Payload JSON Estruturado para o V5 AutoBlog (`compileBlogPayload` com tags SEO estendidas).
- [x] **Etapa 042:** Gerador de Schema.org JSON-LD para BlogPosting / Article com entidade de autor, data e publisher.
- [x] **Etapa 043:** Gerador de Meta Tags Open Graph (og:title, og:description, og:image, twitter:card) para compartilhamento social.
- [x] **Etapa 044:** Conector do Endpoint REST do V5 AutoBlog com autenticação por chave de capitania.
- [x] **Etapa 045:** Conector do Endpoint REST do WordPress (`/wp-json/wp/v2/posts`) com Basic Auth / Application Passwords.
- [x] **Etapa 046:** Extrator de Excerpt Automático otimizado para meta description do Google (150-160 caracteres).
- [x] **Etapa 047:** Sistema de Categorias e Tags Dinâmicas com sugestão automática de taxonomia.
- [x] **Etapa 048:** Visualizador de Preview de Artigo Web (Simulador do layout final no domínio `v5autoblog.com`).
- [x] **Etapa 049:** Inspecionador de JSON Schema e Validador de Rich Results do Google.
- [x] **Etapa 050:** Validação de Build Next.js 14 (`npm run build`) com Exit Code 0 e homologação da Ponta Blog REST API.

---

### FASE 6: PONTA SOCIAL TEASERS (GANCHOS AUTOMÁTICOS MULTICANAL) (051 - 060)
- [x] **Etapa 051:** Motor de Síntese de Teasers (`compileSocialTeasers`) com adaptação automática de limites de caracteres.
- [x] **Etapa 052:** Gerador de Teasers para X/Twitter (280 caracteres, ganchos visuais e emojis de destaque).
- [x] **Etapa 053:** Gerador de Teasers para Threads (Tom conversacional e chamada para a bio).
- [x] **Etapa 054:** Gerador de Legenda para Instagram (Parágrafos espaçados, hashtags estratégicas e gancho "Comente LINK").
- [x] **Etapa 055:** Gerador de Mensagem Curta para Grupos de WhatsApp (Negritos no padrão `*texto*` e CTA direto).
- [x] **Etapa 056:** Gerador de Mensagem com Markdown para Canais de Telegram (Suporte a formatação rica e link embutido).
- [x] **Etapa 057:** Painel de Edição de Teasers Individuais com contadores de caracteres por rede em tempo real.
- [x] **Etapa 058:** Botão de Cópia com 1 Clique para cada teaser social com feedback visual.
- [x] **Etapa 059:** Seletor de Imagem / Card de Destaque gerado para acompanhar o teaser social.
- [x] **Etapa 060:** Validação de Build Next.js 14 (`npm run build`) com Exit Code 0 e homologação da Ponta Social Teasers.

---

### FASE 7: COMMENT-TO-DM ENGINE (CHATBOTX ARCHITECTURE) (061 - 070)
- [x] **Etapa 061:** Estruturação do Gerenciador de Regras de Comentários (`CommentToDmManager.tsx`) integrado ao Zustand.
- [x] **Etapa 062:** Absorção do Mapeador de Gatilhos do ChatbotX (`packages/automated-response`): normalização e regex de palavras-chave.
- [x] **Etapa 063:** Construtor de Variações de Resposta Pública Rotativa (mínimo de 3 a 5 variações para evasão de bloqueio de spam).
- [x] **Etapa 064:** Construtor de Template de Direct Message (DM Privada) com placeholders `{{nome}}`, `{{ctaUrl}}` e `{{cupom}}`.
- [x] **Etapa 065:** Implementação da Lógica de Envio de DM Ancorada no `comment_id` (Bypass da janela de 24h Meta Graph API).
- [x] **Etapa 066:** Simulador Interativo de Comentários com resposta pública e DM em tempo real no dashboard.
- [x] **Etapa 067:** Mecanismo de Throttling e Fila Anti-Ban (Taxa máxima de 30 DMs/min com jitter randômico de 2 a 5 segundos).
- [x] **Etapa 068:** Gerador de Link Rastreado com UTM dedicado para DM (`utm_source=ig_comment_dm&utm_medium=direct_message`).
- [x] **Etapa 069:** Painel de Métricas de Engajamento de DM: Comentários Detectados, Respostas Enviadas, DMs Entregues e Conversão.
- [x] **Etapa 070:** Validação de Build Next.js 14 (`npm run build`) com Exit Code 0 e homologação do Comment-to-DM Engine.

---

### FASE 8: TRANSMISSÃO DE GRUPOS VIP FINDERS (071 - 080)
- [x] **Etapa 071:** Conexão do Despachador de Ofertas (`OfferGroupDispatcher.tsx`) com os dados das lojas (Shopee, Mercado Livre, Amazon, AliExpress, Magalu).
- [ ] **Etapa 072:** Compilador de Formatação Especial para Telegram (HTML/Markdown com `<s>preço original</s>`, preço promocional em destaque e emoji de fogo).
- [ ] **Etapa 073:** Compilador de Formatação Especial para WhatsApp (Padrão de texto com `~preço original~`, cupom em caixa alta e link curto).
- [ ] **Etapa 074:** Calculadora Automática de Porcentagem de Desconto e Destaque de Economia em Reais (`Você economiza R$ X`).
- [ ] **Etapa 075:** Seletor de Canais de Destino (Canais VIP do Telegram, Comunidades de WhatsApp e Grupos de Anúncios).
- [ ] **Etapa 076:** Construtor de Encurtador de Link de Afiliado com injeção de parâmetros UTM do V5 Poster.
- [ ] **Etapa 077:** Simulador de Preview das Mensagens (Visão idêntica ao balão verde do WhatsApp e ao balão azul do Telegram).
- [ ] **Etapa 078:** Botão de Disparo Instantâneo e Botão de Agendamento em Lote com feedback de status.
- [ ] **Etapa 079:** Histórico de Ofertas Disparadas com data/hora e confirmação de transmissão.
- [ ] **Etapa 080:** Validação de Build Next.js 14 (`npm run build`) com Exit Code 0 e homologação da Transmissão de Grupos VIP.

---

### FASE 9: FILA DE AGENDAMENTO EM BACKGROUND (081 - 090)
- [ ] **Etapa 081:** Arquitetura da Fila de Agendamento (`src/lib/queue/dispatchQueue.ts`) baseada no padrão FIFO com timestamp de execução.
- [ ] **Etapa 082:** Motor de Verificação de Posts Vencidos (Polling / Intervalo de 60 segundos que detecta itens prontos para disparo).
- [ ] **Etapa 083:** Transição de Estados de Tarefa (`scheduled` -> `processing` -> `published` / `failed`).
- [ ] **Etapa 084:** Sistema de Retentativas Automáticas com Backoff Exponencial (Até 3 tentativas em caso de erro 5xx de API).
- [ ] **Etapa 085:** Simulador de Execução de Rede em Lote (Disparo em paralelo de posts vencidos com status individual).
- [ ] **Etapa 086:** Painel Visual de Fila de Background no Dashboard: Exibição de posts em processamento e próximos da fila.
- [ ] **Etapa 087:** Botão de Disparo Forçado Manual ("Executar Agora" para posts agendados sem esperar o horário).
- [ ] **Etapa 088:** Tratamento de Erros e Mensagens Amigáveis de Diagnóstico (Falha de token, timeout, payload inválido).
- [ ] **Etapa 089:** Persistência da Fila no LocalStorage e sincronização entre abas com EventListener.
- [ ] **Etapa 090:** Validação de Build Next.js 14 (`npm run build`) com Exit Code 0 e homologação da Fila de Background.

---

### FASE 10: DASHBOARD DE ANALYTICS DE ENTREGA E LOGS (091 - 100)
- [ ] **Etapa 091:** Painel Executivo de Telemetria de Despacho no Topo da Aplicação (Total Disparados, Taxa de Sucesso %, DMs Enviadas, Alcance Estimado).
- [ ] **Etapa 092:** Gráfico Visual de Distribuição de Posts por Canal (Barras de proporção entre Blog, Email, Redes e Grupos).
- [ ] **Etapa 093:** Tabela de Logs de Auditoria de Despacho com Data/Hora, Plataforma, ID da Mensagem e Código HTTP de Resposta.
- [ ] **Etapa 094:** Drawer / Modal de Inspecionar Payload Completo de Log (visualização do JSON exato enviado e recebido).
- [ ] **Etapa 095:** Filtro de Logs por Status de Sucesso (200/201 OK) vs. Erro (4xx/5xx).
- [ ] **Etapa 096:** Botão de Exportar Logs de Disparo em formato JSON ou CSV para auditoria.
- [ ] **Etapa 097:** Indicador de Latência Média de Despacho (Tempo de resposta das APIs em milissegundos).
- [ ] **Etapa 098:** Botão de Limpar Logs Antigos com confirmação de segurança.
- [ ] **Etapa 099:** Alertas Visuais de Saúde do Sistema (Status do Gateway V5 Apollo API e APIs parceiras).
- [ ] **Etapa 100:** Validação de Build Next.js 14 (`npm run build`) com Exit Code 0 e consolidação da Onda dos 100 Passos.

---

### FASE 11: AUDITORIA, QA, HIGIENIZAÇÃO E HOMOLOGAÇÃO FINAL (101 - 110)
- [ ] **Etapa 101:** Teste E2E de Fluxo do Calendário Mestre (Criação, Edição, Reagendamento e Exclusão de Posts).
- [ ] **Etapa 102:** Teste E2E de Fluxo Dual (Criação de Artigo no Editor Markdown e validação simultânea de E-mail HTML + AutoBlog JSON).
- [ ] **Etapa 103:** Teste E2E de Fluxo Comment-to-DM (Criação de regra, acionamento de simulação e geração de DM).
- [ ] **Etapa 104:** Teste E2E de Fluxo Grupos VIP (Seleção de ofertas, cálculo de desconto e disparo para WhatsApp/Telegram).
- [ ] **Etapa 105:** Verificação de Responsividade Mobile e Tablet em todas as abas do sistema.
- [ ] **Etapa 106:** Auditoria de Performance de Carregamento (Tamanho de Bundles JS, otimização de imports de ícones Lucide).
- [ ] **Etapa 107:** Higienização de Console (Eliminação de warnings do React, chaves ausentes em listas e hooks redundantes).
- [ ] **Etapa 108:** Atualização do `MEMORIA_ATIVA_POSTER.md` com status de homologação de produção.
- [ ] **Etapa 109:** Registro de Status no Hive Bus Central (`antigravity_hive_bus.md`) para comunicação com as outras Capitanias.
- [ ] **Etapa 110:** Homologação Final de Produção (`npm run build`), verificação da Porta `:3011` e Commit de Entrega assinado por `Apollo La Plata <v5estudio@hotmail.com>`.
