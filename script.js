const defaultState = {
  title: "DRAFT RESULTS",
  subtitle: "FIGHTING GAME TEAM BATTLE",
  ratio: "landscape",
  teams: [
    { name: "TEAM BLAZE", color: "#ff3045", players: ["SHAKA", "ハイタニ", "ときど", "ガチくん", "立川", "カワノ"] },
    { name: "TEAM ARCTIC", color: "#22a8ff", players: ["k4sen", "ふ〜ど", "どぐら", "マゴ", "もけ", "ナウマン"] },
    { name: "TEAM NEBULA", color: "#b636ff", players: ["じゃすぱー", "ボンちゃん", "MOV", "あくあ", "りゅうせい", "竹内ジョン"] },
    { name: "TEAM VENOM", color: "#00d084", players: ["ウメハラ", "板橋ザンギエフ", "ネモ", "sako", "ぷげら", "翔"] },
    { name: "TEAM ORBIT", color: "#ff8a00", players: ["SPYGEA", "だるまいずごっど", "ありさか", "たいじ", "おぼ", "Zerost"] },
    { name: "TEAM CROWN", color: "#ffd200", players: ["もこう", "加藤純一", "おにや", "こくじん", "総師範KSK", "えいた"] }
  ]
};

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

let state = deepClone(defaultState);

const $ = function(id) { return document.getElementById(id); };
const teamCount = $("teamCount");
const teamEditor = $("teamEditor");
const board = $("board");
const captureArea = $("captureArea");

for (let i = 1; i <= 6; i++) {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = i + "チーム";
  teamCount.appendChild(opt);
}

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach(function(b) { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function base64ToUtf8(str) {
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function encodeState() {
  return utf8ToBase64(JSON.stringify({
    title: state.title,
    subtitle: state.subtitle,
    ratio: state.ratio,
    teams: state.teams.slice(0, Number(teamCount.value))
  }));
}

function decodeState() {
  const params = new URLSearchParams(location.search);
  const raw = params.get("data");
  if (!raw) return false;
  try {
    const parsed = JSON.parse(base64ToUtf8(raw));
    state.title = parsed.title || defaultState.title;
    state.subtitle = parsed.subtitle || defaultState.subtitle;
    state.ratio = parsed.ratio || "landscape";
    state.teams = (parsed.teams || []).concat(defaultState.teams).slice(0, 6);
    return true;
  } catch (e) {
    console.warn("URLデータの読み込みに失敗しました", e);
    return false;
  }
}

function showToast(text) {
  const toast = $("toast");
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(function() { toast.classList.remove("show"); }, 1800);
}

function syncInputs() {
  $("eventTitle").value = state.title;
  $("eventSubtitle").value = state.subtitle;
  $("boardRatio").value = state.ratio;
  teamCount.value = String(Math.min(6, Math.max(1, state.teams.length)));
  buildEditor();
  render();
}

function buildEditor() {
  const count = Number(teamCount.value);
  teamEditor.innerHTML = "";

  for (let t = 0; t < count; t++) {
    if (!state.teams[t]) state.teams[t] = deepClone(defaultState.teams[t]);
    const team = state.teams[t];

    const card = document.createElement("article");
    card.className = "editor-card";
    card.innerHTML =
      '<h3>TEAM ' + String(t + 1).padStart(2, "0") + '</h3>' +
      '<label>チーム名' +
        '<input data-team="' + t + '" data-field="name" type="text" maxlength="24" value="' + escapeHtml(team.name) + '">' +
      '</label>' +
      '<label>チームカラー' +
        '<input class="color-input" data-team="' + t + '" data-field="color" type="color" value="' + team.color + '">' +
      '</label>' +
      Array.from({ length: 6 }, function(_, p) {
        return '<label>選手' + (p + 1) +
          '<input data-team="' + t + '" data-player="' + p + '" type="text" maxlength="24" value="' + escapeHtml(team.players[p] || "") + '">' +
        '</label>';
      }).join("");

    teamEditor.appendChild(card);
  }

  Array.prototype.forEach.call(teamEditor.querySelectorAll("input"), function(input) {
    input.addEventListener("input", function(e) {
      const el = e.currentTarget;
      const t = Number(el.dataset.team);
      if (el.dataset.field === "name") state.teams[t].name = el.value;
      if (el.dataset.field === "color") state.teams[t].color = el.value;
      if (el.dataset.player !== undefined) state.teams[t].players[Number(el.dataset.player)] = el.value;
      render();
    });
  });
}

function render() {
  state.title = $("eventTitle").value || "DRAFT RESULTS";
  state.subtitle = $("eventSubtitle").value || "FIGHTING GAME TEAM BATTLE";
  state.ratio = $("boardRatio").value;

  $("posterTitle").textContent = state.title;
  $("posterSubtitle").textContent = state.subtitle;

  captureArea.className = "capture-area " + state.ratio;

  const count = Number(teamCount.value);
  board.className = "draft-board team-count-" + count;
  board.innerHTML = "";

  state.teams.slice(0, count).forEach(function(team, index) {
    const card = document.createElement("article");
    card.className = "team-card";
    const rgb = hexToRgb(team.color);
    card.style.setProperty("--team-color", team.color);
    card.style.setProperty("--team-rgb", rgb.r + "," + rgb.g + "," + rgb.b);

    card.innerHTML =
      '<div class="team-head">' +
        '<div class="team-index">TEAM ' + String(index + 1).padStart(2, "0") + '</div>' +
        '<div class="team-name">' + escapeHtml(team.name || ("TEAM " + (index + 1))) + '</div>' +
      '</div>' +
      '<div class="players">' +
        Array.from({ length: 6 }, function(_, p) {
          return '<div class="player-row">' +
            '<div class="pick-no">' + String(p + 1).padStart(2, "0") + '</div>' +
            '<div class="player-name">' + escapeHtml(team.players[p] || ("PLAYER " + (p + 1))) + '</div>' +
          '</div>';
        }).join("") +
      '</div>';

    board.appendChild(card);
  });
}

function hexToRgb(hex) {
  const raw = String(hex || "#ffffff").replace("#", "");
  const full = raw.length === 3 ? raw.split("").map(function(c) { return c + c; }).join("") : raw;
  const n = parseInt(full, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255
  };
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function(m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m];
  });
}

$("eventTitle").addEventListener("input", render);
$("eventSubtitle").addEventListener("input", render);
$("boardRatio").addEventListener("change", render);

teamCount.addEventListener("change", function() {
  const count = Number(teamCount.value);
  while (state.teams.length < count) state.teams.push(deepClone(defaultState.teams[state.teams.length]));
  buildEditor();
  render();
});

$("resetSample").addEventListener("click", function() {
  state = deepClone(defaultState);
  syncInputs();
  showToast("サンプルに戻しました");
});

$("copyShareUrl").addEventListener("click", async function() {
  const url = location.origin + location.pathname + "?data=" + encodeURIComponent(encodeState());
  try {
    await navigator.clipboard.writeText(url);
    showToast("共有URLをコピーしました");
  } catch (e) {
    prompt("このURLをコピーしてください", url);
  }
});

$("downloadPng").addEventListener("click", async function() {
  if (typeof html2canvas === "undefined") {
    showToast("画像保存ライブラリの読み込みに失敗しました");
    alert("画像保存用ライブラリ html2canvas が読み込めませんでした。ネット接続やCDNブロックを確認してください。");
    return;
  }

  const ratio = state.ratio;
  const targetW = ratio === "portrait" ? 1080 : ratio === "square" ? 1200 : 1920;
  const currentW = captureArea.getBoundingClientRect().width || targetW;
  const scale = Math.max(2, targetW / currentW);

  showToast("画像を生成しています");

  try {
    const canvas = await html2canvas(captureArea, {
      backgroundColor: null,
      scale: scale,
      useCORS: true,
      logging: false
    });

    const a = document.createElement("a");
    const safeTitle = (state.title || "draft-results").replace(/[\\/:*?"<>|]/g, "_");
    a.download = safeTitle + ".png";
    a.href = canvas.toDataURL("image/png");
    a.click();
    showToast("PNGを保存しました");
  } catch (e) {
    console.error(e);
    showToast("PNG保存に失敗しました");
    alert("PNG保存に失敗しました。表示自体は使えます。");
  }
});

$("togglePanel").addEventListener("click", function() {
  const controls = $("controls");
  const hidden = controls.style.display === "none";
  controls.style.display = hidden ? "" : "none";
  $("togglePanel").textContent = hidden ? "入力欄を隠す" : "入力欄を表示";
});

decodeState();
syncInputs();
