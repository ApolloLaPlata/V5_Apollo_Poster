# AGENTS.md - CAPITANIA #13: V5 APOLLO POSTER

## Identidade & Proposito
O **V5 Apollo Poster** (Porta `:3011`) e a central onicanal de despacho, publicacao, agendamento e engajamento automatizado do ecossistema V5 Apollo Holding.
Ele conecta os canais de conteudo gerados pelas demais capitanias com o mundo exterior de forma 100% nativa via APIs oficiais em nuvem (sem dependencias frageis de extensoes de navegador para usuarios finais).

## 4 Pilares Centrais
1. **Calendario Mestre Onicanal (30 Dias):** Agendamento visual, status em tempo real, disparo programado para redes sociais (Instagram, TikTok, YouTube, Kwai, WordPress REST API, Webhooks).
2. **Motor Dual Beehiiv (Blog + Newsletter):** Redacao unificada onde um unico conteudo vira artigo otimizado para SEO no Auto Blog e edicao disparada por e-mail newsletter (HTML responsivo + Markdown).
3. **Comment-to-DM & Lead Hunter (ChatbotX Inspired):** Monitoramento de comentarios em posts/reels. Quando um seguidor comenta palavras-chave como `EU QUERO`, `LINK` ou `DESCONTO`, dispara resposta publica variada + Direct Message com link rastreado UTM.
4. **Despachador de Grupos VIP (Finders Hub):** Integracao com o V5 Finders para disparo em massa controlado para comunidades WhatsApp e canais Telegram de ofertas com formatacao dinamica, cupons e preco tachado.

## Regras Absolutas de Engenharia
- **Zero Extensao para Usuario:** Nunca obrigar ou fornecer extensoes para o usuario final. Toda publicacao roda via Serverless Worker, Webhooks oficiais ou APIs Meta Graph / TikTok Content Posting / YouTube Data v3 / Resend.
- **Porta Padrao:** Porta `:3011` fixa.
- **Segregacao PixDrop:** Nao fazer mensao ou ligacao ao PixDrop (mercado cinza).
- **Finders e Sagrado:** O Poster e o braco de transmissao do Finders, nunca um substituto.
- **Git Commits:** Assinar sempre como `Apollo La Plata <v5estudio@hotmail.com>`.
