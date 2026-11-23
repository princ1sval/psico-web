/* 4) Cole antes de </body> dentro de <script>…</script> (ou carregue este arquivo com <script src> no fim do body) */
/* ==========================================================================
   ABERTURA — "o beija-flor puxa a cortina"  ·  site Maria Luiza
   --------------------------------------------------------------------------
   Roda só quando o script do <head> pôs a classe .intro no <html>
   (1ª visita, ?intro na URL, e nunca com "reduzir movimento").
   Tudo é calculado pelo relógio, num único laço de requestAnimationFrame:
   a curva da borda (um único path), o nome recortado e o beija-flor.
   Cole antes de </body>, depois do HTML do site.
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- AJUSTES: tempos (segundos, contados do início) ------------- */
  const T = {
    chegada:    0.40,  // 1. ENTRADA: chega ao meio da borda de baixo
    pega:       0.50,  // 2. PEGADA: encosta o bico na borda e segura
    puxadinha:  0.60,  //    puxãozinho: a borda sobe e abre uma fresta do site
    respira:    0.70,  //    recolhe um pouquinho (antecipação) e começa a subir
    solta:      1.28,  // 3. PUXADA: chega perto do topo e solta a cortina
    cortinaSai: 1.58,  //    a cortina sobe sozinha e sai pelo topo (some da tela ~1,45 s)
    voo:        1.42,  // 4. POUSO: começa o arco curto até o logo
    assenta:    0.14,  //    últimos 0,14 s: o logo real assenta sozinho (2 px de overshoot)
    fim:        1.80,  //    fim = duração total
    batida:     0.030, // troca de pose das asas (~30 ms)
    rastro:     0.30,  // o rastro pontilhado some em ~300 ms
    pular:      0.15,  // saída rápida ao clicar, tocar, rolar ou teclar
    fonte:      0.60,  // espera máxima pela fonte do nome antes de começar
  };

  /* ---------- AJUSTES: medidas -------------------------------------------- */
  const M = {
    passaro:   [72, 0.16, 112], // tamanho do beija-flor: clamp(72px, 16vmin, 112px)
    inclina:   34,   // graus: inclinação enquanto segura (bico apontando para a borda)
    pairar:    3,    // ± px de pairar
    puxadinha: 16,   // px que a borda sobe no puxãozinho
    respira:   6,    // px que ele recolhe antes de puxar
    topo:      0.34, // onde ele solta a cortina, logo abaixo do nome (fração da altura da tela)
    arco:      0.13, // profundidade do arco da borda na puxada (fração da largura)…
    arcoMin:   44,   //   …nunca menos que isso (px)
    arcoMax:   170,  //   …nem mais que isso (px)
    franzido:  9,    // px que as pontas ficam abaixo do centro no puxãozinho
    onda:      [4, 0.008, 10], // ondulação ao soltar: clamp(4px, 0,8% da largura, 10px)
    nome:      0.45, // o nome sobe a 45% da velocidade da borda (mais devagar)
    sobe:      14,   // px que os elementos do topo sobem ao serem revelados
    freio:     5,    // px de overshoot ao frear na chegada
    pouso:     2,    // px de overshoot ao assentar no logo
    margem:    48,   // a borda passa um pouco das laterais da tela
  };

  /* ---------- Curvas de aceleração (as mesmas do CSS) --------------------- */
  const CURVA = {
    entrada: [0.16, 1, 0.3, 1],     // entradas
    meio:    [0.65, 0, 0.35, 1],    // movimentos que começam e terminam parados
    pouso:   [0.34, 1.56, 0.64, 1], // pousos: overshoot sutil
  };

  /* ---------- Pontos do desenho (viewBox 0 0 100 100) --------------------- */
  const BICO = [95, 50.6];  // ponta do bico: é ela que segura a borda
  const CENTRO = [55, 50];  // centro do corpo: eixo de giro e de escala
  const CICLO = [0, 1, 2, 1]; // poses na batida: 0 alta (= logo), 1 meia, 2 baixa

  /* ======================================================================== */

  const html = document.documentElement;
  const CHAVE_SOBE = 'data-abertura-sobe';
  const limita = (v, a, b) => (v < a ? a : v > b ? b : v);
  const mistura = (a, b, k) => a + (b - a) * k;
  const fase = (t, a, b) => limita((t - a) / (b - a), 0, 1);
  const suave = (k) => k * k * (3 - 2 * k);
  const seno2 = (k) => { const v = Math.sin(Math.PI * k); return v * v; };
  const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const r1 = (v) => Math.round(v * 10) / 10;
  const r2 = (v) => Math.round(v * 100) / 100;
  const cssCurva = (c) => `cubic-bezier(${c.join(', ')})`;
  const pausa = (ms) => new Promise((ok) => setTimeout(ok, ms));

  // cubic-bezier igual ao do CSS
  function curva([x1, y1, x2, y2]) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (s) => ((ax * s + bx) * s + cx) * s;
    const Y = (s) => ((ay * s + by) * s + cy) * s;
    const dX = (s) => (3 * ax * s + 2 * bx) * s + cx;
    return (x) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let s = x;
      for (let i = 0; i < 8; i++) {
        const e = X(s) - x;
        if (Math.abs(e) < 1e-6) return Y(s);
        const d = dX(s);
        if (Math.abs(d) < 1e-6) break;
        s -= e / d;
      }
      let lo = 0, hi = 1;
      s = x;
      for (let i = 0; i < 32; i++) {
        const v = X(s);
        if (Math.abs(v - x) < 1e-6) break;
        if (v < x) lo = s; else hi = s;
        s = (lo + hi) / 2;
      }
      return Y(s);
    };
  }
  const E = { entrada: curva(CURVA.entrada), meio: curva(CURVA.meio), pouso: curva(CURVA.pouso) };

  // overshoot do cubic-bezier de pouso (~9,8%) e sua velocidade inicial
  let picoPouso = 0;
  for (let i = 1; i < 400; i++) picoPouso = Math.max(picoPouso, E.pouso(i / 400) - 1);
  const arranquePouso = CURVA.pouso[1] / CURVA.pouso[0];

  // Soma ao fim de uma curva um overshoot calibrado (fração do trajeto), mantendo a parada suave.
  function comOvershoot(base, fracao, inicio) {
    const bossa = (u) => (u <= inicio ? 0 : seno2((u - inicio) / (1 - inicio)));
    const excesso = (f) => {
      let m = 0;
      for (let i = 1; i <= 200; i++) { const u = i / 200; m = Math.max(m, base(u) + f * bossa(u)); }
      return m - 1;
    };
    let lo = 0, hi = 0.6;
    for (let i = 0; i < 22; i++) { const f = (lo + hi) / 2; if (excesso(f) < fracao) lo = f; else hi = f; }
    const f = (lo + hi) / 2;
    return (u) => (u <= 0 ? 0 : u >= 1 ? 1 : base(u) + f * bossa(u));
  }

  // Bézier quadrática: ponto e derivada
  const bq = (a, c, b, u) => {
    const v = 1 - u;
    return [v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]];
  };
  const bqD = (a, c, b, u) => [
    2 * (1 - u) * (c[0] - a[0]) + 2 * u * (b[0] - c[0]),
    2 * (1 - u) * (c[1] - a[1]) + 2 * u * (b[1] - c[1]),
  ];
  const gira = ([x, y], graus) => {
    const a = (graus * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    return [x * c - y * s, x * s + y * c];
  };
  // posição do centro do corpo para a ponta do bico ficar num ponto
  const centroPelaPonta = (ponta, r, s) => {
    const o = gira([(BICO[0] - CENTRO[0]) * s, (BICO[1] - CENTRO[1]) * s], r);
    return [ponta[0] - o[0], ponta[1] - o[1]];
  };

  /* ---------- Câmera lenta (para revisar) ----------------------------------
     O painel Animations do DevTools não desacelera requestAnimationFrame, então:
     ?intro=0.25 na URL (25%) ou, no console, abertura.tocar(0.1) (10%). */
  const lerVel = (v) => { const n = parseFloat(v); return n > 0 && n <= 1 ? n : 1; };
  let vel = 1;
  try { vel = lerVel(new URLSearchParams(location.search).get('intro')); } catch (e) {}

  /* ---------- Estado ------------------------------------------------------- */
  let camada = document.getElementById('abertura');
  const molde = camada ? camada.cloneNode(true) : null; // para "rever animação"
  let el = {};          // elementos da camada
  let logo = null;      // logo real do menu
  let estado = 'parado';
  let raf = 0, t0 = 0;
  let W = 0, H = 0, tam = 0, esc = 1, yRepouso = 0, yTopo = 0, ySai = 0, onda = 0, atrasoMax = 0.04;
  let P0, C0, P2, pEntrada, pouso, sobem = [], ultimoD = '', asasAntes = '', rastroLigado = false;
  let rolagemInicial = 0, fonteOk = true;

  /* ---------- Geometria do instante t --------------------------------------- */

  // 1. Entrada: o centro do corpo percorre uma quadrática P0 → C0 → P2
  function naEntrada(t) {
    const u = fase(t, 0, T.chegada);
    const p = pEntrada(u);
    const c = bq(P0, C0, P2, p);
    const d = bqD(P0, C0, P2, p);
    const rumo = (Math.atan2(d[1], d[0]) * 180) / Math.PI;
    const vel = limita((pEntrada(Math.min(1, u + 0.01)) - p) / 0.01 / (CURVA.entrada[1] / CURVA.entrada[0]), 0, 1);
    const inclinacao = limita(rumo * 0.55, -12, 40) * Math.sqrt(vel); // corpo inclina na direção do voo
    return { c, r: mistura(inclinacao, M.inclina, suave(fase(u, 0.35, 1))), s: esc };
  }

  // 2–3. Ponta do bico (manda na borda enquanto segura)
  function pontaY(t) {
    let y;
    if (t < T.pega) y = mistura(yRepouso - 4, yRepouso, suave(fase(t, T.chegada, T.pega)));
    else if (t < T.puxadinha) y = mistura(yRepouso, yRepouso - M.puxadinha, suave(fase(t, T.pega, T.puxadinha)));
    else if (t < T.respira) y = mistura(yRepouso - M.puxadinha, yRepouso - M.puxadinha + M.respira, suave(fase(t, T.puxadinha, T.respira)));
    else y = mistura(yRepouso - M.puxadinha + M.respira, yTopo, E.meio(fase(t, T.respira, T.solta)));
    const pairando = suave(fase(t, T.chegada, T.chegada + 0.06)) * (1 - suave(fase(t, T.respira - 0.02, T.respira + 0.1)));
    return y + M.pairar * Math.sin((2 * Math.PI * (t - T.pega)) / 0.3) * pairando; // zero exato na pegada
  }
  function segurando(t) {
    const k = fase(t, T.respira, T.solta);
    const r = M.inclina - 12 * seno2(k) - 6 * suave(k); // fica mais em pé no meio da subida
    return { c: centroPelaPonta([W / 2, pontaY(t)], r, esc), r, s: esc };
  }

  // depois de soltar: pequeno impulso para cima, aceno do bico, deriva para o lado do logo
  function solto(t) {
    const k = fase(t, T.solta, T.voo);
    const ponta = [
      W / 2 - W * 0.025 * suave(k),
      yTopo - 7 * seno2(k) + 2 * Math.sin((2 * Math.PI * (t - T.solta)) / 0.3) * seno2(k),
    ];
    const r = M.inclina - 6 - 12 * seno2(k);
    return { c: centroPelaPonta(ponta, r, esc), r, s: esc };
  }

  // 4. Pouso (FLIP): mede o logo e monta voo + assentamento com velocidade contínua
  function planejarPouso() {
    const ini = solto(T.voo);
    const L = logo && logo.getBoundingClientRect();
    if (!L || L.width < 2) { pouso = { semLogo: true, ini }; return; }
    const sL = L.width / 100;
    const alvo = [L.left + CENTRO[0] * sL, L.top + CENTRO[1] * sL];
    const reta = [alvo[0] - ini.c[0], alvo[1] - ini.c[1]];
    const n = Math.hypot(reta[0], reta[1]) || 1;
    // chega ao logo subindo um pouco mais que a linha reta → arco
    const dir = gira([reta[0] / n, reta[1] / n], reta[0] < 0 ? 28 : -28);
    const D = M.pouso / picoPouso;                 // trecho final em que a curva de pouso dá 2 px de overshoot
    const pre = [alvo[0] - dir[0] * D, alvo[1] - dir[1] * D];
    const lambda = Math.max(0.45 * dist(ini.c, pre), 8);
    const C = [pre[0] - dir[0] * lambda, pre[1] - dir[1] * lambda];
    const Df = T.fim - T.assenta - T.voo;
    const vAssenta = (arranquePouso * D) / T.assenta;          // velocidade com que o assentamento começa
    const m = limita((vAssenta * Df) / (2 * lambda), 0, 1.4);  // o voo termina exatamente nessa velocidade
    pouso = { ini, sL, alvo, dir, D, pre, C, Df, voo: curva([0.65, 0, 0.35, 1 - m * 0.65]) };
  }
  function pousando(t) {
    const P = pouso;
    if (P.semLogo) return P.ini;
    if (t < T.voo + P.Df) {
      const u = fase(t, T.voo, T.voo + P.Df);
      const k = E.meio(u);
      return { c: bq(P.ini.c, P.C, P.pre, P.voo(u)), r: mistura(P.ini.r, 0, k) - 7 * seno2(u), s: mistura(P.ini.s, P.sL, k) };
    }
    const k = E.pouso(fase(t, T.voo + P.Df, T.fim));
    return { c: [P.pre[0] + P.dir[0] * P.D * k, P.pre[1] + P.dir[1] * P.D * k], r: 0, s: P.sL };
  }

  // Centro da borda: preso ao bico entre a pegada e a soltura; depois sobe sozinho
  function yCentro(t) {
    if (t <= T.pega) return yRepouso;
    if (t <= T.solta) return Math.min(yRepouso, pontaY(t));
    return mistura(yTopo, ySai, E.meio(fase(t, T.solta, T.cortinaSai)));
  }
  // Borda em x: as pontas repetem o centro com atraso (tecido leve) → arco
  function yBorda(x, t) {
    if (t <= T.pega) return yRepouso;
    const u = limita(Math.abs(x - W / 2) / (W / 2 + M.margem), 0, 1);
    const w = Math.pow(u, 1.7);
    const yc = yCentro(t);
    const cap = 1.25 * limita(W * M.arco, M.arcoMin, M.arcoMax);
    let y = yc + cap * Math.tanh((yCentro(t - atrasoMax * w) - yc) / cap);
    y += M.franzido * w * suave(fase(t, T.pega, T.puxadinha)) * (1 - suave(fase(t, T.respira, T.respira + 0.3)));
    if (t > T.solta) { // pequena ondulação quando ele solta
      const tau = t - T.solta;
      y += onda * Math.exp(-tau / 0.11) * suave(fase(tau, 0, 0.05)) * Math.sin(2 * Math.PI * ((1.5 * x) / W) - (2 * Math.PI * tau) / 0.2);
    }
    return Math.min(yRepouso, y);
  }

  // Asas: 3 poses trocando a cada ~30 ms + asa fantasma translúcida.
  // No pouso desaceleram (35 → 45 → 50 ms) e fecham na pose de repouso antes de virar o logo.
  function asasEm(t) {
    const rapido = T.fim - T.assenta - 0.19;
    if (t < rapido) {
      const i = Math.floor(t / T.batida);
      const op = 0.22 * (1 - suave(fase(t, rapido - 0.05, rapido + 0.02)));
      return [CICLO[i % 4], CICLO[(i + 3) % 4], CICLO[(i + 3) % 4], CICLO[(i + 2) % 4], op];
    }
    const k = t - rapido;
    const f = k < 0.035 ? 1 : k < 0.08 ? 2 : k < 0.13 ? 1 : 0;
    const tr = k < 0.045 ? 1 : k < 0.09 ? 2 : k < 0.14 ? 1 : 0;
    return [f, tr, -1, -1, 0];
  }

  /* ---------- Desenho do quadro ------------------------------------------- */
  function desenhar(t) {
    let e;
    if (t < T.chegada) e = naEntrada(t);
    else if (t < T.solta) e = segurando(t);
    else if (t < T.voo) e = solto(t);
    else {
      if (!pouso) planejarPouso();
      e = pousando(t);
      if (pouso.semLogo) el.ceu.style.opacity = String(1 - suave(fase(t, T.voo, T.fim)));
    }
    el.passaro.setAttribute('transform',
      `translate(${r2(e.c[0])} ${r2(e.c[1])}) rotate(${r2(e.r)}) scale(${Math.round(e.s * 1e4) / 1e4}) translate(${-CENTRO[0]} ${-CENTRO[1]})`);
    desenharAsas(t);
    desenharRastro(t);
    desenharBorda(t);
    el.nome.setAttribute('transform', `translate(0 ${r1(M.nome * (yCentro(t) - yRepouso))})`);
    revelarTopo(t);
  }

  function desenharAsas(t) {
    const [f, tr, ff, ft, op] = asasEm(t);
    const chave = `${f}${tr}${ff}${ft}${op.toFixed(2)}`;
    if (chave === asasAntes) return;
    asasAntes = chave;
    el.frente.forEach((p, i) => { p.style.opacity = i === f ? 1 : i === ff ? op : 0; });
    el.tras.forEach((p, i) => { p.style.opacity = i === tr ? 1 : i === ft ? op : 0; });
  }

  function desenharRastro(t) {
    const cab = pEntrada(fase(t - 0.04, 0, T.chegada));
    const cau = pEntrada(fase(t - T.rastro, 0, T.chegada));
    if (t > T.chegada + T.rastro || cab - cau < 0.002) {
      if (rastroLigado) { el.rastro.setAttribute('d', ''); rastroLigado = false; }
      return;
    }
    // sub-curva [0, cab]: os pontinhos ficam parados no lugar, só o degradê anda
    const q1 = [mistura(P0[0], C0[0], cab), mistura(P0[1], C0[1], cab)];
    const q2 = bq(P0, C0, P2, cab);
    const a = bq(P0, C0, P2, cau);
    el.rastro.setAttribute('d', `M${r1(P0[0])} ${r1(P0[1])}Q${r1(q1[0])} ${r1(q1[1])} ${r1(q2[0])} ${r1(q2[1])}`);
    el.rastroCor.setAttribute('x1', r1(a[0])); el.rastroCor.setAttribute('y1', r1(a[1]));
    el.rastroCor.setAttribute('x2', r1(q2[0])); el.rastroCor.setAttribute('y2', r1(q2[1]));
    rastroLigado = true;
  }

  // Um único path para a curva: preenche a cortina, recorta o nome, desenha fio e sombra
  function desenharBorda(t) {
    const N = 24, x0 = -M.margem, larg = W + 2 * M.margem, topo = -2 * H;
    const P = [];
    for (let i = 0; i <= N; i++) { const x = x0 + (larg * i) / N; P.push([x, yBorda(x, t)]); }
    let d = `M${x0} ${topo}L${r1(P[0][0])} ${r1(P[0][1])}`;
    for (let i = 0; i < N; i++) { // Catmull-Rom → Bézier: curva lisa passando pelos pontos
      const a = P[i ? i - 1 : 0], b = P[i], c = P[i + 1], e = P[i + 2 <= N ? i + 2 : N];
      d += `C${r1(b[0] + (c[0] - a[0]) / 6)} ${r1(b[1] + (c[1] - a[1]) / 6)} ${r1(c[0] - (e[0] - b[0]) / 6)} ${r1(c[1] - (e[1] - b[1]) / 6)} ${r1(c[0])} ${r1(c[1])}`;
    }
    d += `L${r1(x0 + larg)} ${topo}Z`;
    if (d === ultimoD) return;
    ultimoD = d;
    el.bordas.forEach((p) => p.setAttribute('d', d));
  }

  // Elementos do topo sobem de leve quando a borda passa por eles (de baixo para cima)
  function medirTopo() {
    sobem = [...document.querySelectorAll(`[${CHAVE_SOBE}]`)]
      .map((elemento) => ({ elemento, r: elemento.getBoundingClientRect(), foi: false }))
      .filter((o) => o.r.width > 0 && o.r.top < H);
  }
  function revelarTopo(t) {
    if (t <= T.pega) return;
    let fila = 0;
    for (const o of sobem) {
      if (o.foi) continue;
      if (yBorda(limita(W / 2, o.r.left, o.r.right), t) > o.r.bottom + 28) continue;
      o.foi = true;
      o.elemento.animate([{ translate: `0 ${M.sobe}px` }, { translate: '0 0' }], {
        duration: 700 / vel, delay: (45 * fila++) / vel, easing: cssCurva(CURVA.entrada), fill: 'backwards',
      });
    }
  }

  /* ---------- Medidas da tela ---------------------------------------------- */
  function medir() {
    W = camada.clientWidth;
    H = camada.clientHeight;
    tam = limita(Math.min(W, H) * M.passaro[1], M.passaro[0], M.passaro[2]);
    esc = tam / 100;
    yRepouso = H + 1;
    yTopo = H * M.topo;
    ySai = -H * 0.6;
    onda = limita(W * M.onda[1], M.onda[0], M.onda[2]);
    P2 = centroPelaPonta([W / 2, yRepouso - 4], M.inclina, esc);
    P0 = [-W * 0.2 - tam, H * 0.5]; // começa fora da tela: o trecho rápido da curva acontece antes de aparecer
    C0 = [W * 0.3, mistura(P0[1], P2[1], 0.04)];
    pEntrada = comOvershoot(E.entrada, M.freio / (2 * dist(C0, P2)), 0.55);
    let vPico = 1; // velocidade máxima da puxada → atraso das pontas que dá o arco desejado
    for (let i = 0; i < 80; i++) {
      const a = mistura(T.respira, T.solta, i / 80);
      vPico = Math.max(vPico, Math.abs(yCentro(a + 0.002) - yCentro(a)) / 0.002);
    }
    atrasoMax = limita(W * M.arco, M.arcoMin, M.arcoMax) / vPico;
    medirTopo();
    pouso = null;
  }

  /* ---------- Ciclo de vida ------------------------------------------------- */
  function passo(agora) {
    if (estado !== 'rodando') return;
    if (!t0) {
      t0 = agora;
      el.iniciais.forEach((n) => n.remove()); // a partir daqui a cortina é o path
    }
    const t = ((agora - t0) / 1000) * vel;
    const tEntrega = T.fim - T.assenta;
    try {
      if (camada.clientWidth !== W || camada.clientHeight !== H) medir();
      if (t >= tEntrega && logo && pouso && !pouso.semLogo) return entregar(t - tEntrega);
      if (t >= T.fim) return concluir();
      desenhar(t);
      raf = requestAnimationFrame(passo);
    } catch (erro) {
      concluir();
      throw erro;
    }
  }

  // FLIP, troca invisível: o pássaro chega ao logo com a pose e o tamanho exatos, ainda em
  // movimento; no mesmo quadro o logo real aparece exatamente onde ele está e faz sozinho os
  // últimos px com a curva de pouso. Em repouso fica só o logo real, desenhado pelo navegador.
  function entregar(decorrido) {
    const L = logo.getBoundingClientRect();
    const sL = L.width / 100;
    const dx = pouso.pre[0] - (L.left + CENTRO[0] * sL);
    const dy = pouso.pre[1] - (L.top + CENTRO[1] * sL);
    // anima o <g> de dentro do logo (redesenhado nítido a cada quadro, sem borrão de camada da GPU);
    // no fim a animação acaba e sobra o logo exatamente como ele é desenhado sem abertura
    const g = logo.querySelector('g');
    if (g && g.animate) {
      const a = g.animate([{ transform: `translate(${r2(dx / sL)}px, ${r2(dy / sL)}px)` }, { transform: 'none' }], {
        duration: (T.assenta * 1000) / vel, easing: cssCurva(CURVA.pouso), fill: 'backwards',
      });
      a.currentTime = (Math.min(decorrido, T.assenta) * 1000) / vel;
    }
    concluir();
  }

  function esperarFonte() {
    const fontes = document.fonts;
    if (!fontes || !fontes.check) return Promise.resolve();
    const fonte = `italic 300 64px ${getComputedStyle(el.nomeTexto).fontFamily}`;
    try { if (fontes.check(fonte, 'Maria Luiza')) return Promise.resolve(); } catch (e) { return Promise.resolve(); }
    camada.classList.add('ab-esperando-fonte');
    fonteOk = false;
    const carregou = fontes.load(fonte, 'Maria Luiza').then(() => {
      if (estado !== 'esperando') return; // chegou tarde: o nome fica escondido nesta abertura
      fonteOk = true;
      camada.classList.remove('ab-esperando-fonte'); // aparece com fade de 250 ms
      return pausa(90);
    }, () => {});
    return Promise.race([carregou, pausa(T.fonte * 1000)]);
  }

  // Se o JS começou tarde, empurra a rede de segurança do CSS para depois do fim previsto
  function adiarSeguranca() {
    const resto = (T.fonte + T.fim / vel + 0.8) * 1000;
    [camada, logo].forEach((alvo) => {
      if (!alvo || !alvo.getAnimations) return;
      alvo.getAnimations().forEach((a) => {
        if (!a.animationName || a.animationName.indexOf('ab-') !== 0) return;
        const decorrido = Number(a.currentTime) || 0;
        if (decorrido + resto > 4000) alvo.style.animationDelay = `${Math.ceil(decorrido + resto)}ms`;
      });
    });
  }

  const PULAR_EM = ['pointerdown', 'touchstart', 'wheel', 'keydown'];
  function aoRolar() { if (Math.abs(window.scrollY - rolagemInicial) > 2) pular(); }
  function aoEsconder() { if (document.hidden) concluir(); }
  function ouvir(liga) {
    const f = liga ? 'addEventListener' : 'removeEventListener';
    PULAR_EM.forEach((ev) => window[f](ev, pular, { capture: true, passive: true }));
    window[f]('scroll', aoRolar, { passive: true });
    document[f]('visibilitychange', aoEsconder);
  }

  function iniciar() {
    camada = document.getElementById('abertura');
    if (!camada || !html.classList.contains('intro')) return;
    const q = (s) => camada.querySelector(s);
    el = {
      ceu: q('.ab-ceu'),
      passaro: q('.ab-passaro'),
      frente: [...camada.querySelectorAll('.ab-asa-frente path')],
      tras: [...camada.querySelectorAll('.ab-asa-tras path')],
      rastro: q('.ab-rastro'),
      rastroCor: q('#ab-rastro-cor'),
      bordas: [...camada.querySelectorAll('[data-borda]')],
      iniciais: [...camada.querySelectorAll('.ab-inicial')],
      nome: q('.ab-nome-grupo'),
      nomeTexto: q('.ab-nome'),
    };
    logo = document.querySelector('[data-abertura-logo]');
    estado = 'esperando';
    t0 = 0; pouso = null; ultimoD = ''; asasAntes = ''; rastroLigado = false;
    rolagemInicial = window.scrollY;
    ouvir(true);
    adiarSeguranca();
    esperarFonte().then(() => {
      if (estado !== 'esperando') return;
      estado = 'rodando';
      medir();
      raf = requestAnimationFrame(passo);
    });
  }

  // O toque/clique que pulou não pode "atravessar" e acionar o link que estava embaixo
  // da cortina (no celular o clique chega depois que o dedo sai, com a cortina já indo embora)
  function engolirClique() {
    const prazo = performance.now() + 800;
    const engole = (ev) => {
      window.removeEventListener('click', engole, true);
      if (performance.now() > prazo) return;
      ev.preventDefault();
      ev.stopPropagation();
    };
    window.addEventListener('click', engole, true);
    setTimeout(() => window.removeEventListener('click', engole, true), 800);
  }

  // Clique, toque, rolagem ou tecla: vai direto ao estado final com uma saída rápida
  function pular(ev) {
    if (estado !== 'rodando' && estado !== 'esperando') return;
    if (ev && (ev.type === 'pointerdown' || ev.type === 'touchstart')) engolirClique();
    estado = 'saindo';
    cancelAnimationFrame(raf);
    ouvir(false);
    camada.style.pointerEvents = 'none';
    const dur = T.pular * 1000;
    if (logo) {
      logo.style.visibility = 'visible';
      logo.style.animation = 'none';
      logo.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur, easing: 'ease-out' });
    }
    camada.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-12px)' }], {
      duration: dur, easing: cssCurva(CURVA.entrada), fill: 'forwards',
    }).finished.then(concluir, concluir);
    setTimeout(concluir, dur + 150); // garantia
  }

  function concluir() {
    if (estado === 'fim' || estado === 'parado') return;
    estado = 'fim';
    cancelAnimationFrame(raf);
    ouvir(false);
    html.classList.remove('intro'); // o logo real aparece…
    if (logo) ['visibility', 'opacity', 'animation', 'animation-delay'].forEach((p) => logo.style.removeProperty(p));
    camada.remove();                // …e a camada sai do DOM, no mesmo quadro
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'auto'; } catch (e) {}
  }

  // Rever (botão da demo, ou no console: abertura.tocar() · abertura.tocar(0.25) em câmera lenta)
  function tocar(velocidade) {
    if (!molde || estado === 'rodando' || estado === 'esperando' || estado === 'saindo') return;
    vel = lerVel(velocidade);
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.body.prepend(molde.cloneNode(true));
    html.classList.add('intro');
    iniciar();
  }

  window.abertura = { tocar, pular };
  if (camada && html.classList.contains('intro')) iniciar();
  else if (camada) camada.remove(); // visitas seguintes: a camada nem fica no DOM
})();
