# Abertura "o beija-flor puxa a cortina" + menu ao rolar — site Maria Luiza

HTML, CSS e JS puros, sem biblioteca. Abra `abertura-maria-luiza-demo.html` para ver tudo funcionando.

## Onde colar cada trecho

| Arquivo | Onde vai |
|---|---|
| `1-head-inicio.html` | Primeiro item do `<head>`, logo depois do `<meta charset>`. Decide, antes do primeiro paint, se a abertura roda. |
| `2-head-css-abertura.html` | No `<head>`, logo depois do 1, antes de qualquer CSS externo. CSS da camada + fonte do nome. |
| `3-body-camada.html` | Primeira coisa dentro do `<body>`, antes do header. |
| `7-header-logo.html` | Substitui o header atual (mesma estrutura, com os atributos que ligam tudo). |
| `5-menu.css` | Junto do CSS do site. |
| `4-abertura.js` | Antes de `</body>` (inline em `<script>` ou com `<script src>`). |
| `6-menu.js` | Antes de `</body>`, depois do 4. |
| `8-favicon-tags.html` | No `<head>`. Suba `favicon.svg`, `favicon-32.png` e `apple-touch-icon.png` para a raiz do site. |

`beija-flor.svg` é o desenho do símbolo (traço de 1,5 px em qualquer tamanho).

## Atributos que ligam tudo

- `data-abertura-logo` no SVG do logo do header: é ali que o beija-flor pousa (FLIP).
- `data-abertura-sobe` nos elementos do topo que sobem de leve quando a cortina passa por eles (título, texto, botões, foto em arco…).
- `data-menu` no `<header>`; `data-menu-flip` no logo+nome; `data-menu-flip="fim"` no grupo links+WhatsApp (ele desliza medido pela borda direita).

## Ajustes rápidos

- **Tempos e medidas da abertura:** constantes `T` e `M` no topo do `4-abertura.js`, comentadas.
- **Cores e fonte da cortina:** variáveis `--ab-*` no `2-head-css-abertura.html`. Se o site já tem variáveis de cor, aponte para elas (ex.: `--ab-traco: var(--oliva)`).
- **Menu:** variáveis `--menu-*` no `5-menu.css` (alturas, largura da pílula, duração de 420 ms).
- **WhatsApp:** troque `https://wa.me/55DDDNUMERO` pelo número real.
- **Fonte do nome:** Cormorant Garamond 300 itálico. O ideal é hospedar o `.woff2` no site e ativar o `<link rel="preload">` que está comentado no trecho 2.

## Como se comporta

- Roda só na 1ª visita (flag `ml-abertura-vista` no localStorage). `?intro` na URL força de novo.
- Não roda com "reduzir movimento" (nem com `?intro`), quando a pessoa chega por link de seção (`#duvidas`) ou abre o site numa aba em segundo plano.
- Clique, toque, rolagem ou tecla: saída de ~150 ms direto ao estado final. O toque que pulou não aciona o link que estava embaixo da cortina.
- Se o JS falhar, o próprio CSS some com a camada aos 4 s e libera o clique.
- Câmera lenta: `?intro=0.25` (25%) ou, no console, `abertura.tocar(0.1)` (10%). O painel Animations do DevTools não desacelera a cortina (ela roda em requestAnimationFrame); use isso no lugar.

## Roteiro de teste

1. **Primeira visita:** aba anônima → abrir o site. A cortina com o nome aparece já no primeiro quadro, sem piscar o site; ~1,8 s; o beija-flor vira o logo sem troca visível.
2. **Segunda visita:** recarregar. Sem abertura, sem flash da cortina, logo no lugar.
3. **`?intro`:** `seusite.com.br/?intro` roda de novo (para mostrar à cliente). `?intro=0.25` em câmera lenta.
4. **Movimento reduzido:** DevTools › ⋮ › More tools › Rendering › *Emulate CSS media feature prefers-reduced-motion: reduce* (ou no Windows: Configurações › Acessibilidade › Efeitos visuais › Efeitos de animação desligado). Não roda; o menu troca de estado sem animar.
5. **CPU 4x mais lenta:** DevTools › Performance › ⚙ › CPU: *4x slowdown* → gravar com `?intro`. A faixa de quadros deve ficar contínua durante a puxada.
6. **Menu:** rolar mais de ~100 px → vira pílula em ~0,4 s, links somem, WhatsApp fica; voltar ao topo → menu completo. No celular, a pílula fica com 12 px de margem.
