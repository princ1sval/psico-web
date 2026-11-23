/* 6) Cole antes de </body>, depois do 4-abertura.js */
/* ==========================================================================
   MENU AO ROLAR — vira pílula depois de ~100 px de rolagem.
   Detecção por IntersectionObserver (nada de listener de scroll).
   Logo, links e WhatsApp deslizam com FLIP (só transform); o fundo
   muda de forma com clip-path no CSS.
   ========================================================================== */
(() => {
  'use strict';
  const LIMITE = 100;                              // px de rolagem para virar pílula
  const DUR = 420;                                 // ms (igual a --menu-dur)
  const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';   // igual a --menu-ease

  const menu = document.querySelector('[data-menu]');
  if (!menu || !('IntersectionObserver' in window)) return;
  const moveis = [...menu.querySelectorAll('[data-menu-flip]')];
  const animacoes = new Map();
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)');

  // Ponto de referência de cada peça: data-menu-flip="fim" mede pela borda direita
  // (o grupo links + WhatsApp muda de largura, mas o WhatsApp fica sempre na ponta)
  const ponto = (el) => {
    const r = el.getBoundingClientRect();
    return { x: el.dataset.menuFlip === 'fim' ? r.right : r.left, y: r.top + r.height / 2, w: r.width };
  };

  // Sentinela invisível nos primeiros 100 px da página
  const sentinela = document.createElement('div');
  sentinela.setAttribute('aria-hidden', 'true');
  sentinela.style.cssText = `position:absolute;top:0;left:0;width:1px;height:${LIMITE}px;pointer-events:none;visibility:hidden`;
  document.body.prepend(sentinela);

  let primeiraVez = true;
  new IntersectionObserver(([registro]) => {
    const pilula = !registro.isIntersecting;
    const animar = !primeiraVez && !reduzir.matches;
    primeiraVez = false;
    if (pilula !== menu.classList.contains('menu--pilula')) trocar(pilula, animar);
  }).observe(sentinela);

  function trocar(pilula, animar) {
    if (!animar) {
      animacoes.forEach((a) => a.cancel());
      menu.classList.toggle('menu--pilula', pilula);
      return;
    }
    // FLIP: mede onde está (inclusive no meio de uma animação), troca, mede de novo, anima a diferença
    const antes = moveis.map(ponto);
    animacoes.forEach((a) => a.cancel());
    animacoes.clear();
    menu.classList.toggle('menu--pilula', pilula);
    moveis.forEach((el, i) => {
      const depois = ponto(el);
      const dx = antes[i].x - depois.x;
      const dy = antes[i].y - depois.y;
      if (!depois.w || (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5)) return;
      animacoes.set(el, el.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }], { duration: DUR, easing: EASE }));
    });
  }
})();
