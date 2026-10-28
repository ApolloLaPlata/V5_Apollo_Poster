# MEMORIA ATIVA - V5 APOLLO POSTER (CAPITANIA #13)

## Status Atual
- **Status:** Redesign Mestre Concluído com Sucesso. `SocialPublishingStudio` homologado como tela inicial padrão. Fases 1 a 11 100% HOMOLOGADAS. Build Next.js 14 em Exit Code 0 e 61/61 testes verdes.
- **Porta:** `:3011` fixa (`next dev -p 3011`).
- **Assinatura Git Oficial:** `Apollo La Plata <v5estudio@hotmail.com>`
- **Zero Extensão para Usuário:** 100% Native Cloud APIs (Meta Graph, TikTok Content, YouTube Data v3, Resend, WordPress REST API, Telegram Bot API, WhatsApp Cloud API).
- **Chave de API Homologada:** `v5_live_v5_master_key_all_access_holding_apollo_2026_unlimited` (Gateway V5 Apollo API)
- **Repositório de Referência Absorvido:** `ChatbotX` (`https://github.com/ChatbotXIO/ChatbotX`).

## Os 4 Pilares Centrais Homologados
1. **Estúdio de Criação Onicanal (SocialPublishingStudio):** Compositor unificado para 7 redes simultâneas com seletor interativo, Live Smartphone Simulator em tempo real (Instagram, TikTok, WhatsApp, AutoBlog), injetor de UTM, cálculo de caracteres e botões de disparo de horários nobres (12h, 18h30, 20h30).
2. **Calendário Mestre Onicanal (30 Dias):** Agendamento visual mensal/semanal/lista, status em tempo real, detecção de Horário Nobre (Prime Time), suporte a 11 canais, reagendamento com preservação de timezone local via `formatLocalDateTimeInput`.
3. **Motor Dual Beehiiv (Blog + Newsletter):** Redação unificada em Markdown rico com conversão simultânea para E-mail HTML responsivo (CAN-SPAM/GDPR opt-out, preheader invisível, UTMs) e JSON estruturado com metadados de SEO (OpenGraph, Twitter Cards, Schema.org BlogPosting, Taxonomia AEO e Auditor Heurístico Anti-Spam).
4. **Comment-to-DM & Lead Hunter (ChatbotX):** Monitoramento de comentários, normalização cognitiva com isolamento de fronteiras de palavras `\b`, 4 modos de match (contains, exact, regex, fuzzy), anti-ban rate limiting (30 DMs/min com jitter estocástico de 2s a 5s), rotação de respostas públicas e templates de DM com placeholders e links UTM dedicados.
5. **Despachador de Grupos VIP (Finders Hub):** Seleção de achadinhos Shopee/Mercado Livre/Amazon/AliExpress/Magalu, cálculo de descontos sem erros de float, categorização psicológica de pechinchas e transmissão para WhatsApp e Telegram VIP.

## Infraestrutura & Telemetria
- **Gaveta Técnica Recolhível:** Todos os dados de telemetria SOC2, pings de rede, latência P95 e métricas de infraestrutura foram movidos para uma gaveta recolhível na base da tela, mantendo a área de trabalho 100% limpa e focada no produto.
- **Fila de Agendamento em Background (FIFO):** Motor com scanner contínuo de 60s (`useOverdueScanner`), retentativas automáticas com backoff exponencial, persistência com fallback em memória e sincronização multi-abas em tempo real (`BroadcastChannel` / `useCrossTabQueueSync`).
- **Dashboard de Auditoria & Telemetria SOC2:** Logs estruturados com Remote Message ID, status HTTP enriquecido, drawer de inspeção JSON de payloads, filtros granulares por status 2xx/4xx/5xx, exportação SOC2 JSON/CSV RFC 4180 e monitor de latência global P95 e SLA do sistema.

## Hardening de Bugs & Resiliência Concluídos
- **Fuso Horário & Datetime Local:** `formatLocalDateTimeInput` eliminou desvios UTC em reagendamentos e duplicações.
- **Defensividade Numérica:** Blindados acessos com `.toFixed(2)` contra valores nulos/indefinidos em métricas e ofertas.
- **Proteção Anti-Crash em Textos:** `evaluateExcerptQuality`, `cleanMarkdownForExcerpt` e `validateDmTemplate` toleram `null` e `undefined` com segurança.
- **Estabilização de Hooks React:** Callbacks `onOverdueDetected` e `onSyncReceived` estabilizados com `useRef`, eliminando loops e destruição constante de timers e listeners.
- **Hardening Cognitivo de Gatilhos:** Prevenção de match falso global por keywords vazias/símbolos via `/(?!)/` e isolamento estrito de `\b`.
- **Validação de Variantes:** `validateAntiSpamDiversity` e `getNextPublicReply` blindados contra arrays nulos.
- **Suíte de Testes:** 61/61 testes de hardening aprovados em `scripts/test-bugfixes.ts`.
