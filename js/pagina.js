/* ==========================================================================
   PÁGINA — pequenos detalhes fora do kit
   1. Ano automático no rodapé
   2. Botão flutuante de WhatsApp (só no celular, pelo CSS): aparece depois
      que o topo sai da tela e some quando o Contato ou o rodapé aparecem,
      para não repetir o botão nem cobrir o conteúdo do fim da página.
   ========================================================================== */
(function () {
  var ano = document.querySelector('[data-ano]');
  if (ano) ano.textContent = new Date().getFullYear();

  var botao = document.querySelector('[data-flutuante]');
  if (!botao || !('IntersectionObserver' in window)) return;
  var topo = document.getElementById('topo');
  var fim = [document.getElementById('contato'), document.querySelector('footer')];
  var vendoTopo = true, vendoFim = false, visiveis = new Set();

  function atualiza() {
    botao.classList.toggle('flutuante--visivel', !vendoTopo && !vendoFim);
  }
  new IntersectionObserver(function (e) {
    vendoTopo = e[0].isIntersecting; atualiza();
  }).observe(topo);
  var observaFim = new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target); });
    vendoFim = visiveis.size > 0; atualiza();
  });
  fim.forEach(function (el) { if (el) observaFim.observe(el); });
})();
