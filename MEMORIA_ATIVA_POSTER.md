# MEMORIA ATIVA - V5 APOLLO POSTER (CAPITANIA #13)

## Status Atual
- **Status:** Fase 1 (Etapas 001 a 010) 100% HOMOLOGADA. Build Next.js 14 em Exit Code 0.
- **Porta:** 3011 fixa.
- **Chave de API Homologada:** `v5_live_v5_master_key_all_access_holding_apollo_2026_unlimited` (Gateway V5 Apollo API)
- **Repositorio de Referencia Absorvido:** `ChatbotX` (`https://github.com/ChatbotXIO/ChatbotX`) clonado em `Pesquisa e Conhecimento/ChatbotX_Repo`.
- **Fundações Concluídas:**
  - Tipagem completa TypeScript (`src/types/poster.ts`).
  - Store Global Zustand com persistência em localStorage (`src/store/usePosterStore.ts`).
  - Barramento de Eventos e Telemetria (`src/lib/events/dispatchEvents.ts`).
  - Utilitários de Saneamento e Formatação (`src/lib/utils/formatters.ts`).
  - Layout e Header Onicanal com badges em tempo real (`src/app/page.tsx`).
  - Banner Dinâmico com telemetria e status de 4 APIs em nuvem (`src/components/ui/V5AppActivationBanner.tsx`).
  - Sistema de Toasts e Notificações com Framer Motion (`src/components/ui/ToastContainer.tsx`).
  - Modal Pré-Voo de Despacho com checklist de conformidade (`src/components/ui/PreflightDispatchModal.tsx`).
  - Seeds oficiais e método de reset para testes autônomos (`src/lib/seeds/posterSeeds.ts`).
  - Auditoria estrita da Fase 1 com `tsc --noEmit` e `npm run build` zerados.
- **Fase 2 Concluída e Homologada (Calendário Mestre Onicanal 011-020):**
  - Grade Mensal Dinâmica de 30 Dias com navegação por mês e filtro por dia (`MasterCalendar.tsx`).
  - 3 Modos de Visualização Operacional (Grade Mensal, Linha do Tempo Semanal 7D e Fila Cronológica Compacta).
  - Filtro Multi-Plataforma interativo para todos os 9 canais com contadores em tempo real.
  - Filtro de Status (`draft`, `scheduled`, `published`, `failed`).
  - Badges semânticos de plataformas com paleta oficial e ícones integrados (`PlatformBadge.tsx`).
  - Indicador e botões de Horários Nobres de Audiência (Slots de pico 11h30, 18h00 e 21h00).
  - Modal Completo de Agendamento de Novo Post (`NewPostScheduleModal.tsx`) com seleção de canais, formatos de mídia e injeção de slots de pico.
  - Ações Rápidas de Item (Editar, Duplicar +24h, Reagendar para amanhã, Forçar Despacho Imediato e Excluir).
  - Reagendamento Rápido Inline nos cards e listas com seletor `datetime-local`, chips rápidos (`+1h`, `+3h`, `+24h`) e slots nobres diretos sem modal externo.
  - Homologação completa com Next.js 14 Build Exit Code 0 e zero erros de tipagem.

## Arquitetura de Integracao
- **V5 Auto Blog:** Recebe o payload do motor dual (Markdown + Tags SEO) e envia para os blogs internos ou WordPress externo do usuario.
- **V5 Finders:** Conecta os achadinhos virais e ofertas monitoradas para disparo instantaneo nos grupos de WhatsApp e Telegram VIP.
- **V5 Edit & Broadcaster:** Envia os videos finais renderizados diretamente para agendamento no TikTok, Instagram Reels e YouTube Shorts com titulos e descricoes gerados.
- **V5 Tools:** Fornece micro-servicos de formatacao, criacao de UTMs, encurtador de links e saneamento de texto.

## Proximas Fases Recomendadas
1. Implementar simulador e conector real da Meta Graph API (OAuth2 Instagram Business / Facebook Pages).
2. Criar fila de agendamento BullMQ / Redis ou cron serverless para checagem de posts pendentes.
3. Conectar provedor de envio de e-mail (Resend / Amazon SES) para newsletters.
4. Conectar Gateway de WhatsApp (Baileys / Evolution API / WhatsApp Cloud API) para envio em grupos.
