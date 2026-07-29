/* ============================================================
   GRIDIRON EGOS — character puppet library
   Builds SVG cartoon puppets for each squad member.
   Every puppet exposes hooks the engine animates:
   .mouth (talk flap), .eyes/.lids (blink), .browL/.browR (mood),
   .armL/.armR (gesture groups), .root (bob/entrance)
   ============================================================ */
(function () {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';

  function el(name, attrs, parent) {
    const n = document.createElementNS(SVGNS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ---- roster visual specs ------------------------------------------ */
  /* skinA = skin, hair = hair color, jersey/trim/numColor = uniform,
     face tweaks: beard, dreads, young, pale                              */
  const SPECS = {
    ALLEN:    { name: 'Josh Allen',      pos: 'QB',   num: '17', jersey: '#00338D', trim: '#C60C30', numColor: '#FFFFFF', skin: '#F2C7A0', hair: '#7A5230', style: 'short' },
    GIBBS:    { name: 'Jahmyr Gibbs',    pos: 'RB1',  num: '0',  jersey: '#0076B6', trim: '#B0B7BC', numColor: '#FFFFFF', skin: '#8D5A3B', hair: '#191512', style: 'dreads' },
    GAINWELL: { name: 'Kenneth Gainwell',pos: 'RB2',  num: '1',  jersey: '#D50A0A', trim: '#34302B', numColor: '#FFFFFF', skin: '#7C4F33', hair: '#141110', style: 'short' },
    ADAMS:    { name: 'Davante Adams',   pos: 'WR1',  num: '17', jersey: '#003594', trim: '#FFD100', numColor: '#FFD100', skin: '#8D5A3B', hair: '#141110', style: 'beard-dreads' },
    COLLINS:  { name: 'Nico Collins',    pos: 'WR2',  num: '12', jersey: '#03202F', trim: '#A71930', numColor: '#FFFFFF', skin: '#83553A', hair: '#171310', style: 'short-beard' },
    FANNIN:   { name: 'Harold Fannin',   pos: 'TE',   num: '44', jersey: '#311D00', trim: '#FF3C00', numColor: '#FF3C00', skin: '#8D5A3B', hair: '#191512', style: 'young' },
    PRICE:    { name: 'Jadarian Price',  pos: 'FLEX', num: '8',  jersey: '#002244', trim: '#69BE28', numColor: '#FFFFFF', skin: '#7C4F33', hair: '#141110', style: 'short' },
    AUBREY:   { name: 'Brandon Aubrey',  pos: 'K',    num: '17', jersey: '#FFFFFF', trim: '#041E42', numColor: '#041E42', skin: '#F2C7A0', hair: '#5C4326', style: 'short-beard' },
    BRONCOS:  { name: 'Broncos D/ST',    pos: 'DEF',  num: 'D',  jersey: '#FB4F14', trim: '#0A2343', numColor: '#0A2343', skin: '#8D5A3B', hair: '#141110', style: 'squad' },
  };

  /* ---- head builder -------------------------------------------------- */
  function buildHead(g, spec, cx, cy, r) {
    const head = el('g', { class: 'pp-head' }, g);
    // face
    el('circle', { cx, cy, r, fill: spec.skin }, head);
    // hair styles
    const hair = spec.hair;
    if (spec.style === 'dreads' || spec.style === 'beard-dreads') {
      el('path', { d: `M ${cx - r} ${cy - r * 0.1} A ${r} ${r} 0 0 1 ${cx + r} ${cy - r * 0.1} L ${cx + r * 0.92} ${cy - r * 0.42} A ${r * 0.95} ${r * 0.95} 0 0 0 ${cx - r * 0.92} ${cy - r * 0.42} Z`, fill: hair }, head);
      // hanging dreads
      for (let i = -3; i <= 3; i++) {
        if (Math.abs(i) < 2) continue;
        const dx = cx + i * r * 0.30;
        el('rect', { x: dx - r * 0.09, y: cy - r * 0.45, width: r * 0.18, height: r * 0.95, rx: r * 0.09, fill: hair }, head);
      }
      el('path', { d: `M ${cx - r * 0.98} ${cy - r * 0.15} A ${r} ${r} 0 0 1 ${cx + r * 0.98} ${cy - r * 0.15} L ${cx + r * 0.8} ${cy - r * 0.55} A ${r * 0.9} ${r * 0.9} 0 0 0 ${cx - r * 0.8} ${cy - r * 0.55} Z`, fill: hair }, head);
    } else if (spec.style === 'young') {
      el('path', { d: `M ${cx - r * 0.95} ${cy - r * 0.28} A ${r} ${r} 0 0 1 ${cx + r * 0.95} ${cy - r * 0.28} L ${cx + r * 0.85} ${cy - r * 0.05} A ${r * 0.85} ${r * 0.85} 0 0 0 ${cx - r * 0.85} ${cy - r * 0.05} Z`, fill: hair }, head);
    } else {
      // short crop
      el('path', { d: `M ${cx - r * 0.97} ${cy - r * 0.2} A ${r} ${r} 0 0 1 ${cx + r * 0.97} ${cy - r * 0.2} L ${cx + r * 0.88} ${cy - r * 0.02} A ${r * 0.88} ${r * 0.88} 0 0 0 ${cx - r * 0.88} ${cy - r * 0.02} Z`, fill: hair }, head);
    }
    // beard
    if (spec.style === 'beard-dreads' || spec.style === 'short-beard') {
      el('path', { d: `M ${cx - r * 0.72} ${cy + r * 0.25} A ${r * 0.75} ${r * 0.75} 0 0 0 ${cx + r * 0.72} ${cy + r * 0.25} L ${cx + r * 0.6} ${cy + r * 0.72} A ${r * 0.65} ${r * 0.65} 0 0 1 ${cx - r * 0.6} ${cy + r * 0.72} Z`, fill: hair, opacity: 0.92 }, head);
    }
    // ears
    el('circle', { cx: cx - r * 0.98, cy: cy + r * 0.05, r: r * 0.16, fill: spec.skin }, head);
    el('circle', { cx: cx + r * 0.98, cy: cy + r * 0.05, r: r * 0.16, fill: spec.skin }, head);

    // eyes (white + pupil), lids for blink
    const eyeY = cy - r * 0.05, eyeDx = r * 0.36, eyeR = r * 0.155;
    const eyes = el('g', { class: 'pp-eyes' }, head);
    for (const s of [-1, 1]) {
      el('circle', { cx: cx + s * eyeDx, cy: eyeY, r: eyeR, fill: '#FFFFFF' }, eyes);
      el('circle', { cx: cx + s * eyeDx + eyeR * 0.2, cy: eyeY, r: eyeR * 0.45, fill: '#20160F', class: 'pp-pupil' }, eyes);
    }
    const lids = el('g', { class: 'pp-lids' }, head);
    for (const s of [-1, 1]) {
      el('rect', { x: cx + s * eyeDx - eyeR - 1, y: eyeY - eyeR - 1, width: eyeR * 2 + 2, height: 0.001, fill: spec.skin, class: 'pp-lid' }, lids);
    }
    // brows
    const browY = eyeY - eyeR - r * 0.14;
    const browL = el('rect', { x: cx - eyeDx - eyeR, y: browY, width: eyeR * 2, height: r * 0.09, rx: r * 0.04, fill: spec.hair, class: 'pp-browL' }, head);
    const browR = el('rect', { x: cx + eyeDx - eyeR, y: browY, width: eyeR * 2, height: r * 0.09, rx: r * 0.04, fill: spec.hair, class: 'pp-browR' }, head);
    browL.style.transformOrigin = `${cx - eyeDx}px ${browY}px`;
    browR.style.transformOrigin = `${cx + eyeDx}px ${browY}px`;

    // mouth — a path we morph between closed/open/smile/frown
    const mouth = el('path', { class: 'pp-mouth', fill: '#4A2118', stroke: 'none' }, head);
    return { head, eyes, lids, browL, browR, mouth, mouthGeom: { cx, cy: cy + r * 0.42, r } };
  }

  /* mouth shapes, parameterized by geometry */
  function mouthShape(geom, kind, openAmt) {
    const { cx, cy, r } = geom;
    const w = r * 0.42;
    switch (kind) {
      case 'open': {
        const h = Math.max(2, openAmt * r * 0.34);
        return `M ${cx - w * 0.7} ${cy - h * 0.2} Q ${cx} ${cy - h * 0.55} ${cx + w * 0.7} ${cy - h * 0.2} Q ${cx} ${cy + h} ${cx - w * 0.7} ${cy - h * 0.2} Z`;
      }
      case 'smile':
        return `M ${cx - w} ${cy - r * 0.06} Q ${cx} ${cy + r * 0.22} ${cx + w} ${cy - r * 0.06} Q ${cx} ${cy + r * 0.06} ${cx - w} ${cy - r * 0.06} Z`;
      case 'grin':
        return `M ${cx - w} ${cy - r * 0.08} Q ${cx} ${cy + r * 0.34} ${cx + w} ${cy - r * 0.08} L ${cx + w * 0.8} ${cy - r * 0.1} Q ${cx} ${cy + r * 0.2} ${cx - w * 0.8} ${cy - r * 0.1} Z`;
      case 'frown':
        return `M ${cx - w * 0.8} ${cy + r * 0.1} Q ${cx} ${cy - r * 0.12} ${cx + w * 0.8} ${cy + r * 0.1} Q ${cx} ${cy + 1} ${cx - w * 0.8} ${cy + r * 0.1} Z`;
      case 'flat':
      default:
        return `M ${cx - w * 0.75} ${cy} L ${cx + w * 0.75} ${cy} L ${cx + w * 0.75} ${cy + 2.4} L ${cx - w * 0.75} ${cy + 2.4} Z`;
    }
  }

  /* ---- body builder --------------------------------------------------
     One puppet in a 160x230 viewBox (BRONCOS: 260x230, three heads).   */
  function buildPuppet(id) {
    const spec = SPECS[id];
    if (!spec) return null;
    const squad = spec.style === 'squad';
    const W = squad ? 260 : 160, H = 230;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'puppet', 'data-id': id });
    svg.style.overflow = 'visible';
    const root = el('g', { class: 'pp-root' }, svg);

    const cx = W / 2;
    const torsoTop = 118, torsoW = squad ? 190 : 92, torsoH = 84;

    // legs
    const legG = el('g', {}, root);
    const legY = torsoTop + torsoH - 12;
    const pants = '#D7D9DD';
    const nLegs = squad ? 3 : 1;
    for (let i = 0; i < nLegs; i++) {
      const lx = squad ? cx + (i - 1) * 62 : cx;
      for (const s of [-1, 1]) {
        el('rect', { x: lx + s * 12 - 9, y: legY, width: 18, height: 32, rx: 7, fill: pants }, legG);
        el('ellipse', { cx: lx + s * 13, cy: legY + 36, rx: 13, ry: 7, fill: '#22252B' }, legG);
      }
    }

    // torso / jersey
    el('path', {
      d: `M ${cx - torsoW / 2} ${torsoTop + 14}
          Q ${cx - torsoW / 2} ${torsoTop} ${cx - torsoW / 2 + 16} ${torsoTop - 2}
          L ${cx + torsoW / 2 - 16} ${torsoTop - 2}
          Q ${cx + torsoW / 2} ${torsoTop} ${cx + torsoW / 2} ${torsoTop + 14}
          L ${cx + torsoW / 2 - 6} ${torsoTop + torsoH}
          L ${cx - torsoW / 2 + 6} ${torsoTop + torsoH} Z`,
      fill: spec.jersey, stroke: spec.trim, 'stroke-width': 3.5,
    }, root);
    // shoulder stripes
    el('rect', { x: cx - torsoW / 2 + 2, y: torsoTop + 2, width: 18, height: 10, rx: 4, fill: spec.trim }, root);
    el('rect', { x: cx + torsoW / 2 - 20, y: torsoTop + 2, width: 18, height: 10, rx: 4, fill: spec.trim }, root);
    // number
    const numT = el('text', {
      x: cx, y: torsoTop + 58, 'text-anchor': 'middle',
      'font-family': "'Arial Black','Arial Narrow',Impact,sans-serif",
      'font-size': squad ? 34 : 38, 'font-weight': 900, fill: spec.numColor,
    }, root);
    numT.textContent = spec.num;
    if (squad) {
      const defT = el('text', { x: cx, y: torsoTop + 78, 'text-anchor': 'middle', 'font-family': 'Arial,sans-serif', 'font-size': 13, 'font-weight': 700, fill: spec.numColor, 'letter-spacing': '2' }, root);
      defT.textContent = 'DENVER';
    }

    // arms (gesture groups) — pivot at shoulders
    const shoulderY = torsoTop + 10;
    const armLen = 52, armW = 15;
    function arm(side) { // side -1 = left of viewer
      const sx = cx + side * (torsoW / 2 - 4);
      const g = el('g', { class: side < 0 ? 'pp-armL' : 'pp-armR' }, root);
      el('rect', { x: side < 0 ? sx - armLen : sx, y: shoulderY - armW / 2 + 6, width: armLen, height: armW, rx: armW / 2, fill: spec.jersey, stroke: spec.trim, 'stroke-width': 2.5 }, g);
      el('circle', { cx: side < 0 ? sx - armLen : sx + armLen, cy: shoulderY + 6, r: 10, fill: spec.skin }, g);
      g.style.transformOrigin = `${sx}px ${shoulderY + 6}px`;
      return g;
    }
    const armL = arm(-1), armR = arm(1);

    // head(s)
    const headR = squad ? 30 : 42;
    let face;
    if (squad) {
      const faces = [];
      for (let i = 0; i < 3; i++) {
        const hx = cx + (i - 1) * 66;
        const hy = 118 - headR - 8 + (i === 1 ? -10 : 0);
        faces.push(buildHead(root, spec, hx, hy, headR));
      }
      face = faces[1];
      face.all = faces;
    } else {
      face = buildHead(root, spec, cx, torsoTop - headR - 4, headR);
    }

    return {
      id, spec, svg, root,
      face,
      armL, armR,
      setMouth(kind, openAmt) {
        const list = face.all ? face.all : [face];
        for (const f of list) f.mouth.setAttribute('d', mouthShape(f.mouthGeom, kind, openAmt == null ? 1 : openAmt));
      },
      setBrows(mood) {
        const map = {
          brag: [-12, 12], smack: [-16, 8], hype: [-14, -14], humble: [8, 8],
          deadpan: [0, 0], laugh: [-8, -8], angry: [18, -18], nervous: [14, 14], neutral: [0, 0],
        };
        const [l, r] = map[mood] || [0, 0];
        const list = face.all ? face.all : [face];
        for (const f of list) {
          f.browL.style.transform = `rotate(${l}deg)`;
          f.browR.style.transform = `rotate(${r}deg)`;
        }
      },
      blink(closed) {
        const list = face.all ? face.all : [face];
        for (const f of list) {
          for (const lid of f.lids.querySelectorAll('.pp-lid')) {
            lid.setAttribute('height', closed ? 15 : 0.001);
          }
        }
      },
      gesture(mood) {
        // arm poses per mood (CSS transitions handle easing)
        const poses = {
          brag:    [15, -130],  // one arm flex up
          smack:   [10, -95],   // pointing
          hype:    [-150, -150],
          humble:  [12, -35],
          laugh:   [-30, -30],
          angry:   [40, -40],
          deadpan: [8, -8],
          nervous: [25, -60],
          neutral: [10, -10],
        };
        const [l, r] = poses[mood] || [10, -10];
        armL.style.transform = `rotate(${l}deg)`;
        armR.style.transform = `rotate(${r}deg)`;
      },
      restMouth(mood) {
        const rest = { brag: 'grin', smack: 'grin', hype: 'grin', humble: 'smile', laugh: 'grin', angry: 'frown', nervous: 'frown', deadpan: 'flat', neutral: 'smile' };
        this.setMouth(rest[mood] || 'smile');
      },
    };
  }

  window.GRIDIRON_CHARS = { SPECS, buildPuppet };
})();
