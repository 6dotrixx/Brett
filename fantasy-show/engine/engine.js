/* ============================================================
   GRIDIRON EGOS — episode engine
   Data-driven cartoon player. Reads window.EPISODE, renders a
   960x540 stage with SVG puppet characters, speech bubbles,
   lower-thirds, scorebug, TTS voice acting and scene painter.
   ============================================================ */
(function () {
  'use strict';

  const EP = window.EPISODE;
  const CH = window.GRIDIRON_CHARS;
  if (!EP || !CH) { console.error('EPISODE data or character lib missing'); return; }

  const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root) => (root || document).querySelector(sel);

  /* ================= scene backgrounds (960x540 SVG) ================= */
  const BG = {
    field: () => `
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#060B18"/><stop offset="0.7" stop-color="#12203E"/><stop offset="1" stop-color="#1B3057"/>
        </linearGradient>
        <linearGradient id="turf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1E6B36"/><stop offset="1" stop-color="#14522A"/>
        </linearGradient>
        <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="#FFF6D8" stop-opacity="0.9"/><stop offset="1" stop-color="#FFF6D8" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="960" height="540" fill="url(#sky)"/>
      ${[...Array(40)].map((_, i) => `<circle cx="${(i * 227) % 960}" cy="${(i * 83) % 180}" r="${(i % 3) * 0.5 + 0.6}" fill="#DDE7FF" opacity="${0.3 + (i % 5) * 0.12}"/>`).join('')}
      <path d="M0 300 Q 480 250 960 300 L 960 260 Q 480 208 0 260 Z" fill="#0D1730"/>
      <path d="M0 260 Q 480 208 960 260 L 960 240 Q 480 190 0 240 Z" fill="#151F3B"/>
      ${[120, 840].map(x => `
        <rect x="${x - 5}" y="120" width="10" height="150" fill="#0A1020"/>
        <rect x="${x - 42}" y="96" width="84" height="34" rx="6" fill="#0A1020"/>
        ${[-28, -9.33, 9.33, 28].map(dx => `<circle cx="${x + dx}" cy="108" r="6" fill="#FFF3C4"/><circle cx="${x + dx}" cy="108" r="14" fill="url(#lampGlow)"/>`).join('')}`).join('')}
      <rect y="300" width="960" height="240" fill="url(#turf)"/>
      ${[0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M ${i * 160 - 40} 540 L ${i * 160 + 45} 300" stroke="#EAF4EC" stroke-width="4" opacity="0.55"/>`).join('')}
      <path d="M0 306 L960 306" stroke="#EAF4EC" stroke-width="3" opacity="0.5"/>`,

    locker_room: () => `
      <defs>
        <linearGradient id="lockerWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2A3242"/><stop offset="1" stop-color="#1C2330"/>
        </linearGradient>
        <linearGradient id="lockerFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#4A4038"/><stop offset="1" stop-color="#332C26"/>
        </linearGradient>
      </defs>
      <rect width="960" height="540" fill="url(#lockerWall)"/>
      <rect y="392" width="960" height="148" fill="url(#lockerFloor)"/>
      <rect y="386" width="960" height="8" fill="#141922"/>
      ${[...Array(8)].map((_, i) => {
        const x = 12 + i * 120, colors = ['#00338D', '#0076B6', '#D50A0A', '#003594', '#03202F', '#311D00', '#002244', '#FB4F14'];
        return `
        <g>
          <rect x="${x}" y="60" width="106" height="326" rx="6" fill="#39445A" stroke="#141922" stroke-width="3"/>
          <rect x="${x + 8}" y="70" width="90" height="10" rx="3" fill="#141922" opacity="0.65"/>
          <rect x="${x + 12}" y="96" width="82" height="120" rx="4" fill="#232B3B"/>
          <path d="M ${x + 30} 112 q 23 -16 46 0 l -6 66 q -17 8 -34 0 Z" fill="${colors[i]}" stroke="#10141D" stroke-width="2"/>
          <rect x="${x + 12}" y="232" width="82" height="8" rx="3" fill="#141922" opacity="0.6"/>
          <rect x="${x + 12}" y="256" width="82" height="8" rx="3" fill="#141922" opacity="0.6"/>
          <circle cx="${x + 88}" cy="300" r="5" fill="#141922"/>
        </g>`;
      }).join('')}
      <rect x="240" y="404" width="480" height="16" rx="6" fill="#6B5A44"/>
      <rect x="264" y="420" width="18" height="42" fill="#514434"/>
      <rect x="678" y="420" width="18" height="42" fill="#514434"/>
      <ellipse cx="480" cy="512" rx="430" ry="16" fill="#000" opacity="0.18"/>`,

    press_room: () => `
      <defs>
        <linearGradient id="pressWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#10182A"/><stop offset="1" stop-color="#0B1120"/>
        </linearGradient>
      </defs>
      <rect width="960" height="540" fill="url(#pressWall)"/>
      ${[...Array(24)].map((_, i) => {
        const x = (i % 6) * 190 - 40 + (Math.floor(i / 6) % 2) * 95, y = Math.floor(i / 6) * 100 + 30;
        return `<text x="${x}" y="${y}" font-family="'Arial Black',sans-serif" font-size="20" fill="#22304F" transform="rotate(-14 ${x} ${y})" letter-spacing="2">GRIDIRON EGOS</text>`;
      }).join('')}
      <rect y="430" width="960" height="110" fill="#0A0F1B"/>
      <g>
        <rect x="350" y="332" width="260" height="128" rx="10" fill="#1B2740" stroke="#31446C" stroke-width="3"/>
        <rect x="368" y="352" width="224" height="52" rx="6" fill="#0E1526"/>
        <text x="480" y="386" text-anchor="middle" font-family="'Arial Black',sans-serif" font-size="24" fill="#F5B63F" letter-spacing="3">WEEK 1</text>
        <rect x="455" y="300" width="10" height="40" fill="#31446C"/>
        <circle cx="460" cy="296" r="10" fill="#10141D" stroke="#31446C" stroke-width="2"/>
        <rect x="492" y="306" width="9" height="34" fill="#31446C" transform="rotate(12 496 306)"/>
        <circle cx="500" cy="300" r="9" fill="#10141D" stroke="#31446C" stroke-width="2"/>
      </g>
      <circle cx="130" cy="120" r="3" fill="#FFFFFF" opacity="0.8"><animate attributeName="opacity" values="0;0.9;0" dur="2.3s" repeatCount="indefinite"/></circle>
      <circle cx="835" cy="90" r="3" fill="#FFFFFF" opacity="0.5"><animate attributeName="opacity" values="0;0.8;0" dur="3.1s" begin="0.9s" repeatCount="indefinite"/></circle>`,

    film_room: () => `
      <rect width="960" height="540" fill="#0A0D14"/>
      <rect y="440" width="960" height="100" fill="#070910"/>
      <path d="M 875 96 L 300 165 L 300 415 L 875 470 Z" fill="#F5EFDC" opacity="0.07"/>
      <g>
        <rect x="120" y="120" width="480" height="300" rx="6" fill="#E8EFDF" stroke="#2A3242" stroke-width="8"/>
        <text x="360" y="165" text-anchor="middle" font-family="'Courier New',monospace" font-size="26" font-weight="bold" fill="#3A4A3F">WEEK 1 — FILM</text>
        ${['O', 'O', 'O', 'X', 'X', 'X', 'O', 'X'].map((c, i) => `<text x="${180 + (i % 4) * 100}" y="${240 + Math.floor(i / 4) * 80}" font-family="'Courier New',monospace" font-size="34" font-weight="bold" fill="${c === 'X' ? '#A33B2E' : '#2E5AA3'}">${c}</text>`).join('')}
        <path d="M 200 250 Q 300 200 420 236" stroke="#3A4A3F" stroke-width="3" fill="none" stroke-dasharray="7 5"/>
        <path d="M 420 236 l -12 -3 l 8 10" stroke="#3A4A3F" stroke-width="3" fill="none"/>
      </g>
      <circle cx="820" cy="150" r="26" fill="#161B26" stroke="#2A3242" stroke-width="4"/>
      <circle cx="866" cy="150" r="26" fill="#161B26" stroke="#2A3242" stroke-width="4"/>
      <rect x="806" y="176" width="74" height="30" rx="6" fill="#20273A"/>
      <path d="M 806 191 L 620 160 L 620 380 L 806 206 Z" fill="#FFF9E3" opacity="0.10"/>`,

    scoreboard: () => `
      <defs>
        <linearGradient id="jSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#05080F"/><stop offset="1" stop-color="#141F3C"/>
        </linearGradient>
      </defs>
      <rect width="960" height="540" fill="url(#jSky)"/>
      ${[...Array(34)].map((_, i) => `<circle cx="${(i * 271) % 960}" cy="${(i * 67) % 190}" r="${(i % 3) * 0.5 + 0.6}" fill="#D8E4FF" opacity="${0.25 + (i % 4) * 0.15}"/>`).join('')}
      <rect x="180" y="70" width="600" height="330" rx="14" fill="#0D1220" stroke="#2C3A5C" stroke-width="6"/>
      <rect x="200" y="90" width="560" height="290" rx="8" fill="#060A13"/>
      <text x="480" y="150" text-anchor="middle" font-family="'Arial Black',sans-serif" font-size="22" fill="#5E7099" letter-spacing="6">WEEK 1 · FINAL</text>
      <text x="480" y="255" text-anchor="middle" font-family="'Arial Black',sans-serif" font-size="86" fill="#F5B63F" letter-spacing="2">201–198</text>
      <text x="480" y="315" text-anchor="middle" font-family="'Arial Black',sans-serif" font-size="20" fill="#2E9950" letter-spacing="5">SQUAD WINS</text>
      <text x="480" y="355" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#43537A" letter-spacing="3">MARGIN: ONE (1) AUBREY</text>
      <rect x="440" y="400" width="80" height="70" fill="#1A2338"/>
      <rect x="410" y="465" width="140" height="14" rx="6" fill="#141B2C"/>
      <rect y="476" width="960" height="64" fill="#0E1526"/>
      <path d="M0 476 Q 480 440 960 476" fill="#111B31"/>
      ${[70, 890].map(x => `<rect x="${x - 3}" y="330" width="6" height="146" fill="#0A1020"/><circle cx="${x}" cy="322" r="7" fill="#FFF3C4" opacity="0.9"/>`).join('')}`,

    hallway: () => `
      <defs>
        <linearGradient id="tunnel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#252D3D"/><stop offset="1" stop-color="#161C29"/>
        </linearGradient>
      </defs>
      <rect width="960" height="540" fill="url(#tunnel)"/>
      <path d="M0 0 L 250 90 L 250 450 L 0 540 Z" fill="#1B2231"/>
      <path d="M960 0 L 710 90 L 710 450 L 960 540 Z" fill="#1B2231"/>
      <rect x="250" y="90" width="460" height="360" fill="#10151F"/>
      <rect x="250" y="440" width="460" height="10" fill="#0B0E16"/>
      ${[0, 1, 2].map(i => `<rect x="${330 + i * 120}" y="100" width="60" height="10" rx="4" fill="#FFF6D8" opacity="${0.85 - i * 0.15}"/>`).join('')}
      <path d="M 250 450 L 0 540 L 960 540 L 710 450 Z" fill="#232B3B"/>
      <rect x="305" y="150" width="350" height="86" rx="8" fill="#7A1F2B" stroke="#3A0F15" stroke-width="4"/>
      <text x="480" y="188" text-anchor="middle" font-family="'Arial Black',sans-serif" font-size="26" fill="#F5D9A0" letter-spacing="3">PROTECT THE W</text>
      <text x="480" y="218" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" fill="#E8B7A0" letter-spacing="2">EVERY. SINGLE. WEEK.</text>`,
  };

  /* ================= audio (crowd + stingers) ================= */
  const AudioFX = {
    ctx: null, crowdGain: null, enabled: true,
    init() {
      if (this.ctx) return;
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        const ctx = this.ctx;
        const len = ctx.sampleRate * 2;
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
        const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
        const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = 480; filt.Q.value = 0.6;
        this.crowdGain = ctx.createGain(); this.crowdGain.gain.value = 0.0;
        src.connect(filt).connect(this.crowdGain).connect(ctx.destination);
        src.start();
      } catch (e) { /* audio unavailable */ }
    },
    crowd(level) {
      if (!this.ctx || !this.enabled) return;
      this.crowdGain.gain.linearRampToValueAtTime(level, this.ctx.currentTime + 1.2);
    },
    stinger() {
      if (!this.ctx || !this.enabled) return;
      const ctx = this.ctx, t = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'triangle'; o.frequency.value = f / 2;
        g.gain.setValueAtTime(0, t + i * 0.06);
        g.gain.linearRampToValueAtTime(0.12, t + i * 0.06 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.7);
        o.connect(g).connect(ctx.destination); o.start(t + i * 0.06); o.stop(t + i * 0.06 + 0.8);
      });
    },
    pop() {
      if (!this.ctx || !this.enabled) return;
      const ctx = this.ctx, t = ctx.currentTime;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(1320, t + 0.08);
      g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.16);
    },
  };

  /* ================= TTS voice acting ================= */
  const Voice = {
    enabled: true, voices: [],
    profiles: {
      NARRATOR: { pitch: 0.72, rate: 1.02, vi: 0 },
      ALLEN:    { pitch: 1.0,  rate: 1.05, vi: 1 },
      GIBBS:    { pitch: 1.28, rate: 1.18, vi: 2 },
      GAINWELL: { pitch: 0.95, rate: 1.0,  vi: 3 },
      ADAMS:    { pitch: 0.8,  rate: 0.98, vi: 4 },
      COLLINS:  { pitch: 0.9,  rate: 0.94, vi: 5 },
      FANNIN:   { pitch: 1.38, rate: 1.14, vi: 6 },
      PRICE:    { pitch: 1.2,  rate: 1.12, vi: 7 },
      AUBREY:   { pitch: 1.06, rate: 0.9,  vi: 8 },
      BRONCOS:  { pitch: 0.5,  rate: 0.85, vi: 9 },
    },
    init() {
      if (!('speechSynthesis' in window)) { this.enabled = false; return; }
      const load = () => {
        this.voices = speechSynthesis.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
      };
      load();
      speechSynthesis.addEventListener('voiceschanged', load);
    },
    available() { return 'speechSynthesis' in window; },
    speak(speaker, text) {
      return new Promise(resolve => {
        if (!this.enabled || !this.available()) return resolve(false);
        if (!this.voices.length) {
          const all = speechSynthesis.getVoices();
          if (!all.length) return resolve(false); // platform has no TTS voices
          this.voices = all.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
          if (!this.voices.length) this.voices = all;
        }
        const p = this.profiles[speaker] || { pitch: 1, rate: 1, vi: 0 };
        const u = new SpeechSynthesisUtterance(text);
        if (this.voices.length) u.voice = this.voices[p.vi % this.voices.length];
        u.pitch = p.pitch; u.rate = p.rate; u.volume = 1;
        let done = false;
        const finish = () => { if (!done) { done = true; resolve(true); } };
        u.onend = finish; u.onerror = finish;
        const est = 1500 + text.length * (110 / p.rate);
        setTimeout(finish, est * 1.9 + 2500);
        speechSynthesis.speak(u);
      });
    },
    cancel() { if (this.available()) speechSynthesis.cancel(); },
  };

  /* ================= player ================= */
  const rosterById = {};
  for (const r of EP.roster) rosterById[r.id] = r;

  const Player = {
    token: 0, playing: false, started: false, finished: false,
    sceneIdx: 0, lineIdx: 0,
    puppets: {}, introduced: new Set(),
    pauseGate: null, pauseResolve: null,

    els: {},

    cacheDom() {
      this.els = {
        stage: $('#stage'), bg: $('#bg'), cast: $('#cast'), bubble: $('#bubble'),
        narrator: $('#narrator'), lower: $('#lowerThird'), overlay: $('#overlay'),
        titleCard: $('#titleCard'), sceneTitle: $('#sceneTitle'), scorebug: $('#scorebug'),
        playBtn: $('#btnPlay'), prevBtn: $('#btnPrev'), nextBtn: $('#btnNext'),
        restartBtn: $('#btnRestart'), voiceBtn: $('#btnVoice'), sfxBtn: $('#btnSfx'),
        progress: $('#progress'), nowPlaying: $('#nowPlaying'),
      };
    },

    /* ---- estimated runtime (for the title card) ---- */
    estimateRuntime() {
      let ms = 0;
      for (const sc of EP.scenes) {
        ms += 2600; // transition + title card
        if (sc.overlay === 'finalScore') ms += 5200;
        if (sc.overlay === 'statBoard') ms += 7000;
        for (const ln of sc.lines) ms += this.lineDuration(ln.t);
      }
      return ms;
    },
    lineDuration(text) { return Math.min(8000, Math.max(2400, 1200 + text.length * 58)); },

    /* ---- init ---- */
    init() {
      this.cacheDom();
      const fit = () => {
        const wrap = $('#screenWrap');
        if (!wrap) return;
        const s = wrap.clientWidth / 960;
        this.els.stage.style.transform = `translate(-50%, -50%) scale(${s})`;
        this.els.stage.style.setProperty('--fit', s);
      };
      window.addEventListener('resize', fit);
      fit();
      Voice.init();
      this.buildScorebug();
      this.buildProgress();
      this.buildTitleCard();
      this.bindControls();
      this.startBlinkLoop();
    },

    buildScorebug() {
      const r = EP.result;
      this.els.scorebug.innerHTML =
        `<span class="sb-team us">${r.teamAbbr}</span><span class="sb-score us">${r.us}</span>` +
        `<span class="sb-div">–</span>` +
        `<span class="sb-score">${r.them}</span><span class="sb-team">${r.rivalAbbr}</span>` +
        `<span class="sb-tag">FINAL · WK ${EP.week}</span>`;
    },

    buildProgress() {
      this.els.progress.innerHTML = '';
      EP.scenes.forEach((sc, i) => {
        const seg = document.createElement('div');
        seg.className = 'seg'; seg.title = sc.title;
        seg.innerHTML = '<div class="fill"></div>';
        seg.addEventListener('click', () => this.jumpTo(i));
        this.els.progress.appendChild(seg);
      });
    },

    buildTitleCard() {
      const mins = Math.round(this.estimateRuntime() / 60000);
      this.els.titleCard.innerHTML = `
        <div class="tc-week">WEEK ${EP.week} · EPISODE ${EP.episode}</div>
        <h1 class="tc-series">${EP.series}</h1>
        <div class="tc-title">“${EP.title}”</div>
        <div class="tc-tag">${EP.tagline}</div>
        <button class="tc-play" id="tcPlay">▶&nbsp; START THE EPISODE</button>
        <div class="tc-meta">runtime ≈ ${mins} min · voice acting on · best with sound</div>`;
      $('#tcPlay').addEventListener('click', () => {
        AudioFX.init(); AudioFX.crowd(0.05); AudioFX.stinger();
        if (Voice.available()) { const u = new SpeechSynthesisUtterance(' '); speechSynthesis.speak(u); }
        this.els.titleCard.classList.add('hidden');
        this.started = true;
        this.play();
      });
    },

    bindControls() {
      this.els.playBtn.addEventListener('click', () => this.playing ? this.pause() : this.play());
      this.els.prevBtn.addEventListener('click', () => this.jumpTo(Math.max(0, this.sceneIdx - 1)));
      this.els.nextBtn.addEventListener('click', () => this.jumpTo(Math.min(EP.scenes.length - 1, this.sceneIdx + 1)));
      this.els.restartBtn.addEventListener('click', () => this.jumpTo(0));
      this.els.voiceBtn.addEventListener('click', () => {
        Voice.enabled = !Voice.enabled; if (!Voice.enabled) Voice.cancel();
        this.els.voiceBtn.classList.toggle('off', !Voice.enabled);
      });
      this.els.sfxBtn.addEventListener('click', () => {
        AudioFX.enabled = !AudioFX.enabled;
        if (AudioFX.crowdGain) AudioFX.crowdGain.gain.value = AudioFX.enabled ? 0.05 : 0;
        this.els.sfxBtn.classList.toggle('off', !AudioFX.enabled);
      });
      document.addEventListener('keydown', e => {
        if (e.key === ' ') { e.preventDefault(); if (this.started) (this.playing ? this.pause() : this.play()); }
        if (e.key === 'ArrowRight') this.els.nextBtn.click();
        if (e.key === 'ArrowLeft') this.els.prevBtn.click();
      });
      if (!Voice.available()) this.els.voiceBtn.classList.add('off');
    },

    /* ---- pause / play / seek ---- */
    pauseResolvers: [],
    releasePauseGate() {
      const rs = this.pauseResolvers; this.pauseResolvers = [];
      rs.forEach(r => r());
    },
    play() {
      if (this.finished) return this.jumpTo(0);
      this.playing = true;
      this.els.playBtn.textContent = '⏸';
      if (Voice.available()) speechSynthesis.resume();
      if (this.pauseResolvers.length) { this.releasePauseGate(); return; }
      if (this.liveRuns === 0) this.run();
    },
    pause() {
      this.playing = false;
      this.els.playBtn.textContent = '▶';
      if (Voice.available()) speechSynthesis.pause();
    },
    jumpTo(sceneIdx) {
      this.token++;            // kills any in-flight run at its next check
      Voice.cancel();
      this.finished = false;
      this.playing = true;
      this.els.playBtn.textContent = '⏸';
      this.sceneIdx = sceneIdx; this.lineIdx = 0;
      this.hideBubbles();
      this.els.overlay.innerHTML = ''; this.els.overlay.className = 'hidden';
      this.releasePauseGate(); // let a parked run wake up and die
      this.run();
    },

    async waitMs(ms, token) {
      let left = ms;
      while (left > 0) {
        if (token !== this.token) return false;
        if (!this.playing) {
          await new Promise(res => this.pauseResolvers.push(res));
          if (token !== this.token) return false;
        }
        const step = Math.min(90, left);
        await new Promise(res => setTimeout(res, step));
        left -= step;
      }
      return token === this.token;
    },

    /* ---- main run loop ---- */
    liveRuns: 0,
    async run() {
      const myToken = ++this.token;
      this.liveRuns++;
      try {
        while (this.sceneIdx < EP.scenes.length) {
          const ok = await this.playScene(this.sceneIdx, myToken);
          if (!ok) return; // superseded by a newer run
          this.sceneIdx++;
          this.lineIdx = 0;
        }
        if (myToken === this.token) this.showEndCard();
      } finally {
        this.liveRuns--;
      }
    },

    async playScene(idx, token) {
      const sc = EP.scenes[idx];
      this.updateProgress(idx, 0);
      this.hideBubbles();

      // paint background + scene title
      const bgBody = BG[sc.setting] ? BG[sc.setting]() : BG.field();
      this.els.bg.innerHTML = `<svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice">${bgBody}</svg>`;
      this.els.stage.classList.remove('cut'); void this.els.stage.offsetWidth; this.els.stage.classList.add('cut');
      this.els.sceneTitle.textContent = sc.title;
      this.els.sceneTitle.classList.remove('show'); void this.els.sceneTitle.offsetWidth; this.els.sceneTitle.classList.add('show');
      AudioFX.stinger();
      AudioFX.crowd(sc.setting === 'field' || sc.setting === 'scoreboard' ? 0.09 : 0.04);

      // cast
      const cast = sc.cast || [...new Set(sc.lines.map(l => l.s).filter(s => s !== 'NARRATOR'))];
      this.layoutCast(cast);
      this.els.nowPlaying.textContent = `SCENE ${idx + 1}/${EP.scenes.length} — ${sc.title}`;

      if (!await this.waitMs(1400, token)) return false;

      // overlays
      if (sc.overlay === 'finalScore') { if (!await this.playFinalScore(token)) return false; }
      if (sc.overlay === 'statBoard') { if (!await this.playStatBoard(token)) return false; }

      // lines
      for (let li = this.lineIdx; li < sc.lines.length; li++) {
        if (token !== this.token) return false;
        this.lineIdx = li;
        this.updateProgress(idx, li / sc.lines.length);
        if (!await this.playLine(sc, sc.lines[li], token)) return false;
      }
      this.updateProgress(idx, 1);
      return await this.waitMs(500, token);
    },

    /* ---- cast layout ---- */
    layoutCast(ids) {
      const castEl = this.els.cast;
      castEl.innerHTML = '';
      this.puppets = {};
      const n = ids.length || 1;
      const totalW = Math.min(920, n * 170);
      const each = totalW / n;
      ids.forEach((id, i) => {
        const p = CH.buildPuppet(id);
        if (!p) return;
        const wrap = document.createElement('div');
        wrap.className = 'puppet-slot';
        const isSquad = p.spec.style === 'squad';
        const w = Math.min(isSquad ? 250 : 150, each * (isSquad ? 1.6 : 0.94));
        wrap.style.width = w + 'px';
        wrap.style.left = (480 - totalW / 2 + each * i + (each - w) / 2) + 'px';
        wrap.style.animationDelay = (i * 90) + 'ms';
        wrap.appendChild(p.svg);
        castEl.appendChild(wrap);
        p.wrap = wrap;
        p.gesture('neutral'); p.restMouth('neutral'); p.setBrows('neutral');
        this.puppets[id] = p;
      });
    },

    /* ---- line playback ---- */
    async playLine(sc, ln, token) {
      const isNarr = ln.s === 'NARRATOR';
      const mood = ln.m || 'neutral';

      // lower-third on first appearance
      if (!isNarr && !this.introduced.has(ln.s) && rosterById[ln.s]) {
        this.introduced.add(ln.s);
        this.showLowerThird(rosterById[ln.s]);
      }

      // focus speaker
      for (const id in this.puppets) {
        this.puppets[id].wrap.classList.toggle('speaking', id === ln.s);
      }

      const pup = this.puppets[ln.s];
      if (pup) { pup.setBrows(mood); pup.gesture(mood); }

      // bubble / narrator caption
      if (isNarr) {
        this.els.bubble.classList.add('hidden');
        this.els.narrator.innerHTML = `<span class="vo">ANNOUNCER</span>${ln.t}`;
        this.els.narrator.classList.remove('hidden');
      } else {
        this.els.narrator.classList.add('hidden');
        this.showBubble(pup, ln, mood);
      }

      // flap mouth while the line runs
      let flapTimer = null;
      if (pup && !REDUCED) {
        flapTimer = setInterval(() => pup.setMouth('open', 0.35 + Math.random() * 0.75), 105);
      } else if (pup) {
        pup.setMouth('open', 0.7);
      }

      let ok;
      const dur = this.lineDuration(ln.t);
      if (Voice.enabled && Voice.available()) {
        // Voice.speak resolves on utterance end, error, or its own fallback timer
        const t0 = performance.now();
        const spoke = await Voice.speak(ln.s, ln.t);
        if (token !== this.token) {
          ok = false;
        } else {
          // keep the bubble up a readable minimum; if TTS was a no-op, use full timed duration
          const minMs = spoke ? Math.max(2000, dur * 0.5) : dur;
          const elapsed = performance.now() - t0;
          ok = await this.waitMs(Math.max(320, minMs - elapsed), token);
        }
      } else {
        ok = await this.waitMs(dur, token);
      }

      if (flapTimer) clearInterval(flapTimer);
      if (pup && token === this.token) pup.restMouth(mood);
      return ok;
    },

    showBubble(pup, ln, mood) {
      const b = this.els.bubble;
      b.className = 'bubble ' + (mood === 'smack' || mood === 'angry' ? 'spiky' : mood === 'hype' || mood === 'brag' ? 'bold' : '');
      b.innerHTML = `<span class="b-name">${(rosterById[ln.s] || { short: ln.s }).short}</span>${ln.t}`;
      // position over speaker
      let x = 480, w = 0;
      if (pup && pup.wrap) {
        x = parseFloat(pup.wrap.style.left) + pup.wrap.offsetWidth / 2;
      }
      b.style.left = Math.max(150, Math.min(810, x)) + 'px';
      b.classList.remove('hidden', 'pop'); void b.offsetWidth; b.classList.add('pop');
    },

    hideBubbles() {
      this.els.bubble.classList.add('hidden');
      this.els.narrator.classList.add('hidden');
    },

    showLowerThird(r) {
      const el = this.els.lower;
      const badge = r.badge ? `<span class="lt-badge">${r.badge}</span>` : '';
      el.innerHTML = `<div class="lt-pos">${r.pos}</div><div class="lt-body"><div class="lt-name">${r.name}</div><div class="lt-pts">${r.pts} FANTASY PTS ${badge}</div></div>`;
      el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
      AudioFX.pop();
      clearTimeout(this._ltT);
      this._ltT = setTimeout(() => el.classList.remove('show'), 4200);
    },

    /* ---- overlays ---- */
    async playFinalScore(token) {
      const r = EP.result;
      const ov = this.els.overlay;
      ov.className = 'ov-final';
      ov.innerHTML = `
        <div class="fs-label">FINAL — WEEK ${EP.week}</div>
        <div class="fs-row">
          <div class="fs-team us"><div class="fs-name">${r.teamName}</div><div class="fs-num" id="fsUs">0</div></div>
          <div class="fs-vs">VS</div>
          <div class="fs-team"><div class="fs-name">${r.rivalName}</div><div class="fs-num" id="fsThem">0</div></div>
        </div>
        <div class="fs-stamp" id="fsStamp">MARGIN OF VICTORY: ${r.us - r.them}</div>`;
      const usEl = $('#fsUs'), themEl = $('#fsThem');
      const T = 2100, t0 = performance.now();
      while (performance.now() - t0 < T) {
        if (!await this.waitMs(40, token)) return false;
        const k = Math.min(1, (performance.now() - t0) / T);
        const ease = 1 - Math.pow(1 - k, 3);
        usEl.textContent = Math.round(r.us * ease);
        themEl.textContent = Math.round(r.them * ease);
      }
      usEl.textContent = r.us; themEl.textContent = r.them;
      $('#fsStamp').classList.add('slam');
      AudioFX.stinger();
      if (!await this.waitMs(2400, token)) return false;
      ov.className = 'hidden'; ov.innerHTML = '';
      return true;
    },

    async playStatBoard(token) {
      const ov = this.els.overlay;
      ov.className = 'ov-stats';
      const max = Math.max(...EP.roster.map(r => r.pts));
      ov.innerHTML = `<div class="st-head">WEEK ${EP.week} — BOX SCORE</div>` +
        EP.roster.map((r, i) => `
          <div class="st-row" style="animation-delay:${i * 160}ms">
            <span class="st-pos">${r.pos}</span><span class="st-name">${r.name}</span>
            <span class="st-bar"><span class="st-fill${r.pts === max ? ' top' : ''}" style="width:${(r.pts / max) * 100}%;animation-delay:${i * 160 + 150}ms"></span></span>
            <span class="st-pts">${r.pts}</span>
          </div>`).join('') +
        `<div class="st-total">TOTAL: ${EP.result.us} — A LEAGUE RECORD FLEX</div>`;
      if (!await this.waitMs(EP.roster.length * 160 + 3600, token)) return false;
      ov.className = 'hidden'; ov.innerHTML = '';
      return true;
    },

    showEndCard() {
      this.finished = true; this.playing = false;
      this.els.playBtn.textContent = '▶';
      Voice.cancel();
      this.hideBubbles();
      const ov = this.els.overlay;
      ov.className = 'ov-end';
      ov.innerHTML = `
        <div class="ec-next">NEXT WEEK ON</div>
        <div class="ec-series">${EP.series}</div>
        <div class="ec-tease">${EP.nextWeekTease}</div>
        <button class="tc-play" id="ecReplay">↺&nbsp; REPLAY EPISODE</button>
        <div class="ec-credits">EP ${EP.episode} · “${EP.title}” · a weekly fantasy recap cartoon</div>`;
      $('#ecReplay').addEventListener('click', () => this.jumpTo(0));
      AudioFX.crowd(0.03);
    },

    updateProgress(sceneIdx, frac) {
      [...this.els.progress.children].forEach((seg, i) => {
        const fill = seg.firstElementChild;
        fill.style.width = i < sceneIdx ? '100%' : i === sceneIdx ? (frac * 100) + '%' : '0%';
      });
    },

    /* ---- ambient blink ---- */
    startBlinkLoop() {
      setInterval(() => {
        for (const id in this.puppets) {
          if (Math.random() < 0.32) {
            const p = this.puppets[id];
            p.blink(true);
            setTimeout(() => p.blink(false), 140);
          }
        }
      }, 1900);
    },
  };

  document.addEventListener('DOMContentLoaded', () => Player.init());
  if (document.readyState !== 'loading') Player.init();
})();
