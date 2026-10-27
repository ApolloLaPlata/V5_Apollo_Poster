# MEMORIA ATIVA - V5 APOLLO POSTER (CAPITANIA #13)

## Status Atual
- **Status:** Scaffold inicial e motores de front-end v0.1.0 operacionais.
- **Porta:** 3011
- **Chave de API Homologada:** `v5_live_v5_master_key_all_access_holding_apollo_2026_unlimited` (Gateway V5 Apollo API)
- **Repositorio de Referencia Absorvido:** `ChatbotX` (`https://github.com/ChatbotXIO/ChatbotX`) clonado em `Pesquisa e Conhecimento/ChatbotX_Repo`.

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
