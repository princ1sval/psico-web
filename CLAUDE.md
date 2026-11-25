# Site da Maria Luiza (Malu) — psicóloga

## O que é
Site-vitrine de página única para **Maria Luiza**, psicóloga recém-formada (tem artigos publicados e participou de projetos de extensão). Objetivo: apresentar a profissional, transmitir acolhimento e confiança, e levar o visitante a **chamar no WhatsApp**.
Desenvolvido por João Pedro (Princípio Web). Projeto interno: "psico web".

## Stack e restrições
- **HTML, CSS e JS puros.** Sem framework, sem bundler, sem npm, sem jQuery, sem biblioteca de animação. Tem que funcionar servido por qualquer servidor estático.
- Uma página só (`index.html`) com seções âncora. Página extra apenas se necessária (ex.: `404.html`).
- **Mobile-first.** Conferir em 360 px, 768 px e 1280 px.
- **Sem formulário e sem coleta de dados.** O contato é por link do WhatsApp. Não adicionar Analytics, pixel ou qualquer script de terceiros sem combinar antes (LGPD).
- Fonte do nome: Cormorant Garamond 300 itálico, **auto-hospedada** (`assets/fonts/*.woff2`). Fonte de texto: definir na Fase 1 (sans legível, também auto-hospedada).

## Estrutura de pastas
```
/
├─ index.html
├─ 404.html
├─ favicon.svg, favicon-32.png, apple-touch-icon.png
├─ robots.txt, sitemap.xml
├─ css/   base.css (tokens, reset, tipografia) · secoes.css · menu.css
├─ js/    abertura.js · menu.js · (outros só se precisar)
├─ assets/ img/ · fonts/
├─ docs/  ROTEIRO.md · conteudo.md
└─ kit-abertura-maria-luiza/   ← referência original, NÃO editar
```

## Kit de abertura (já pronto — integrar, não reescrever)
A pasta `kit-abertura-maria-luiza/` tem a abertura "o beija-flor puxa a cortina" (1,8 s) e o menu que vira pílula ao rolar. Copie os trechos para o site; não altere o kit.

| Arquivo do kit | Onde vai |
|---|---|
| `1-head-inicio.html` | **Inline**, primeiro item do `<head>`, logo após `<meta charset>` (decide antes do 1º paint se põe `html.intro`). |
| `2-head-css-abertura.html` | **Inline** no `<head>`, logo após o 1, antes de qualquer CSS externo. |
| `3-body-camada.html` | Primeira coisa dentro do `<body>`, antes do header. |
| `7-header-logo.html` | É o header do site. |
| `5-menu.css` | → `css/menu.css`. |
| `4-abertura.js` | → `js/abertura.js`, antes de `</body>`. |
| `6-menu.js` | → `js/menu.js`, antes de `</body>`, depois do abertura.js. |
| `8-favicon-tags.html` | No `<head>`; favicons na raiz. |

Atributos que ligam tudo: `data-abertura-logo` (SVG do logo, destino do FLIP), `data-abertura-sobe` (elementos do topo que sobem quando a cortina passa), `data-menu` no `<header>`, `data-menu-flip` no logo+nome, `data-menu-flip="fim"` no grupo links+WhatsApp.
Ajustes: constantes `T` e `M` em `abertura.js`; variáveis `--ab-*` (cortina) e `--menu-*` (menu). **Não mude tempos e medidas sem perguntar.**
Comportamento esperado: roda **em toda visita e a cada recarregamento** (decisão do João: o trecho 1 inline no `index.html` foi adaptado e não usa mais a flag `ml-abertura-vista` do kit, nem localStorage); `?intro` força (inclusive com `#seção`); `?intro=0.25` = câmera lenta; não roda com reduzir movimento, ao **chegar** por link de seção (`#duvidas`) ou em aba de segundo plano; ao **recarregar** com `#seção`, o `#` sai do endereço e a abertura roda do topo; clique/toque/rolagem/tecla pula; se o JS quebrar, o CSS remove a camada aos 4 s.

## Regras éticas do CFP — valem para TODO texto do site
- Nome completo + "Psicóloga" + **número do CRP** visíveis (hero e rodapé).
- **Sem preço** como propaganda: nada de valores, descontos, "primeira sessão grátis", pacotes.
- **Sem depoimentos de pacientes.**
- **Sem promessa de resultado** ("supere a ansiedade em 8 sessões"), sem sensacionalismo, sem antes/depois.
- Só títulos, formações e técnicas que ela realmente tem e que são reconhecidos pela profissão.
- Sem autopromoção que diminua colegas ("o melhor atendimento da cidade").
- Rodapé com aviso de que o site não é canal de emergência: **CVV 188** e **SAMU 192**.
- Tom acolhedor e claro, sem linguagem de diagnóstico.

## Conteúdo
- Textos reais ficam em `docs/conteudo.md`. **Nunca invente** formação, CRP, artigos, endereço, telefone ou abordagem.
- Onde faltar algo, use o marcador visível `[[PENDENTE: descrição]]` (fácil de achar com busca). Texto provisório pode existir, mas sempre marcado.

## Definição de pronto (qualidade)
- HTML semântico: um `<h1>`, hierarquia de títulos correta, `header`/`main`/`section`/`footer`, link "pular para o conteúdo".
- Acessibilidade: contraste AA, foco visível, navegação por teclado, `alt` em imagens, `prefers-reduced-motion` respeitado em **todas** as animações.
- Performance: Lighthouse mobile ≥ 90 nas 4 categorias; imagens WebP/AVIF com `width`/`height`; `loading="lazy"` abaixo da dobra; foto principal com `fetchpriority="high"`; nada de CLS.
- SEO: `title`, meta description, canonical, Open Graph, JSON-LD (Person + ProfessionalService), `sitemap.xml`, `robots.txt`, `lang="pt-BR"`.
- Zero erros no console.

## Jeito de trabalhar
- Seguir `docs/ROTEIRO.md`, **uma fase por vez**. Ao terminar: marcar os checkboxes da fase e resumir o que mudou e o que ficou pendente.
- Antes de mudanças grandes, apresentar um plano curto e esperar o ok.
- Nomes de classes, variáveis e comentários em **português**, no padrão do kit (`data-abertura-*`, `--menu-*`, `--ab-*`). CSS com variáveis em `:root` (tokens em `base.css`).
- Commits pequenos, mensagem em português no imperativo (ex.: "Adiciona seção Sobre").
- Para testar localmente: `python -m http.server 8000` (ou Live Server do VS Code) e abrir `http://localhost:8000`.
