# Roteiro de desenvolvimento — site da Malu

Como usar: siga as fases em ordem. Em cada uma, cole o **prompt** no Claude Code, revise o resultado no navegador, confira o **"Pronto quando"** e faça o commit. Entre uma fase e outra, use `/clear` para começar com o contexto limpo (o `CLAUDE.md` é recarregado sozinho). Nas fases 1 e 2, ative o **modo de planejamento** (Shift+Tab) para ver o plano antes de ele mexer nos arquivos.

---

## Fase 0 — Preparação (você, fora do Claude Code)
- [x] Criar a pasta `psico-web/` e rodar `git init`
- [x] Colocar `CLAUDE.md` na raiz e `ROTEIRO.md` + `conteudo.md` em `docs/`
- [x] Copiar a pasta `kit-abertura-maria-luiza/` inteira para a raiz
- [x] Criar repositório **privado** no GitHub e fazer o primeiro push
- [ ] Mandar para a Malu a lista de `docs/conteudo.md` (o que ela precisa enviar)
- [ ] Definir com ela: domínio (ex.: `marialuizapsi.com.br`), quem registra e paga

Commit: `Estrutura inicial do projeto`

---

## Fase 1 — Esqueleto e identidade (tokens)
**Prompt:**
> Leia o CLAUDE.md, o docs/conteudo.md e todos os arquivos do kit-abertura-maria-luiza. Depois monte o esqueleto do site: index.html semântico com as seções Início (hero), Sobre, Como posso ajudar, Como funciona, Produção acadêmica, Dúvidas (id="duvidas") e Contato, mais o rodapé. Use marcadores [[PENDENTE]] onde faltar conteúdo. Crie css/base.css com reset, tokens em :root (cores tiradas das variáveis --ab-* e --menu-* do kit, escala tipográfica fluida com clamp, espaçamentos, raios, sombras) e tipografia. Proponha a fonte de texto que combine com a Cormorant Garamond e configure as duas auto-hospedadas. Me mostre o plano antes de criar os arquivos.

**Pronto quando:** a página abre com todas as seções empilhadas, legível no celular, sem nenhum estilo "inventado" fora dos tokens.
Commit: `Adiciona esqueleto semântico e tokens de design`

---

## Fase 2 — Abertura animada + menu (kit)
**Prompt:**
> Integre o kit de abertura no index.html seguindo exatamente a tabela do CLAUDE.md (trechos 1 e 2 inline no head, camada no começo do body, header do kit, menu.css, abertura.js e menu.js). Ligue os atributos data-abertura-logo, data-abertura-sobe, data-menu e data-menu-flip. Os links do menu devem apontar para as âncoras das seções. Não altere tempos nem medidas do kit. No fim, me passe o roteiro de teste para eu fazer.

**Teste (você, no navegador):**
- [ ] Aba anônima: cortina com o nome desde o 1º quadro; beija-flor vira o logo sem troca visível
- [ ] Recarregar: sem abertura e sem "piscada"
- [ ] `?intro` roda de novo; `?intro=0.25` em câmera lenta
- [ ] DevTools › Rendering › prefers-reduced-motion: reduce → não roda; menu troca sem animar
- [ ] DevTools › Performance › CPU 4x: animação sem engasgos
- [ ] Rolar > 100 px vira pílula; voltar ao topo, menu completo
- [ ] Abrir com `#duvidas` no fim do endereço: sem abertura, vai direto à seção

Commit: `Integra abertura do beija-flor e menu em pílula`

---

## Fase 3 — Hero e Sobre
**Prompt:**
> Desenvolva o hero e a seção Sobre usando os textos do docs/conteudo.md. Hero: nome, "Psicóloga · CRP [número]", frase de apresentação, botão principal de WhatsApp com mensagem pré-preenchida e foto (com fetchpriority high, WebP e dimensões fixas). Os elementos do topo que sobem com a cortina recebem data-abertura-sobe. Sobre: formação, abordagem e o que a move na profissão, em tom acolhedor. Respeite as regras do CFP do CLAUDE.md.

**Pronto quando:** em 360 px, nome, CRP e botão do WhatsApp aparecem sem rolar; a foto não causa salto de layout.
Commit: `Desenvolve hero e seção Sobre`

---

## Fase 4 — Como posso ajudar + Como funciona
**Prompt:**
> Desenvolva "Como posso ajudar" (demandas e público que ela atende, em cards ou lista, sem promessa de resultado) e "Como funciona" (modalidade online e/ou presencial, endereço se houver, duração da sessão, como é o primeiro contato — sem citar preço). Use ícones SVG inline simples e decorativos com aria-hidden.

**Pronto quando:** dá para entender em 10 segundos o que ela atende e como agendar.
Commit: `Adiciona seções de atendimento`

---

## Fase 5 — Produção acadêmica + Dúvidas
**Prompt:**
> Desenvolva "Produção acadêmica" (artigos publicados com link, projetos de extensão; é o diferencial dela por ser recém-formada) e "Dúvidas" (id="duvidas") como acordeão acessível com <details>/<summary>, estilizado e com animação que respeite prefers-reduced-motion. Use as perguntas do docs/conteudo.md.

**Pronto quando:** o acordeão funciona só com teclado e todos os links de artigo abrem em nova aba com rel="noopener".
Commit: `Adiciona produção acadêmica e dúvidas frequentes`

---

## Fase 6 — Contato e rodapé
**Prompt:**
> Desenvolva a seção Contato (WhatsApp em destaque, Instagram, e-mail, cidade/região) e o rodapé com nome completo, "Psicóloga", CRP, aviso "Este site não é um canal de atendimento de emergência. Em situação de crise, ligue 188 (CVV) ou 192 (SAMU)", ano automático e crédito discreto "Site por Princípio Web". Adicione um botão flutuante de WhatsApp só no celular, que não cubra conteúdo nem o menu em pílula.

**Pronto quando:** todo link de contato funciona no celular de verdade.
Commit: `Adiciona contato e rodapé`

---

## Fase 7 — Polimento: responsivo, acessibilidade, performance e ética
**Prompt:**
> Faça uma auditoria completa do site: (1) responsivo em 360, 768, 1280 e 1920 px; (2) acessibilidade — contraste AA, foco visível, ordem de tabulação, link de pular conteúdo, alt, reduzir movimento em tudo; (3) performance — tamanho das imagens, fontes com preload e font-display, CSS/JS desnecessário, CLS; (4) revisão ética — releia todos os textos contra as regras do CFP do CLAUDE.md e liste qualquer trecho problemático. Me entregue a lista de problemas antes de corrigir.

**Você:** rodar Lighthouse (aba anônima, modo mobile) e colar o resultado para o Claude Code corrigir o que faltar.
**Pronto quando:** Lighthouse mobile ≥ 90 nas 4 categorias e nenhum `[[PENDENTE]]` sobrando (busque no projeto).
Commit: `Polimento de acessibilidade, performance e conteúdo`

---

## Fase 8 — SEO e pré-publicação
**Prompt:**
> Prepare o site para publicação: title e meta description pensados para busca local ("psicóloga em [cidade]"), canonical com o domínio final, Open Graph e Twitter Card com uma imagem de compartilhamento 1200x630 (crie a partir das cores e da fonte do site), JSON-LD Person + ProfessionalService, sitemap.xml, robots.txt e uma 404.html no mesmo visual.

**Pronto quando:** colar o link no WhatsApp mostra a prévia certa (testar depois do deploy).
Commit: `Adiciona SEO e página 404`

---

## Fase 9 — Deploy e entrega
- [ ] Publicar (Netlify, Vercel ou GitHub Pages, ligado ao repositório: cada push publica sozinho)
- [ ] Apontar o domínio e conferir HTTPS
- [ ] Testar no celular real (Android e iPhone, se possível): abertura, menu, WhatsApp
- [ ] Testar a prévia do link no WhatsApp e no Instagram
- [ ] Sugerir à Malu: cadastrar o site no Perfil da Empresa no Google e colocar o link na bio do Instagram
- [ ] Entregar: link, como pedir alterações, o que está incluso na manutenção

**Prompt (opcional, antes de publicar):**
> Revise o projeto inteiro como se fosse a entrega final: links quebrados, arquivos não usados, console, peso total da página e se tudo do CLAUDE.md foi cumprido. Liste o que achar.
