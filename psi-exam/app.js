(function () {
  "use strict";

  var BANK = [].concat(window.BANK_A, window.BANK_B, window.BANK_C, window.BANK_D);
  BANK.forEach(function (q, i) { q.id = i; });

  var SIM_QUESTIONS = 150;
  var SIM_MINUTES = 165;
  var QUICK_QUESTIONS = 25;
  var PASS_PCT = 70;

  var state = null; // { mode, items, answers, flags, idx, deadline, timerId }

  function $(id) { return document.getElementById(id); }
  var screens = ["home", "exam", "results", "review"];
  function show(name) {
    screens.forEach(function (s) {
      $("screen-" + s).classList.toggle("hidden", s !== name);
    });
    $("timer").classList.toggle("hidden", !(name === "exam" && state && state.deadline));
    $("btn-quit").classList.toggle("hidden", name === "home");
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function sections() {
    var out = [];
    var seen = {};
    BANK.forEach(function (q) {
      if (!(q.s in seen)) { seen[q.s] = out.length; out.push({ name: q.s, count: 0 }); }
      out[seen[q.s]].count++;
    });
    return out;
  }

  // Build an exam item with shuffled choices, tracking the correct index.
  function makeItem(q, order) {
    order = order || shuffle(q.c.map(function (_, i) { return i; }));
    return {
      q: q,
      order: order,
      choices: order.map(function (i) { return q.c[i]; }),
      answer: order.indexOf(q.a)
    };
  }

  // ---- Persistence (localStorage) ----
  var SESSION_KEY = "azpc-exam-session";
  var RESULT_KEY = "azpc-last-result";

  function saveSession() {
    if (!state) return;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        mode: state.mode,
        idx: state.idx,
        answers: state.answers,
        flags: state.flags,
        items: state.items.map(function (it) { return { qid: it.q.id, order: it.order }; }),
        remainingMs: state.deadline ? Math.max(0, state.deadline - Date.now()) : null,
        savedAt: Date.now()
      }));
    } catch (e) { /* storage unavailable — run without persistence */ }
  }

  function clearSession() {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
  }

  function loadSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || !Array.isArray(s.items) || !s.items.length) return null;
      return s;
    } catch (e) { return null; }
  }

  function resumeSession(saved) {
    state = {
      mode: saved.mode,
      items: saved.items.map(function (it) { return makeItem(BANK[it.qid], it.order); }),
      answers: saved.answers,
      flags: saved.flags,
      idx: Math.min(saved.idx, saved.items.length - 1),
      deadline: saved.remainingMs !== null ? Date.now() + saved.remainingMs : null,
      timerId: null
    };
    if (state.deadline) {
      state.timerId = setInterval(tick, 500);
      tick();
    }
    buildNav();
    render();
    show("exam");
  }

  function refreshHome() {
    var saved = loadSession();
    var card = $("resume-card");
    card.classList.toggle("hidden", !saved);
    if (saved) {
      var done = saved.answers.filter(function (a) { return a !== null; }).length;
      var when = new Date(saved.savedAt).toLocaleString();
      $("resume-detail").textContent = done + " of " + saved.items.length +
        " answered · saved " + when +
        (saved.remainingMs !== null ? " · " + Math.ceil(saved.remainingMs / 60000) + " min left on the clock" : " · untimed");
    }
    var last = null;
    try { last = JSON.parse(localStorage.getItem(RESULT_KEY)); } catch (e) {}
    $("last-result").classList.toggle("hidden", !last);
    if (last) {
      $("last-result").textContent = "Last completed attempt: " + last.pct + "% (" +
        last.correct + "/" + last.total + ") — " + (last.pct >= PASS_PCT ? "PASS" : "below passing") +
        " · " + new Date(last.when).toLocaleString();
    }
  }

  function start(mode, pool, count, timed) {
    var picked = shuffle(pool).slice(0, count);
    state = {
      mode: mode,
      items: picked.map(function (q) { return makeItem(q); }),
      answers: new Array(picked.length).fill(null),
      flags: new Array(picked.length).fill(false),
      idx: 0,
      deadline: timed ? Date.now() + SIM_MINUTES * 60 * 1000 : null,
      timerId: null
    };
    if (timed) {
      state.timerId = setInterval(tick, 500);
      tick();
    }
    buildNav();
    render();
    saveSession();
    show("exam");
  }

  var lastTickSave = 0;
  function tick() {
    var left = state.deadline - Date.now();
    if (Date.now() - lastTickSave > 10000) { lastTickSave = Date.now(); saveSession(); }
    if (left <= 0) {
      clearInterval(state.timerId);
      $("timer").textContent = "0:00:00";
      finish(true);
      return;
    }
    var s = Math.floor(left / 1000);
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    $("timer").textContent = h + ":" + String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
    $("timer").classList.toggle("low", left < 10 * 60 * 1000);
  }

  function buildNav() {
    var grid = $("nav-grid");
    grid.innerHTML = "";
    state.items.forEach(function (_, i) {
      var b = document.createElement("button");
      b.className = "nav-cell";
      b.textContent = i + 1;
      b.addEventListener("click", function () { state.idx = i; render(); });
      grid.appendChild(b);
    });
  }

  function render() {
    var i = state.idx;
    var item = state.items[i];
    var instant = state.mode !== "sim";
    var answered = state.answers[i] !== null;

    $("q-position").textContent = "Question " + (i + 1) + " of " + state.items.length;
    $("q-section").textContent = item.q.s;
    $("q-text").textContent = item.q.q;

    var box = $("q-choices");
    box.innerHTML = "";
    item.choices.forEach(function (text, ci) {
      var b = document.createElement("button");
      b.className = "choice";
      b.innerHTML = '<span class="letter">' + "ABCD"[ci] + "</span><span></span>";
      b.lastChild.textContent = text;
      if (state.answers[i] === ci) b.classList.add("selected");
      if (instant && answered) {
        b.disabled = true;
        if (ci === item.answer) b.classList.add("correct");
        else if (state.answers[i] === ci) b.classList.add("wrong");
      } else {
        b.addEventListener("click", function () {
          state.answers[i] = ci;
          render();
        });
      }
      box.appendChild(b);
    });

    var fb = $("q-feedback");
    if (instant && answered) {
      var right = state.answers[i] === item.answer;
      fb.className = "feedback " + (right ? "good" : "bad");
      fb.innerHTML = "<strong>" + (right ? "Correct." : "Incorrect.") + "</strong> ";
      fb.appendChild(document.createTextNode(item.q.e));
      fb.classList.remove("hidden");
    } else {
      fb.classList.add("hidden");
    }

    $("btn-prev").disabled = i === 0;
    $("btn-next").disabled = i === state.items.length - 1;
    $("btn-flag").classList.toggle("on", state.flags[i]);

    var cells = $("nav-grid").children;
    for (var c = 0; c < cells.length; c++) {
      cells[c].classList.toggle("answered", state.answers[c] !== null);
      cells[c].classList.toggle("flagged", state.flags[c]);
      cells[c].classList.toggle("current", c === i);
    }
    saveSession();
  }

  function finish(auto) {
    if (!auto) {
      var un = state.answers.filter(function (a) { return a === null; }).length;
      var msg = un > 0
        ? "You have " + un + " unanswered question" + (un === 1 ? "" : "s") + ". Submit anyway?"
        : "Submit your exam for scoring?";
      if (!window.confirm(msg)) return;
    }
    if (state.timerId) clearInterval(state.timerId);

    var perSection = {};
    var correct = 0;
    state.items.forEach(function (item, i) {
      var sec = item.q.s;
      if (!perSection[sec]) perSection[sec] = { right: 0, total: 0 };
      perSection[sec].total++;
      if (state.answers[i] === item.answer) { correct++; perSection[sec].right++; }
    });

    var pct = Math.round((correct / state.items.length) * 100);
    var pass = pct >= PASS_PCT;
    clearSession();
    try {
      localStorage.setItem(RESULT_KEY, JSON.stringify({
        pct: pct, correct: correct, total: state.items.length, mode: state.mode, when: Date.now()
      }));
    } catch (e) {}
    $("result-headline").textContent = pass ? "PASS — nice work!" : "Not yet — keep drilling.";
    $("result-score").textContent = pct + "%";
    $("result-score").className = "score-big " + (pass ? "pass" : "fail");
    $("result-detail").textContent = correct + " of " + state.items.length + " correct" +
      (state.mode === "sim" ? " · full simulation" : "");

    var table = $("result-sections");
    table.innerHTML = "<tr><th>Section</th><th class='num'>Score</th><th></th></tr>";
    Object.keys(perSection).forEach(function (sec) {
      var d = perSection[sec];
      var p = Math.round((d.right / d.total) * 100);
      var tr = document.createElement("tr");
      var barCls = p < PASS_PCT ? "bar low" : "bar";
      tr.innerHTML = "<td></td><td class='num'>" + d.right + "/" + d.total + " (" + p + "%)</td>" +
        "<td><div class='" + barCls + "'><i style='width:" + p + "%'></i></div></td>";
      tr.firstChild.textContent = sec;
      table.appendChild(tr);
    });
    show("results");
  }

  function renderReview() {
    var missedOnly = $("review-missed-only").checked;
    var list = $("review-list");
    list.innerHTML = "";
    state.items.forEach(function (item, i) {
      var right = state.answers[i] === item.answer;
      if (missedOnly && right) return;
      var div = document.createElement("div");
      div.className = "review-item";

      var head = document.createElement("p");
      head.className = "q-text";
      head.textContent = (i + 1) + ". " + item.q.q;
      var tag = document.createElement("span");
      tag.className = "tag " + (right ? "ok" : "miss");
      tag.textContent = right ? "Correct" : (state.answers[i] === null ? "Unanswered" : "Missed");
      head.appendChild(tag);
      div.appendChild(head);

      var your = document.createElement("p");
      your.className = "ans";
      your.textContent = "Your answer: " + (state.answers[i] === null ? "—" : item.choices[state.answers[i]]);
      div.appendChild(your);

      if (!right) {
        var corr = document.createElement("p");
        corr.className = "ans";
        corr.textContent = "Correct answer: " + item.choices[item.answer];
        div.appendChild(corr);
      }

      var exp = document.createElement("p");
      exp.className = "exp";
      exp.textContent = item.q.e;
      div.appendChild(exp);

      list.appendChild(div);
    });
    if (!list.children.length) {
      list.innerHTML = "<p class='muted'>Nothing missed — flip the toggle to review everything.</p>";
    }
  }

  function buildSectionList() {
    var box = $("section-list");
    sections().forEach(function (s) {
      var label = document.createElement("label");
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = s.name;
      label.appendChild(cb);
      label.appendChild(document.createTextNode(s.name));
      var count = document.createElement("span");
      count.className = "count";
      count.textContent = s.count + " Qs";
      label.appendChild(count);
      box.appendChild(label);
    });
  }

  // Wiring
  $("bank-count").textContent = BANK.length;
  buildSectionList();
  refreshHome();

  $("btn-resume").addEventListener("click", function () {
    var saved = loadSession();
    if (!saved) { refreshHome(); return; }
    resumeSession(saved);
  });
  $("btn-discard").addEventListener("click", function () {
    if (!window.confirm("Discard the saved exam? Its answers will be lost.")) return;
    clearSession();
    refreshHome();
  });

  $("btn-start-sim").addEventListener("click", function () {
    start("sim", BANK, Math.min(SIM_QUESTIONS, BANK.length), true);
  });
  $("btn-start-sim-untimed").addEventListener("click", function () {
    start("sim", BANK, Math.min(SIM_QUESTIONS, BANK.length), false);
  });
  $("btn-start-quick").addEventListener("click", function () {
    start("quick", BANK, QUICK_QUESTIONS, false);
  });
  $("btn-start-practice").addEventListener("click", function () {
    var chosen = Array.prototype.slice.call(
      document.querySelectorAll("#section-list input:checked")
    ).map(function (cb) { return cb.value; });
    if (!chosen.length) { window.alert("Pick at least one section."); return; }
    var pool = BANK.filter(function (q) { return chosen.indexOf(q.s) !== -1; });
    start("practice", pool, pool.length, false);
  });

  $("btn-prev").addEventListener("click", function () { state.idx--; render(); });
  $("btn-next").addEventListener("click", function () { state.idx++; render(); });
  $("btn-flag").addEventListener("click", function () {
    state.flags[state.idx] = !state.flags[state.idx];
    render();
  });
  $("btn-submit").addEventListener("click", function () { finish(false); });
  $("btn-quit").addEventListener("click", function () {
    if (state) saveSession(); // progress stays resumable from the home screen
    if (state && state.timerId) clearInterval(state.timerId);
    state = null;
    refreshHome();
    show("home");
  });
  $("btn-review").addEventListener("click", function () { renderReview(); show("review"); });
  $("btn-review-back").addEventListener("click", function () { show("results"); });
  $("btn-home").addEventListener("click", function () { state = null; refreshHome(); show("home"); });
  $("review-missed-only").addEventListener("change", renderReview);
})();
