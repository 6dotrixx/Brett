/* COMBAT RECORD TERMINAL — dashboard client */
(() => {
  const $ = (sel) => document.querySelector(sel);
  let currentGame = "BO1";

  const fmtDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  };
  const fmtMinutes = (m) => {
    if (m == null) return "—";
    if (m < 60) return `${m}m`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  };
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  async function api(path, opts) {
    const res = await fetch(`/api${path}`, opts);
    return res.json();
  }

  // ── status ──
  async function loadStatus() {
    try {
      const s = await api("/status");
      $("#operative").textContent = s.player?.psn_id || s.player?.name || "UNKNOWN";
      const link = $("#psn-link");
      link.textContent = s.psn?.linked ? "ESTABLISHED" : "NOT LINKED";
      link.className = "value " + (s.psn?.linked ? "ok" : "bad");
      $("#last-poll").textContent = s.lastPresencePoll ? fmtDate(s.lastPresencePoll) : "never";
      $("#poll-interval").textContent = s.pollIntervalSeconds;

      const live = $("#live-status");
      const active = $("#active-session");
      if (s.activeSession) {
        live.textContent = "IN COMBAT";
        live.className = "value ok";
        active.classList.remove("hidden");
        active.textContent = `▶ ACTIVE DEPLOYMENT: ${s.activeSession.title_name || s.activeSession.game} — since ${fmtDate(s.activeSession.started_at)}`;
      } else {
        live.textContent = s.psn?.linked ? "STANDBY" : "OFFLINE";
        live.className = "value";
        active.classList.add("hidden");
      }
      $("#statusline").innerHTML = s.psn?.linked
        ? `<span class="blink">█</span> UPLINK ACTIVE — monitoring PSN presence` +
          (s.claudeConfigured ? " · OCR: CLAUDE VISION" : " · OCR: TESSERACT")
        : `<span class="blink">█</span> UPLINK DOWN — set NPSSO in .env to link your PSN account`;
    } catch {
      $("#statusline").textContent = "✖ TERMINAL UNREACHABLE";
    }
  }

  // ── snapshots ──
  async function loadStats() {
    const [snapRes, diffRes] = await Promise.all([
      api(`/snapshots?game=${currentGame}`),
      api(`/snapshots/diff?game=${currentGame}`),
    ]);
    const latest = snapRes.snapshots?.[0];
    const row = $("#latest-stats");
    if (!latest) {
      row.innerHTML = `<div class="dim" style="grid-column:1/-1">No snapshots yet — upload a combat record screenshot below.</div>`;
    } else {
      const cells = [
        ["KILLS", latest.kills], ["DEATHS", latest.deaths], ["K/D", latest.kd_ratio],
        ["WINS", latest.wins], ["LOSSES", latest.losses], ["WIN %", latest.win_pct],
        ["SCORE", latest.score], ["HEADSHOTS", latest.headshots],
      ].filter(([, v]) => v != null);
      row.innerHTML = cells
        .map(([cap, v]) => `<div class="stat"><div class="num">${esc(typeof v === "number" ? v.toLocaleString() : v)}</div><div class="cap">${cap}</div></div>`)
        .join("");
    }

    const box = $("#diff-box");
    if (!diffRes.diff) {
      box.innerHTML = `<span class="dim">SNAPSHOT DIFF: need two snapshots — upload again after your next session to see exact period K/D, games played and win rate.</span>`;
    } else {
      const d = diffRes.diff;
      const sign = (v) => (v == null ? "—" : v >= 0 ? `<span class="up">+${v.toLocaleString()}</span>` : `<span class="down">${v.toLocaleString()}</span>`);
      box.innerHTML =
        `PERIOD ${fmtDate(diffRes.from)} → ${fmtDate(diffRes.to)}<br>` +
        `KILLS ${sign(d.kills)} · DEATHS ${sign(d.deaths)} · PERIOD K/D <b>${d.kdRatio ?? "—"}</b> · ` +
        `GAMES ${d.games ?? "—"} · WINS ${sign(d.wins)} · WIN% <b>${d.winPct ?? "—"}</b>`;
    }
  }

  // ── sessions ──
  async function loadSessions() {
    const { sessions, totals } = await api("/sessions");
    $("#session-totals").innerHTML = (totals || [])
      .map((t) => `<span>${esc(t.game)}: <b>${t.sessions}</b> ops · <b>${fmtMinutes(t.total_minutes)}</b> in theater</span>`)
      .join("") || `<span class="dim">No sessions logged yet — boot up BO1/BO2 and the poller will catch it.</span>`;
    const tbody = $("#sessions-table tbody");
    tbody.innerHTML = (sessions || [])
      .map((s) => {
        const live = !s.ended_at;
        return `<tr class="${live ? "live" : ""}">
          <td>#${s.id}</td><td>${esc(s.game)}</td>
          <td>${fmtDate(s.started_at)}</td>
          <td>${live ? "ACTIVE" : fmtDate(s.ended_at)}</td>
          <td>${fmtMinutes(s.minutes)}</td><td>${esc(s.source)}</td>
        </tr>`;
      })
      .join("");
  }

  // ── map intel ──
  async function loadMaps() {
    const { maps } = await api("/maps");
    const note = $("#map-note");
    const tbody = $("#maps-table tbody");
    if (!maps || maps.length === 0) {
      note.innerHTML = `<span class="dim">No map data yet — drop an end-of-match screenshot in the INTEL UPLOAD above and it lands here automatically.</span>`;
      tbody.innerHTML = "";
      return;
    }
    note.innerHTML = `<span>${maps.length} maps on record · <b>${maps.reduce((a, m) => a + m.matches, 0)}</b> matches logged</span>`;
    tbody.innerHTML = maps
      .map(
        (m) => `<tr>
          <td>${esc(m.map)}</td>
          <td>${esc(m.game)}</td>
          <td class="dim">${esc(m.mode || "—")}</td>
          <td>${m.matches}</td>
          <td>${m.kills != null ? m.kills.toLocaleString() : "—"}</td>
          <td>${m.deaths != null ? m.deaths.toLocaleString() : "—"}</td>
          <td>${m.kd_ratio ?? "—"}</td>
          <td>${m.wins || m.losses ? `${m.wins}–${m.losses}` : "—"}</td>
          <td>${m.best_round ?? "—"}</td>
        </tr>`
      )
      .join("");
  }

  // ── campaign ──
  async function loadCampaign() {
    const data = await api("/campaign");
    const render = (missions) =>
      (missions || [])
        .map((m) => `<li class="${m.completed ? "done" : "todo"}">${esc(m.mission)}</li>`)
        .join("");
    $("#campaign-bo1").innerHTML = render(data.BO1);
    $("#campaign-bo2").innerHTML = render(data.BO2);
  }

  // ── trophies ──
  const gradeClass = { platinum: "grade-p", gold: "grade-g", silver: "grade-s", bronze: "grade-b" };
  async function loadTrophies() {
    const { trophies, summary } = await api("/trophies");
    $("#trophy-summary").innerHTML = (summary || [])
      .map((s) => `<span>${esc(s.game)}: <b>${s.earned ?? 0}/${s.total}</b> earned</span>`)
      .join("") || `<span class="dim">No trophy data yet — link PSN and hit SYNC NOW above.</span>`;
    const tbody = $("#trophies-table tbody");
    tbody.innerHTML = (trophies || [])
      .map(
        (t) => `<tr>
          <td>${t.earned ? "✓" : "·"}</td>
          <td>${esc(t.game)}</td>
          <td class="${gradeClass[t.grade] || ""}">${esc((t.grade || "").toUpperCase())}</td>
          <td>${esc(t.name)}<br><span class="dim small">${esc(t.detail || "")}</span></td>
          <td>${t.earned_at ? fmtDate(t.earned_at) : "—"}</td>
        </tr>`
      )
      .join("");
  }

  // ── upload ──
  async function uploadFile(file) {
    const status = $("#upload-status");
    status.textContent = `TRANSMITTING ${file.name}... running OCR (this can take ~10s)`;
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": file.type || "image/png" },
        body: file,
      });
      const data = await res.json();
      if (data.ok && data.type === "match") {
        const m = data.match || {};
        status.innerHTML = `<span class="up" style="color:var(--green)">✓ MATCH LOGGED via ${data.engine.toUpperCase()} — ${esc(m.map || "unknown map")}${m.mode ? " · " + esc(m.mode) : ""}${m.round != null ? " · round " + m.round : ""} (${esc(data.game)}).</span>`;
        await Promise.all([loadMaps(), loadStatus()]);
      } else if (data.ok) {
        status.innerHTML = `<span class="up" style="color:var(--green)">✓ INTEL PROCESSED via ${data.engine.toUpperCase()} — snapshot #${data.snapshotId} (${esc(data.game)}) recorded.</span>`;
        await Promise.all([loadStats(), loadStatus()]);
      } else {
        status.innerHTML = `<span style="color:var(--red)">✖ ${esc(data.error || "extraction failed")}</span>`;
      }
    } catch (err) {
      status.innerHTML = `<span style="color:var(--red)">✖ upload failed: ${esc(err.message)}</span>`;
    }
  }

  const dz = $("#dropzone");
  dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("dragover"); });
  dz.addEventListener("dragleave", () => dz.classList.remove("dragover"));
  dz.addEventListener("drop", (e) => {
    e.preventDefault();
    dz.classList.remove("dragover");
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  });
  $("#pick-file").addEventListener("click", () => $("#file-input").click());
  $("#file-input").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  });

  document.querySelectorAll(".tab").forEach((btn) =>
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentGame = btn.dataset.game;
      loadStats();
    })
  );

  $("#sync-trophies").addEventListener("click", async (e) => {
    e.target.textContent = "SYNCING...";
    try {
      await api("/sync/trophies", { method: "POST" });
      await Promise.all([loadTrophies(), loadCampaign()]);
    } finally {
      e.target.textContent = "SYNC NOW";
    }
  });

  // boot + refresh loop
  function refreshAll() {
    loadStatus();
    loadStats();
    loadSessions();
    loadMaps();
    loadCampaign();
    loadTrophies();
  }
  refreshAll();
  setInterval(() => { loadStatus(); loadSessions(); }, 15000);
})();
