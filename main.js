// V9.39.2: Fix ffetch typo (main.js:1330)
// ============================================
// CLIPORA V8.7.0 - Main JavaScript
// Default Hemat + Smart Balanced + Zoom + Filmstrip
// ============================================

// ============================================
// V8.9.25: CUSTOM CONFIRM MODAL (ganti confirm() bawaan browser)
// ============================================
window.showConfirm = function (options = {}) {
  return new Promise((resolve) => {
    const {
      title = "Konfirmasi",
      message = "",
      type = "info", // 'info' | 'warning' | 'danger' | 'success'
      okText = "OK",
      cancelText = "Batal",
      okColor = null, // override warna tombol OK
    } = options;

    // Warna per tipe
    const typeStyles = {
      info: { icon: "fa-info-circle", color: "#06b6d4" },
      warning: { icon: "fa-exclamation-triangle", color: "#f59e0b" },
      danger: { icon: "fa-times-circle", color: "#ef4444" },
      success: { icon: "fa-check-circle", color: "#22c55e" },
    };
    const style = typeStyles[type] || typeStyles.info;
    const finalOkColor = okColor || style.color;

    // Hapus modal lama kalau ada
    const oldModal = document.getElementById("cliporaConfirmModal");
    if (oldModal) oldModal.remove();

    // Buat overlay
    const overlay = document.createElement("div");
    overlay.id = "cliporaConfirmModal";
    overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 99999;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
            opacity: 0; transition: opacity 0.15s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

    const card = document.createElement("div");
    card.style.cssText = `
            background: #1e293b;
            border: 1px solid rgba(148,163,184,0.15);
            border-radius: 16px;
            padding: 28px;
            max-width: 440px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            transform: scale(0.95); opacity: 0;
            transition: transform 0.2s ease, opacity 0.2s ease;
        `;

    card.innerHTML = `
            <div style="display:flex; align-items:flex-start; gap:16px; margin-bottom:20px;">
                <div style="flex-shrink:0; width:44px; height:44px; border-radius:50%;
                            background:${style.color}22; display:flex; align-items:center;
                            justify-content:center;">
                    <i class="fas ${style.icon}" style="color:${style.color}; font-size:20px;"></i>
                </div>
                <div style="flex:1;">
                    <h3 style="margin:0 0 8px 0; font-size:1.05rem; font-weight:700;
                               color:#f1f5f9; line-height:1.3;">
                        ${title}
                    </h3>
                    <div style="font-size:0.9rem; color:#94a3b8; line-height:1.5;
                                white-space:pre-line;">
                        ${message}
                    </div>
                </div>
            </div>
            <div style="display:flex; gap:10px; justify-content:flex-end;">
                <button id="cliporaConfirmCancel" style="
                    padding:10px 20px; border-radius:10px;
                    border:1px solid rgba(148,163,184,0.25);
                    background:rgba(148,163,184,0.08);
                    color:#cbd5e1; font-weight:600; font-size:0.875rem;
                    cursor:pointer; font-family:inherit; transition:0.15s;
                ">${cancelText}</button>
                <button id="cliporaConfirmOk" style="
                    padding:10px 20px; border-radius:10px; border:none;
                    background:${finalOkColor};
                    color:white; font-weight:700; font-size:0.875rem;
                    cursor:pointer; font-family:inherit; transition:0.15s;
                    box-shadow:0 4px 12px ${finalOkColor}44;
                ">${okText}</button>
            </div>
        `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      card.style.transform = "scale(1)";
      card.style.opacity = "1";
    });

    // Hover effect tombol
    const okBtn = card.querySelector("#cliporaConfirmOk");
    const cancelBtn = card.querySelector("#cliporaConfirmCancel");

    okBtn.addEventListener("mouseenter", () => {
      okBtn.style.transform = "translateY(-1px)";
      okBtn.style.boxShadow = `0 6px 16px ${finalOkColor}66`;
    });
    okBtn.addEventListener("mouseleave", () => {
      okBtn.style.transform = "";
      okBtn.style.boxShadow = `0 4px 12px ${finalOkColor}44`;
    });
    cancelBtn.addEventListener("mouseenter", () => {
      cancelBtn.style.background = "rgba(148,163,184,0.15)";
    });
    cancelBtn.addEventListener("mouseleave", () => {
      cancelBtn.style.background = "rgba(148,163,184,0.08)";
    });

    // Cleanup + resolve
    const close = (result) => {
      overlay.style.opacity = "0";
      card.style.transform = "scale(0.95)";
      card.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
      }, 150);
      document.removeEventListener("keydown", onKey);
      resolve(result);
    };

    const onKey = (e) => {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    };

    okBtn.addEventListener("click", () => close(true));
    cancelBtn.addEventListener("click", () => close(false));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close(false);
    });
    document.addEventListener("keydown", onKey);
  });
};

console.log("ÃƒÂ¢Ã…â€œÃ‚Â¨ [UI] Custom confirm modal loaded");

// ============================================
// V8.9.0: GLOBAL 401 FETCH INTERCEPTOR
// Auto-redirect ke login kalau JWT expired
// ============================================
(function () {
  if (window.__FETCH_401_INTERCEPTOR__) return; // prevent double install
  window.__FETCH_401_INTERCEPTOR__ = true;

  const originalFetch = window.fetch;
  let isRedirecting = false;
  const SKIP_PATTERNS = [
    "/login",
    "/register",
    "/auth/",
    "/health",
    "/user/notifications", // V8.9.5: polling ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â jangan redirect
    "/admin/pending-summary", // V8.9.5: bell admin polling
    "/admin/stats", // V8.9.5: dashboard admin
    "/admin/charts", // V8.9.5: dashboard admin
  ];

  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);

    if (response.status === 401 && !isRedirecting) {
      // Dapatkan URL request untuk cek skip
      let urlStr = "";
      try {
        const arg0 = args[0];
        urlStr =
          typeof arg0 === "string" ? arg0 : arg0 && arg0.url ? arg0.url : "";
      } catch (e) {
        /* ignore */
      }

      // Skip endpoint auth publik (login/register/health)
      const shouldSkip = SKIP_PATTERNS.some((p) => urlStr.includes(p));
      if (shouldSkip) return response;

      // V8.9.5: Cek apakah benar-benar TOKEN_EXPIRED
      // Kalau bukan (mis. USER_NOT_FOUND, atau 401 karena DB busy),
      // jangan redirect ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â biarkan user tetap di halaman
      let errorCode = "";
      try {
        const clone = response.clone();
        const body = await clone.json();
        errorCode = body.code || "";
      } catch (e) {
        /* bukan JSON, skip */
      }

      // Hanya redirect kalau token expired/invalid
      if (
        errorCode &&
        errorCode !== "TOKEN_EXPIRED" &&
        errorCode !== "TOKEN_INVALID" &&
        errorCode !== "NO_TOKEN"
      ) {
        console.warn(
          "ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂºÃ‚Â¡ÃƒÂ¯Ã‚Â¸Ã‚Â [Auth] 401 bukan token error (code=" +
            errorCode +
            ") ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â skip redirect",
        );
        return response;
      }

      // Kalau tidak ada code (backend lama), asumsikan token expired
      // Cek apakah user memang pernah login
      const wasLoggedIn =
        (typeof IS_LOGGED_IN !== "undefined" && IS_LOGGED_IN) ||
        (typeof AUTH_TOKEN !== "undefined" &&
          AUTH_TOKEN &&
          AUTH_TOKEN.length > 20);

      if (wasLoggedIn) {
        // V9.61.8: SMART 401 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â cek code, JANGAN asal redirect
        try {
          var _clone = response.clone();
          var _ct = response.headers.get("content-type") || "";
          if (_ct.indexOf("application/json") !== -1) {
            _clone.json().then(function(payload) {
              var _code = payload && payload.code;
              if (_code === "TOKEN_EXPIRED" || _code === "NO_TOKEN" || _code === "USER_NOT_FOUND") {
                console.warn("[Auth] 401 redirect:", _code);
                _doRedirect();
              } else {
                console.warn("[Auth] 401 diabaikan (code:", _code || "none", ")");
              }
            }).catch(function(err) {
              console.warn("[Auth] 401 diabaikan ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â body error");
            });
          } else {
            console.warn("[Auth] 401 diabaikan ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â bukan JSON");
          }
        } catch (e) {
          console.warn("[Auth] 401 handling error:", e.message);
        }
        function _doRedirect() {
          var _isAutoclipPage = window.location.pathname.toLowerCase().indexOf("autoclip") !== -1;
          if (_isAutoclipPage) {
            console.warn("[Auth] Skip redirect ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â di halaman autoclip");
            return;
          }
          if (isRedirecting) return;
          isRedirecting = true;
          console.warn("[Auth] Redirect ke login");
          try { localStorage.removeItem("clipora_token"); } catch (e) {}
          try { localStorage.removeItem("token"); } catch (e) {}
          try { sessionStorage.clear(); } catch (e) {}
          try {
            if (typeof window.toastError === "function") {
              window.toastError("ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬â„¢ Sesi berakhir. Silakan login ulang...");
            }
          } catch (e) {}
          setTimeout(function() {
            window.location.href = "login.php?expired=1";
          }, 1500);
        }
      }
    }

    return response;
  };

  console.log("ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂºÃ‚Â¡ÃƒÂ¯Ã‚Â¸Ã‚Â [Auth] Global 401 interceptor installed");
})();

// ============================================
// HAMBURGER MENU
// ============================================
const hamburgerBtn = document.getElementById("hamburgerBtn");
const navMenu = document.getElementById("navMenu");

if (hamburgerBtn && navMenu) {
  hamburgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navMenu.classList.toggle("active");
  });
  document.addEventListener("click", (e) => {
    if (!navMenu.contains(e.target) && e.target !== hamburgerBtn) {
      navMenu.classList.remove("active");
    }
  });
}

// ============================================
// USER DROPDOWN
// ============================================
const userTrigger = document.getElementById("userTrigger");
const dropdownMenu = document.getElementById("dropdownMenu");

if (userTrigger && dropdownMenu) {
  userTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle("active");
  });
  document.addEventListener("click", (e) => {
    if (!dropdownMenu.contains(e.target) && !userTrigger.contains(e.target)) {
      dropdownMenu.classList.remove("active");
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") dropdownMenu.classList.remove("active");
  });
}

// ============================================
// DOM ELEMENTS
// ============================================
const uploadArea = document.getElementById("uploadArea");
const videoInput = document.getElementById("videoInput");
const videoPreview = document.getElementById("videoPreview");
const videoPlayer = document.getElementById("videoPlayer");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const controlPanel = document.getElementById("controlPanel");
const rapikanBtn = document.getElementById("rapikanBtn");
const rapikanBtnText = document.getElementById("rapikanBtnText");
const quotaExhaustedNotice = document.getElementById("quotaExhaustedNotice");
const progressContainer = document.getElementById("progressContainer");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const progressDetail = document.getElementById("progressDetail");
const resultBox = document.getElementById("resultBox");
const resultTitle = document.getElementById("resultTitle");
const durationInfo = document.getElementById("durationInfo");
const statsGrid = document.getElementById("statsGrid");
const serverStatus = document.getElementById("serverStatus");
const chaptersContainer = document.getElementById("chaptersContainer");
const chaptersList = document.getElementById("chaptersList");

const modal = document.getElementById("downloadModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const closeModalFooterBtn = document.getElementById("closeModalFooterBtn");
const openModalBtn = document.getElementById("openDownloadModalBtn");

let currentVideoFile = null;
let currentJobId = null;
let currentProgressFilename = null;
let currentVideoBlobUrl = null; // ÃƒÂ¢Ã‚Â­Ã‚Â V8.9.3: reuse blob URL
// V8.8.2: Expose socket ke window supaya modul lain (autoclip.js) bisa listen
window.socket = null;
let socket = null;
let pollInterval = null;
let pollingStartTime = 0;
let currentQuotaRemaining = null;

const IS_ADMIN_JS = typeof IS_ADMIN !== "undefined" && IS_ADMIN;

// ============================================
// PLAN LIMITS
// ============================================
const PLAN_LIMITS = {
  guest: {
    seconds: 60,
    label: "1 menit",
    cta: "register.php",
    ctaText: "Daftar GRATIS",
  },
  free: {
    seconds: 120,
    label: "2 menit",
    cta: "harga.php",
    ctaText: "Upgrade ke Pro",
  },
  pro: {
    seconds: 900,
    label: "15 menit",
    cta: "harga.php",
    ctaText: "Upgrade ke Business",
  },
  business: {
    seconds: 3600,
    label: "60 menit",
    cta: "harga.php",
    ctaText: "Hubungi Admin",
  },
};

// ============================================
// TABS
// ============================================
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabName = btn.dataset.tab;
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    const targetTab = document.getElementById("tab-" + tabName);
    if (targetTab) targetTab.classList.add("active");
  });
});

// ============================================
// SERVER STATUS
// ============================================
let serverStatusChecking = false;
let serverStatusLastCheck = 0;

async function checkServerStatus(force = false) {
  if (serverStatusChecking) return;
  if (!serverStatus) return;
  const now = Date.now();
  if (!force && now - serverStatusLastCheck < 3000) return;
  serverStatusChecking = true;
  serverStatusLastCheck = now;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);

  try {
    const response = await fetch(API_URL + "/health", {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      serverStatus.className = "server-status online";
      serverStatus.innerHTML = '<i class="fas fa-circle"></i> Server Online';
    } else throw new Error("Not OK");
  } catch (error) {
    clearTimeout(timeoutId);
    serverStatus.className = "server-status offline";
    serverStatus.innerHTML = '<i class="fas fa-circle"></i> Server Offline';
  } finally {
    serverStatusChecking = false;
  }
}

checkServerStatus(true);
// V8.8.0: Health check 60s (kurangi spam; dashboard tetap responsif via WebSocket)
setInterval(() => checkServerStatus(true), 60000);

// ============================================
// QUOTA LOADER
// ============================================
async function loadQuota() {
  if (IS_ADMIN_JS) {
    console.log("ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ¢â‚¬Ëœ [Admin] Skip quota check");
    updateRapikanButton(999);
    return;
  }

  if (typeof IS_LOGGED_IN === "undefined" || !IS_LOGGED_IN || !AUTH_TOKEN)
    return;

  try {
    const r = await fetch(`${API_URL}/user/quota`, {
      cache: "no-store",
      headers: { Authorization: "Bearer " + AUTH_TOKEN },
    });
    if (!r.ok) return;

    const data = await r.json();
    if (!data.success) return;

    const quota = data.quota || {};
    const remaining =
      quota.remaining !== undefined
        ? quota.remaining
        : quota.total - quota.used;
    const total = quota.total || 2;  // V9.133.0: FALLBACK QUOTA

    currentQuotaRemaining = remaining;

    const widget = document.getElementById("quotaWidget");
    const text = document.getElementById("quotaText");
    const fill = document.getElementById("quotaFill");
    if (widget && text && fill) {
      widget.style.display = "flex";
      text.textContent = `Kuota: ${remaining}/${total}`;
      const pct = total > 0 ? (remaining / total) * 100 : 0;
      fill.style.width = pct + "%";
      fill.style.background =
        remaining === 0 ? "#ef4444" : remaining <= 1 ? "#f59e0b" : "#06b6d4";
    }

    const quotaBadge = document.getElementById("quotaBadge");
    if (quotaBadge) {
      quotaBadge.textContent = `${remaining}/${total} tersisa`;
      quotaBadge.style.background =
        remaining === 0 ? "rgba(239,68,68,0.15)" : "";
      quotaBadge.style.color = remaining === 0 ? "#ef4444" : "";
      quotaBadge.style.borderColor =
        remaining === 0 ? "rgba(239,68,68,0.3)" : "";
    }

    const quotaDesc = document.getElementById("quotaDesc");
    if (quotaDesc) {
      if (remaining === 0) {
        quotaDesc.innerHTML =
          'ÃƒÂ°Ã…Â¸Ã‹Å“Ã¢â‚¬Â <strong style="color:#ef4444;">Kuota harian habis!</strong> Reset besok atau <a href="harga.php" style="color:var(--primary);font-weight:600;">upgrade</a>.';
      } else if (remaining === 1) {
        quotaDesc.innerHTML = "ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â Sisa <strong>1 video</strong> hari ini.";
      } else {
        quotaDesc.innerHTML = `Anda punya <strong>${remaining} video</strong> tersisa hari ini.`;
      }
    }

    updateRapikanButton(remaining);
  } catch (e) {
    console.warn("Quota load error", e);
  }
}

function updateRapikanButton(remaining) {
  const btn = document.getElementById("rapikanBtn");
  const btnText = document.getElementById("rapikanBtnText");
  const notice = document.getElementById("quotaExhaustedNotice");
  if (!btn) return;

  if (IS_ADMIN_JS) {
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
    btn.style.background = "";
    btn.style.boxShadow = "";
    if (btnText) btnText.textContent = "Rapikan Video Sekarang";
    if (notice) notice.style.display = "none";
    return;
  }

  if (remaining <= 0) {
    btn.disabled = true;
    btn.style.opacity = "0.5";
    btn.style.cursor = "not-allowed";
    btn.style.background = "linear-gradient(135deg, #64748b, #475569)";
    btn.style.boxShadow = "none";
    if (btnText) btnText.textContent = "Kuota Habis ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Upgrade untuk Lanjut";
    if (notice) notice.style.display = "block";
  } else {
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
    btn.style.background = "";
    btn.style.boxShadow = "";
    if (btnText) btnText.textContent = "Rapikan Video Sekarang";
    if (notice) notice.style.display = "none";
  }
}

if (typeof IS_LOGGED_IN !== "undefined" && IS_LOGGED_IN) {
  loadQuota();
  setInterval(loadQuota, 30000);
}

// ============================================
// WEBSOCKET
// ============================================
function initSocket() {
  if (typeof io === "undefined") {
    console.warn("Socket.IO tidak tersedia");
    return;
  }
  const socketUrl =
    typeof BASE_URL !== "undefined" && BASE_URL
      ? BASE_URL
      : API_URL.replace("/api", "");
  socket = io(socketUrl);
  window.socket = socket; // ÃƒÂ¢Ã‚Â­Ã‚Â expose ke global

  socket.on("connect", () => {
    console.log("ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ…â€™ WebSocket connected");
    // V9.3.0: kirim TOKEN (bukan userId) ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â server yang verify
    if (typeof IS_LOGGED_IN !== "undefined" && IS_LOGGED_IN && AUTH_TOKEN) {
      socket.emit("auth", AUTH_TOKEN);
    }
  });

  socket.on("auth:failed", (data) => {
    console.warn("ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬â„¢ WebSocket auth gagal:", data);
  });

  socket.on("job:update", (data) => {
    if (data.jobId !== currentJobId) return;
    updateProgressUI(data.progress, data.message);
  });

  socket.on("job:completed", (data) => {
    if (data.jobId !== currentJobId) return;
    if (pollInterval) clearInterval(pollInterval);
    onJobCompleted(data.result);
  });

  socket.on("job:failed", (data) => {
    if (data.jobId !== currentJobId) return;
    if (pollInterval) clearInterval(pollInterval);
    onJobFailed(data.error);
  });

  socket.on("disconnect", () => {
    console.warn("ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â WebSocket disconnected");
    window.socket = null; // ÃƒÂ¢Ã‚Â­Ã‚Â reset
    if (currentJobId) startPolling(currentJobId);
  });
}
initSocket();

// ============================================
// PROGRESS UI
// ============================================
function updateProgressUI(percent, message) {
  if (!progressFill || !progressText) return;
  progressFill.style.width = percent + "%";
  progressFill.textContent = Math.round(percent) + "%";
  if (message) progressText.textContent = message;
}

function startPolling(jobId) {
  if (pollInterval) clearInterval(pollInterval);

  if (socket && socket.connected) {
    console.log("ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ WebSocket active, skip polling");
    return;
  }

  pollingStartTime = Date.now();
  console.log("ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â  Starting polling for job:", jobId);

  let lastProgress = 0;
  let progressStuckCount = 0;

  pollInterval = setInterval(async () => {
    if (Date.now() - pollingStartTime > 30 * 60 * 1000) {
      clearInterval(pollInterval);
      console.warn("ÃƒÂ¢Ã‚ÂÃ‚Â±ÃƒÂ¯Ã‚Â¸Ã‚Â Polling timeout");
      if (typeof toastError === "function") {
        toastError(
          "Proses memakan waktu terlalu lama. Cek dashboard untuk status.",
        );
      }
      return;
    }

    try {
      const r = await fetch(`${API_URL}/job/${jobId}`, { cache: "no-store" });
      if (r.status === 429) return;
      if (!r.ok) return;

      const data = await r.json();
      if (!data.success) return;

      const job = data.job;
      const queueStats = job.queueStats || data.queueStats || {};

      if (job.status === "pending") {
        const pendingCount = queueStats.pending || 0;
        const processingCount = queueStats.processing || 0;
        const position = pendingCount + 1;

        // V8.6.9: Estimasi dinamis dari durasi video
        const videoDuration = currentAnalysisData?.duration || 60;
        const estSecondsPerVideo = Math.max(30, videoDuration * 2.5);
        const waitSeconds =
          (position - 1 + processingCount) * estSecondsPerVideo;

        let waitText;
        if (waitSeconds < 60) {
          waitText = `~${Math.round(waitSeconds)} detik`;
        } else if (waitSeconds < 3600) {
          waitText = `~${Math.round(waitSeconds / 60)} menit`;
        } else {
          waitText = `~${(waitSeconds / 3600).toFixed(1)} jam`;
        }

        let message = `ÃƒÂ¢Ã‚ÂÃ‚Â³ Menunggu antrian (posisi #${position})`;
        if (processingCount > 0)
          message += ` ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${processingCount} video sedang diproses`;
        message += ` ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Estimasi tunggu ${waitText}`;

        updateProgressUI(2, message);

        if (progressDetail) {
          if (position === 1 && processingCount === 0) {
            progressDetail.textContent = "ÃƒÂ¢Ã‚ÂÃ‚Â³ Sebentar lagi giliran Anda...";
          } else {
            progressDetail.textContent = `ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Â¹ Ada ${position - 1} video di depan Anda. Total antrian: ${position}`;
          }
        }
        return;
      }

      if (job.status === "processing") {
        const prog = job.progress || 0;
        const msg = job.message || "Memproses video...";

        if (prog === lastProgress && prog > 0 && prog < 100) {
          progressStuckCount++;
        } else {
          progressStuckCount = 0;
        }
        lastProgress = prog;

        updateProgressUI(prog, msg);

        if (progressDetail && prog > 0 && prog < 100) {
          const elapsedSec = (Date.now() - pollingStartTime) / 1000;
          const totalEstSec = (elapsedSec / prog) * 100;
          const remainingSec = Math.max(0, totalEstSec - elapsedSec);

          if (remainingSec > 60) {
            const mins = Math.floor(remainingSec / 60);
            progressDetail.textContent = `ÃƒÂ¢Ã‚ÂÃ‚Â±ÃƒÂ¯Ã‚Â¸Ã‚Â Estimasi sisa waktu: ~${mins} menit`;
          } else if (remainingSec > 0) {
            const secs = Math.round(remainingSec);
            progressDetail.textContent = `ÃƒÂ¢Ã‚ÂÃ‚Â±ÃƒÂ¯Ã‚Â¸Ã‚Â Estimasi sisa waktu: ~${secs} detik`;
          }

          if (progressStuckCount >= 20) {
            progressDetail.textContent +=
              " ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â Proses lebih lama dari biasanya";
          }
        }
        return;
      }

      if (job.status === "completed") {
        clearInterval(pollInterval);
        onJobCompleted(job.result);
      } else if (job.status === "failed") {
        clearInterval(pollInterval);
        onJobFailed(job.error);
      }
    } catch (e) {
      console.warn("Polling error:", e);
    }
  }, 3000);
}

// ============================================
// UPLOAD
// ============================================
if (uploadArea) {
  uploadArea.addEventListener("click", () => videoInput.click());
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });
  uploadArea.addEventListener("dragleave", () =>
    uploadArea.classList.remove("dragover"),
  );
  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) handleVideoFile(file);
    else if (typeof toastError === "function")
      toastError("ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â File video tidak valid!");
  });
}
if (videoInput) {
  videoInput.addEventListener("change", (e) => {
    if (e.target.files[0]) handleVideoFile(e.target.files[0]);
  });
}

function getCurrentPlan() {
    // V9.612.0: Admin SELALU return 'admin' (bypass semua limit)
    if (typeof IS_ADMIN_JS !== "undefined" && IS_ADMIN_JS) {
      return "admin";
    }
    const isLoggedIn = typeof IS_LOGGED_IN !== "undefined" && IS_LOGGED_IN;
    if (!isLoggedIn) return "guest";
    return (
      (typeof USER_PLAN !== "undefined" ? USER_PLAN : "free") || "free"
    ).toLowerCase();
  }

function getPlanLimit(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.guest;
}

// ============================================
// HANDLE VIDEO FILE
// ============================================
function handleVideoFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    if (typeof toastError === "function")
      toastError("ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â Ukuran video terlalu besar! Maksimal 500MB.");
    return;
  }

  if (
    !IS_ADMIN_JS &&
    typeof IS_LOGGED_IN !== "undefined" &&
    IS_LOGGED_IN &&
    currentQuotaRemaining !== null
  ) {
    if (currentQuotaRemaining <= 0) {
      if (typeof toastError === "function")
        toastError("ÃƒÂ°Ã…Â¸Ã…Â¡Ã‚Â« Kuota harian habis. Upgrade atau tunggu besok.");
      return;
    }
  }

  // V8.9.3: probe terpisah, jangan campur dengan player
  const probeVideo = document.createElement("video");
  probeVideo.preload = "metadata";
  const probeUrl = URL.createObjectURL(file);

  probeVideo.onloadedmetadata = function () {
    try {
      URL.revokeObjectURL(probeUrl);
    } catch (e) {}

    const duration = probeVideo.duration;
    const plan = getCurrentPlan();
    const limit = getPlanLimit(plan);
    const maxDuration = limit.seconds;

    // V9.1.0: Bypass validasi durasi untuk sample video (demo)
    const isSample = window.__IS_SAMPLE__ === true;

    if (!isSample && !IS_ADMIN_JS && duration > maxDuration) {
      const durasiMax = limit.label;
      if (typeof toastError === "function") {
        toastError(
          "Video terlalu panjang (" +
            Math.floor(duration / 60) +
            " menit). Maksimal " +
            durasiMax +
            ".",
        );
      }
      setTimeout(async () => {
        const okConfirm = await window.showConfirm({
          title: "ÃƒÂ¢Ã‚Â¬Ã¢â‚¬Â ÃƒÂ¯Ã‚Â¸Ã‚Â Upgrade Diperlukan",
          message: `Video terlalu panjang (${Math.floor(duration / 60)} menit).\nBatas maksimal ${durasiMax}.\n\nBuka halaman ${plan === "guest" ? "daftar" : "harga"} untuk upgrade?`,
          type: "warning",
          okText: "Ya, Upgrade",
          cancelText: "Nanti Saja",
        });
        if (okConfirm) {
          window.location.href = limit.cta;
        }
      }, 500);
      return;
    }

    if (IS_ADMIN_JS) {
      console.log(`ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ¢â‚¬Ëœ [Admin] Video ${duration.toFixed(1)}s ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â tidak dibatasi`);
    }

    // V8.9.3: revoke blob URL lama, buat yang baru SATU kali
    if (currentVideoBlobUrl) {
      try {
        URL.revokeObjectURL(currentVideoBlobUrl);
      } catch (e) {}
    }
    currentVideoBlobUrl = URL.createObjectURL(file);

    currentVideoFile = file;
    videoPlayer.src = currentVideoBlobUrl;

    fileName.textContent = file.name;
    const durasiText =
      Math.floor(duration / 60) + "m " + Math.round(duration % 60) + "s";
    fileSize.textContent =
      (file.size / (1024 * 1024)).toFixed(1) + " MB ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ " + durasiText;

        // V10.0.5: Guard semua akses DOM (bisa null kalau elemen belum ada)
    if (videoPreview) {
      videoPreview.style.setProperty("display", "block", "important");
      videoPreview.classList.add("show");
    } else {
      console.warn('[handleVideoFile] videoPreview tidak ada');
    }
    
    if (controlPanel) {
      controlPanel.style.setProperty("display", "block", "important");
    } else {
      console.warn('[handleVideoFile] controlPanel tidak ada');
    }
    
    if (uploadArea) {
      uploadArea.style.setProperty("display", "none", "important");
    }
    
    if (resultBox) {
      resultBox.style.display = "none";
    }
    
    if (progressContainer) {
      progressContainer.style.display = "none";
    }
    
    if (typeof editorContainer !== "undefined" && editorContainer) {
      editorContainer.style.display = "none";
    }
    if (typeof editorContainer !== "undefined" && editorContainer)
      editorContainer.style.display = "none";

    if (
      IS_ADMIN_JS ||
      (currentQuotaRemaining !== null && currentQuotaRemaining > 0)
    ) {
      updateRapikanButton(currentQuotaRemaining || 3);
    } else {
      updateRapikanButton(0);
    }

    if (typeof toastSuccess === "function") {
      toastSuccess("ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Video siap diproses (" + durasiText + ")");
    }

    // V9.1.0: Reset flag sample setelah dipakai
    window.__IS_SAMPLE__ = false;

    // V9.1.0: Auto-mark onboarding step
    if (typeof IS_LOGGED_IN !== "undefined" && IS_LOGGED_IN && !IS_ADMIN_JS) {
      try {
        fetch(`${API_URL}/user/onboarding/step`, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + AUTH_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ step: "first_upload_done" }),
        }).catch(() => {});
      } catch (e) {}
    }
  };

  probeVideo.onerror = function () {
    try {
      URL.revokeObjectURL(probeUrl);
    } catch (e) {}
    if (typeof toastError === "function")
      toastError("Gagal membaca video. Coba file lain.");
  };

  probeVideo.src = probeUrl;
}

function formatDuration(seconds) {
  if (seconds < 60) return seconds.toFixed(1) + "s";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return mins + "m " + secs + "s";
}

// ============================================
// V8.6.5: EDITOR STATE
// ============================================
let currentAnalysisId = null;
let currentAnalysisData = null;
// V2.0.0: Expose ke window supaya auto-sync-state.js bisa akses
window.currentAnalysisData = null;
window.currentAnalysisId = null;
let currentProjectId = null; // V1.0.0: track proyek yang sedang dibuka
let originalAnalysisData = null;
let editHistory = [];
let selectedSegmentIdx = -1;
let activeCategoryFilters = {};
let tooltipEl = null;

// Preview Mode
let previewMode = false;
let _skipInProgress = false;

// V8.6.5: Quick Mode state ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â DEFAULT AGGRESSIVE
let currentQuickMode = "aggressive";

// Zoom state
let zoomLevel = 1;
const ZOOM_MIN = 1;
const ZOOM_MAX = 10;
const ZOOM_STEP = 0.25;

// V8.6.3: Advanced Mode state
let advancedMode = false;

const editorContainer = document.getElementById("editorContainer");
const teTimeline = document.getElementById("teTimeline");
const teTrack = document.getElementById("teTrack");
const teFilmstrip = document.getElementById("teFilmstrip");
const tePlayhead = document.getElementById("tePlayhead");
const teTimeRuler = document.getElementById("teTimeRuler");
const teSegmentInfo = document.getElementById("teSegmentInfo");
const editorVideo = document.getElementById("editorVideo");
const editorStats = document.getElementById("editorStats");
const teChipsContainer = document.getElementById("teChipsContainer");
const tePreviewBadge = document.getElementById("tePreviewBadge");

const SOURCE_META = {
  silence: { icon: "ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Â¡", label: "Jeda Diam", color: "#3b82f6" },
  filler: { icon: "ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¬", label: "Kata Pengisi", color: "#f59e0b" },
  stutter: { icon: "ÃƒÂ°Ã…Â¸Ã¢â‚¬â€Ã‚Â£ÃƒÂ¯Ã‚Â¸Ã‚Â", label: "Gagap", color: "#ef4444" },
  false_start: { icon: "ÃƒÂ¢Ã‚ÂÃ‚Â¸ÃƒÂ¯Ã‚Â¸Ã‚Â", label: "Salah Mulai", color: "#a855f7" },
  repetition: { icon: "ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â", label: "Frasa Ulang", color: "#06b6d4" },
  semantic: { icon: "ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¡", label: "Makna Sama", color: "#8b5cf6" },
  duplicate: { icon: "ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Â¹", label: "Duplikat", color: "#22c55e" },
  noise: { icon: "ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ…Â ", label: "Noise", color: "#ec4899" },
  manual: { icon: "ÃƒÂ¢Ã…â€œÃ¢â‚¬Å¡ÃƒÂ¯Ã‚Â¸Ã‚Â", label: "Manual", color: "#94a3b8" },
  unknown: { icon: "ÃƒÂ¢Ã…â€œÃ¢â‚¬Å¡ÃƒÂ¯Ã‚Â¸Ã‚Â", label: "Potong", color: "#94a3b8" },
};

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

function formatSec(sec) {
  const m = Math.floor(sec / 60);
  const s = (sec % 60).toFixed(2);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatMMSS(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ============================================
// V8.6.3: ADVANCED MODE TOGGLE
// ============================================
function setAdvancedMode(isAdvanced) {
  const wrap = document.getElementById("timelineEditorWrap");
  if (!wrap) return;

  advancedMode = isAdvanced;
  wrap.classList.toggle("advanced-on", isAdvanced);

  const txt = document.getElementById("teAdvToggleText");
  if (txt) txt.textContent = isAdvanced ? "Mode Sederhana" : "Mode Lanjutan";

  try {
    localStorage.setItem("clipora_advanced_mode", isAdvanced ? "1" : "0");
  } catch (e) {}

  console.log(`ÃƒÂ¢Ã…Â¡Ã¢â€žÂ¢ÃƒÂ¯Ã‚Â¸Ã‚Â [AdvancedMode] ${isAdvanced ? "ON" : "OFF"}`);
}

function loadAdvancedPreference() {
  try {
    return localStorage.getItem("clipora_advanced_mode") === "1";
  } catch (e) {
    return false;
  }
}

// ============================================
// V8.6.2: ZOOM TIMELINE
// ============================================
function setZoom(level) {
  zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, level));

  const wrap = document.getElementById("teTimelineZoomWrap");
  if (wrap) {
    wrap.style.width = zoomLevel * 100 + "%";
  }

  const label = document.getElementById("teZoomLabel");
  if (label) label.textContent = Math.round(zoomLevel * 100) + "%";

  const slider = document.getElementById("teZoomSlider");
  if (slider && Math.abs(parseFloat(slider.value) - zoomLevel) > 0.01) {
    slider.value = zoomLevel;
  }

  const outBtn = document.getElementById("teZoomOut");
  const inBtn = document.getElementById("teZoomIn");
  if (outBtn) outBtn.disabled = zoomLevel <= ZOOM_MIN;
  if (inBtn) inBtn.disabled = zoomLevel >= ZOOM_MAX;

  console.log(`ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â [Zoom] ${Math.round(zoomLevel * 100)}%`);
}

function zoomIn() {
  setZoom(zoomLevel + ZOOM_STEP);
}
function zoomOut() {
  setZoom(zoomLevel - ZOOM_STEP);
}
function resetZoom() {
  setZoom(1);
}

// ============================================
// V8.6.5: QUICK MODE ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Default AGGRESSIVE + Smart Balanced
// ============================================
function applyQuickMode(mode, options = {}) {
  if (!currentAnalysisData) return;

  const silent = options.silent === true;

  if (!silent) pushHistory();

  // V8.6.5: Balanced jadi SMART ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â hanya potong silence panjang (>1.5s)
  const rules = {
    aggressive: {
      enableAll: true,
      disable: [],
    },
    balanced: {
      enableAll: true,
      disable: ["semantic"],
      smartSilence: true, // filter silence by duration
      silenceMinDuration: 1.5, // hanya potong jeda > 1.5 detik
    },
    gentle: {
      enableAll: false,
      enable: ["repetition", "stutter", "false_start"],
    },
  };

  const rule = rules[mode] || rules.aggressive;

  let enabledCount = 0;
  let disabledCount = 0;

  currentAnalysisData.segments.forEach((s) => {
    const cat = (s.source || "unknown").toLowerCase();
    const segDuration = s.end - s.start;

    if (rule.enableAll) {
      s.enabled = !rule.disable.includes(cat);

      // V8.6.5: Balanced smart ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â silence hanya dipotong kalau panjang
      if (rule.smartSilence && cat === "silence") {
        s.enabled = segDuration >= (rule.silenceMinDuration || 1.5);
      }
    } else {
      s.enabled = rule.enable.includes(cat);
    }

    if (s.enabled) enabledCount++;
    else disabledCount++;
  });

  document.querySelectorAll(".te-qm-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  currentQuickMode = mode;

  updateStats();
  renderFilterChips();
  renderTimeline();
  renderSegmentInfo();

  const modeNames = {
    aggressive: "ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¯ Hemat",
    balanced: "ÃƒÂ¢Ã…Â¡Ã¢â‚¬â€œÃƒÂ¯Ã‚Â¸Ã‚Â Seimbang",
    gentle: "ÃƒÂ¢Ã…â€œÃ‚Â¨ Halus",
  };

  console.log(
    `ÃƒÂ¢Ã…Â¡Ã‚Â¡ [QuickMode] ${mode} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${enabledCount} enabled, ${disabledCount} disabled`,
  );

  if (!silent && typeof toastSuccess === "function") {
    const modeDesc = {
      aggressive: "Potong maksimal ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â video paling padat",
      balanced: "Potong jeda panjang ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â hasil natural",
      gentle: "Potong sedikit ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â hati-hati",
    };
    toastSuccess(`${modeNames[mode]} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${modeDesc[mode]}`);
  }
}

// ============================================
// BIG PLAY BUTTON HELPERS
// ============================================
function updateBigPlayButton(isPlaying) {
  const btn = document.getElementById("tePlayPreviewBig");
  const icon = document.getElementById("tePpbIcon");
  const title = document.getElementById("tePpbTitle");
  const subtitle = document.getElementById("tePpbSubtitle");
  const liveBadge = document.getElementById("tePreviewLiveBadge");

  if (!btn) return;

  if (isPlaying) {
    btn.classList.add("playing");
    if (icon) icon.className = "fas fa-stop";
    if (title) title.textContent = "Hentikan Preview";
    if (subtitle)
      subtitle.textContent =
        "Sedang memutar... bagian yang dipotong di-skip otomatis";
    if (liveBadge) liveBadge.style.display = "inline-flex";
  } else {
    btn.classList.remove("playing");
    if (icon) icon.className = "fas fa-play";
    if (title) title.textContent = "Putar Preview Hasil";
    if (subtitle)
      subtitle.textContent =
        "Dengar & lihat hasil potongan sebelum render final";
    if (liveBadge) liveBadge.style.display = "none";
  }
}

// ============================================
// FIND CUT SEGMENT AT TIME
// ============================================
function findEnabledCutAt(time) {
  if (!currentAnalysisData) return null;
  for (const seg of currentAnalysisData.segments) {
    if (seg.enabled !== false && time >= seg.start && time < seg.end) {
      return seg;
    }
  }
  return null;
}

// ============================================
// PREVIEW MODE TOGGLE
// ============================================
function setPlaybackMode(mode) {
  previewMode = mode === "preview";

  const btnNormal = document.getElementById("teModeNormal");
  const btnPreview = document.getElementById("teModePreview");

  if (btnNormal && btnPreview) {
    btnNormal.classList.toggle("active", !previewMode);
    btnPreview.classList.toggle("preview-active", previewMode);
    btnPreview.classList.toggle("active", previewMode);
  }

  if (teTimeline) {
    teTimeline.classList.toggle("preview-mode", previewMode);
  }

  if (tePreviewBadge) {
    tePreviewBadge.style.display = previewMode ? "inline-flex" : "none";
  }

  console.log(
    `ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¬ [Playback Mode] ${previewMode ? "PREVIEW HASIL (skip cuts)" : "NORMAL (full video)"}`,
  );

  if (previewMode && editorVideo && !editorVideo.paused) {
    const cut = findEnabledCutAt(editorVideo.currentTime);
    if (cut) {
      editorVideo.currentTime = cut.end;
    }
  }

  if (typeof toastSuccess === "function") {
    toastSuccess(
      previewMode
        ? "ÃƒÂ¢Ã…Â¡Ã‚Â¡ Preview Hasil ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â video akan skip bagian yang dipotong"
        : "ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¬ Putar Normal ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â video utuh",
    );
  }
}

// ============================================
// ANALYZE
// ============================================
async function analyzeVideo(formData) {
  resultBox.style.display = "none";
  progressContainer.style.display = "block";
  updateProgressUI(0, "ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¤ Mengupload video...");

  if (progressDetail) progressDetail.textContent = "Menyiapkan file...";

  const headers = {};
  if (typeof AUTH_TOKEN !== "undefined" && AUTH_TOKEN) {
    headers["Authorization"] = "Bearer " + AUTH_TOKEN;
  }

  // V8.9.21: Inject tombol cancel upload (kalau belum ada)
  let cancelBtn = document.getElementById("uploadCancelBtn");
  if (!cancelBtn && progressContainer) {
    cancelBtn = document.createElement("button");
    cancelBtn.id = "uploadCancelBtn";
    cancelBtn.innerHTML = '<i class="fas fa-times" style="font-size:0.9em;"></i><span style="margin-left:2px;">Batalkan Upload</span>';
    cancelBtn.style.cssText =
      "display:none;align-items:center;justify-content:center;gap:6px;margin:16px auto 0;padding:8px 16px;border-radius:10px;width:auto;max-width:220px;box-shadow:0 1px 2px rgba(0,0,0,0.15);" +
      "border:1px solid rgba(239,68,68,0.28);background:linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.04));" +
      "color:#f87171;cursor:pointer;font-weight:600;font-size:0.8rem;letter-spacing:0.2px;" +
      "font-family:inherit;transition:all 0.2s ease;";
    cancelBtn.onmouseover = () => {
      cancelBtn.style.background = "rgba(239,68,68,0.2)";
      cancelBtn.style.borderColor = "#ef4444";
    };
    cancelBtn.onmouseout = () => {
      cancelBtn.style.background = "rgba(239,68,68,0.1)";
      cancelBtn.style.borderColor = "rgba(239,68,68,0.4)";
    };
    progressContainer.appendChild(cancelBtn);
  }

  // State upload
  let aborted = false;
  const abortRef = {};

  if (cancelBtn) {
    cancelBtn.style.display = "inline-flex";
    cancelBtn.disabled = false;
    cancelBtn.onclick = async () => {
      const okConfirm = await window.showConfirm({
        title: "ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂºÃ¢â‚¬Ëœ Batalkan Upload?",
        message: "Proses upload akan dihentikan dan file dihapus.",
        type: "danger",
        okText: "Ya, Batalkan",
        cancelText: "Lanjut Upload",
      });
      if (okConfirm) {
        aborted = true;
        if (abortRef.xhr) {
          try {
            abortRef.xhr.abort();
          } catch (e) {}
        }
      }
    };
  }

  const hideCancelBtn = () => {
    if (cancelBtn) cancelBtn.style.display = "none";
  };

  // Cek browser support
  if (typeof window.uploadWithProgress !== "function") {
    console.warn("ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â uploadWithProgress tidak tersedia ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â fallback ke fetch");
    hideCancelBtn();
    return analyzeVideoFallback(formData, headers);
  }

  try {
    // ÃƒÂ¢Ã‚Â­Ã‚Â V8.9.21: Upload dengan progress tracking
    const response = await window.uploadWithProgress(
      `${API_URL}/analyze`,
      formData,
      {
        headers,
        abortRef,
        onProgress: (p) => {
          updateProgressUI(p.percent, `ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¤ Upload: ${p.percent}%`);
          if (progressDetail) {
            progressDetail.textContent = `${p.loadedMB} MB / ${p.totalMB} MB ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ${p.percent}%`;
          }
        },
        onUploadComplete: () => {
          // V8.9.22: Konfirmasi visual bahwa upload benar-benar selesai
          updateProgressUI(100, "ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Upload selesai!");

          // Toast konfirmasi
          if (typeof toastSuccess === "function") {
            toastSuccess(
              "ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Video berhasil di-upload, server sedang menganalisis...",
            );
          }
          // V9.1.0: Auto-mark onboarding render step
          if (
            typeof IS_LOGGED_IN !== "undefined" &&
            IS_LOGGED_IN &&
            !IS_ADMIN_JS &&
            typeof AUTH_TOKEN !== "undefined" &&
            AUTH_TOKEN
          ) {
            fetch(`${API_URL}/user/onboarding/step`, {
              method: "POST",
              headers: {
                Authorization: "Bearer " + AUTH_TOKEN,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ step: "first_render_done" }),
            }).catch(() => {});
          }
          // Delay 600ms biar user lihat "100%" dulu
          setTimeout(() => {
            updateProgressUI(5, "ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â Server menganalisis video...");
            if (progressDetail) {
              progressDetail.textContent =
                "Mendeteksi jeda, filler, frasa berulang, dll.";
            }
          }, 600);

          hideCancelBtn();
        },
      },
    );

    hideCancelBtn();
    const data = response.data;

    // ============ Error handling ============
    if (!data.success) {
      if (data.code === "QUOTA_EXCEEDED") {
        if (typeof toastError === "function")
          toastError("ÃƒÂ°Ã…Â¸Ã…Â¡Ã‚Â« Kuota harian habis.");
        progressContainer.style.display = "none";
        if (typeof loadQuota === "function") loadQuota();
        return;
      }
      if (data.code === "GUEST_QUOTA_EXCEEDED") {
        if (typeof toastError === "function")
          toastError("Kuota gratis habis. Daftar untuk lanjut.");
        progressContainer.style.display = "none";
        rapikanBtn.disabled = false;
        return;
      }
      if (data.code === "DURATION_EXCEEDED") {
        if (typeof toastError === "function")
          toastError(data.error || "Video terlalu panjang.");
        progressContainer.style.display = "none";
        rapikanBtn.disabled = false;
        return;
      }
      if (data.code === "RATE_LIMITED") {
        if (typeof toastError === "function")
          toastError(data.error || "Terlalu banyak request. Tunggu 15 menit.");
        progressContainer.style.display = "none";
        rapikanBtn.disabled = false;
        return;
      }
      throw new Error(data.error || "Analyze gagal");
    }

    // ============ Success ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â setup editor state ============
    currentAnalysisId = data.analysisId;
    currentAnalysisData = JSON.parse(JSON.stringify(data));
    originalAnalysisData = JSON.parse(JSON.stringify(data));
    editHistory = [];
    selectedSegmentIdx = -1;
    previewMode = false;
    _skipInProgress = false;
    currentQuickMode = "aggressive";
    zoomLevel = 1;
    _filmstripCacheKey = null;

    activeCategoryFilters = {};
    const uniqueCats = new Set(
      data.segments.map((s) => (s.source || "unknown").toLowerCase()),
    );
    uniqueCats.forEach((c) => {
      activeCategoryFilters[c] = true;
    });

    console.log(`ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â [Analyze] ${data.segments.length} segmen terdeteksi`);

              progressContainer.style.display = "none";
    // V3.0.0: INSTAN redirect ke render.php SEBELUM renderEditor
    if (currentAnalysisId) {
      console.log('[Redirect] ÃƒÂ¢Ã…Â¡Ã‚Â¡ INSTAN: render.php?project=' + currentAnalysisId);
      try { localStorage.setItem('clipora_last_analysis_id', currentAnalysisId); } catch(e) {}
      window.location.replace('render.php?project=' + encodeURIComponent(currentAnalysisId));
      return;
    }
    
    // Fallback: kalau tidak ada currentAnalysisId
    renderEditor(data);

    // V1.10.0: Auto-render setelah analisis selesai
    setTimeout(function() {
      if (typeof renderFinalVideo === "function") {
        console.log("[AutoRender] Memulai render otomatis...");
        renderFinalVideo();
      }
    }, 2000);
  } catch (err) {
    hideCancelBtn();

    // Kalau di-abort user ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ pesan friendly
    if (err.aborted || aborted) {
      console.log("ÃƒÂ¢Ã‚ÂÃ‚Â¸ÃƒÂ¯Ã‚Â¸Ã‚Â [Upload] Dibatalkan oleh user");
      progressContainer.style.display = "none";
      rapikanBtn.disabled = false;
      if (typeof toastInfo === "function") {
        toastInfo("Upload dibatalkan");
      } else if (typeof toastError === "function") {
        toastError("Upload dibatalkan");
      }
      return;
    }

    console.error("Analyze error:", err);
    if (typeof toastError === "function")
      toastError("Gagal analisis: " + err.message);
    progressContainer.style.display = "none";
    rapikanBtn.disabled = false;
  }
}

// ============================================
// FALLBACK ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â kalau uploadWithProgress tidak ke-load
// ============================================
async function analyzeVideoFallback(formData, headers) {
  try {
    const r = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers,
      body: formData,
    });
    const data = await r.json();

    if (!data.success) {
      if (data.code === "QUOTA_EXCEEDED") {
        if (typeof toastError === "function")
          toastError("ÃƒÂ°Ã…Â¸Ã…Â¡Ã‚Â« Kuota harian habis.");
        progressContainer.style.display = "none";
        if (typeof loadQuota === "function") loadQuota();
        return;
      }
      if (data.code === "GUEST_QUOTA_EXCEEDED") {
        if (typeof toastError === "function")
          toastError("Kuota gratis habis. Daftar untuk lanjut.");
        progressContainer.style.display = "none";
        rapikanBtn.disabled = false;
        return;
      }
      if (data.code === "DURATION_EXCEEDED") {
        if (typeof toastError === "function")
          toastError(data.error || "Video terlalu panjang.");
        progressContainer.style.display = "none";
        rapikanBtn.disabled = false;
        return;
      }
      throw new Error(data.error || "Analyze gagal");
    }

    currentAnalysisId = data.analysisId;
    currentAnalysisData = JSON.parse(JSON.stringify(data));
    originalAnalysisData = JSON.parse(JSON.stringify(data));
    editHistory = [];
    selectedSegmentIdx = -1;
    previewMode = false;
    _skipInProgress = false;
    currentQuickMode = "aggressive";
    zoomLevel = 1;
    _filmstripCacheKey = null;

    activeCategoryFilters = {};
    const uniqueCats = new Set(
      data.segments.map((s) => (s.source || "unknown").toLowerCase()),
    );
    uniqueCats.forEach((c) => {
      activeCategoryFilters[c] = true;
    });

    progressContainer.style.display = "none";
    // V3.0.0: INSTAN redirect ke render.php SEBELUM renderEditor
    if (currentAnalysisId) {
      console.log('[Redirect] ÃƒÂ¢Ã…Â¡Ã‚Â¡ INSTAN: render.php?project=' + currentAnalysisId);
      try { localStorage.setItem('clipora_last_analysis_id', currentAnalysisId); } catch(e) {}
      window.location.replace('render.php?project=' + encodeURIComponent(currentAnalysisId));
      return;
    }
    
    // Fallback: kalau tidak ada currentAnalysisId
    renderEditor(data);
  } catch (err) {
    console.error("Analyze error (fallback):", err);
    if (typeof toastError === "function")
      toastError("Gagal analisis: " + err.message);
    progressContainer.style.display = "none";
    rapikanBtn.disabled = false;
  }
}

// ============================================
// RENDER EDITOR
// ============================================
function renderEditor(data) {
  if (!editorContainer) return;
  
  // V9.602.0: Guard  jangan tampilkan editor kalau tidak ada data valid
  if (!data || !data.segments || !Array.isArray(data.segments) || data.segments.length === 0) {
    console.warn('[Editor] Tidak ada data segments  editor tidak ditampilkan');
    editorContainer.style.display = 'none';
    return;
  }
  
  console.log('[Editor] Data valid, menampilkan editor dengan', data.segments.length, 'segments');
  editorContainer.style.display = "block";
  // V9.609.0: Hide panel untuk user biasa, admin tetap lihat
  if (typeof IS_ADMIN_JS === 'undefined' || !IS_ADMIN_JS) {
    try {
      var _cp = document.getElementById('controlPanel');
      if (_cp) {
        _cp.style.display = 'none';
        console.log('[Editor] controlPanel disembunyikan (user biasa)');
      }
    } catch (e) {
      console.warn('[Editor] Error hide panel:', e.message);
    }
  } else {
    console.log('[Editor] Admin - panel TIDAK disembunyikan');
  }
  
  // V9.601.0: Sembunyikan panel pengaturan saat editor muncul
  try {
    var _cp = document.getElementById('controlPanel');
    if (_cp) {
      _cp.style.display = 'none';
      console.log('[Editor] Panel Pengaturan disembunyikan');
    }
    
    // Tampilkan tombol "Kembali ke Pengaturan"
    var _backBtn = document.getElementById('backToRapikanBtn');
    if (_backBtn) {
      _backBtn.style.display = 'inline-flex';
      console.log('[Editor] Tombol Kembali ditampilkan');
    } else {
      console.warn('[Editor] Tombol Kembali tidak ada di HTML');
    }
  } catch (e) {
    console.warn('[Editor] Error hide panel:', e.message);
  }
  editorContainer.scrollIntoView({ behavior: "smooth", block: "start" });

   // V1.10.0: Pakai URL server dari inputPath (dengan prefix project dir)
  if (editorVideo) {
    var videoSrc = null;

    // Deteksi base path project dari URL browser
    // Contoh: "/clipora/index.php" ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ "clipora"
    var pathParts = window.location.pathname.split('/').filter(Boolean);
    var projectDir = '';
    if (pathParts.length > 0 && pathParts[0] !== 'uploads') {
      projectDir = '/' + pathParts[0]; // "/clipora"
    }
    console.log('[Editor] projectDir:', projectDir);

    // 1. Pakai inputPath dari server (path absolute)
    if (data && data.inputPath) {
      var inputPath = String(data.inputPath);

      // Normalisasi separator (handle Windows \ dan Unix /)
      inputPath = inputPath.replace(/\\/g, '/');

      // Cari folder "uploads" di path
      var uploadsIdx = inputPath.indexOf('/uploads/');
      if (uploadsIdx !== -1) {
        // V1.10.0: Prefix dengan project dir
        videoSrc = projectDir + inputPath.substring(uploadsIdx);
        console.log('[Editor] videoSrc dari inputPath (uploads):', videoSrc);
      } else {
        // Fallback: ambil filename saja, asumsikan di /uploads/
        var filename = inputPath.split('/').pop();
        if (filename) {
          videoSrc = projectDir + '/uploads/' + filename;
          console.log('[Editor] videoSrc dari inputPath (filename):', videoSrc);
        }
      }
    }

    // 2. Fallback: pakai blob (kalau inputPath tidak ada)
    if (!videoSrc) {
      if (currentVideoBlobUrl) {
        videoSrc = currentVideoBlobUrl;
        console.warn('[Editor] Fallback ke blob URL (existing)');
      } else if (currentVideoFile) {
        currentVideoBlobUrl = URL.createObjectURL(currentVideoFile);
        videoSrc = currentVideoBlobUrl;
        console.warn('[Editor] Fallback ke blob URL (dibuat baru)');
      }
    }

    // 3. Set video src
    if (videoSrc) {
      editorVideo.src = videoSrc;
      console.log('[Editor] Set editorVideo.src =', videoSrc);
    } else {
      console.error('[Editor] Tidak bisa set video src');
    }
  }

  setPlaybackMode("normal");

  // V8.6.6: Sync quality selector
  const qs = document.getElementById("qualitySelect");
  if (qs) {
    const defaultPreset = document.getElementById("preset")?.value || "720p";
    const opt = qs.querySelector(`option[value="${defaultPreset}"]`);
    if (opt && !opt.disabled) {
      qs.value = defaultPreset;
    }
  }

  initTooltip();
  bindEditorEvents();

  updateStats();
  renderFilterChips();
  renderTimeRuler();
  renderTimeline();
  renderSegmentInfo();

  updateBigPlayButton(false);
  const timeEl = document.getElementById("tePreviewTime");
  if (timeEl && currentAnalysisData) {
    timeEl.textContent = `00:00 / ${formatMMSS(currentAnalysisData.duration)}`;
  }

  // V8.6.5: Auto-apply AGGRESSIVE (Hemat) sebagai default
  setTimeout(() => {
    applyQuickMode("aggressive", { silent: true });
  }, 100);

  setZoom(1);

  // V8.6.3: Load advanced preference
  setAdvancedMode(loadAdvancedPreference());

  loadFilmstrip();

  console.log(`ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¨ [Editor] Rendered with ${data.segments.length} segments`);
}

function initTooltip() {
  if (tooltipEl) return;
  tooltipEl = document.createElement("div");
  tooltipEl.className = "te-tooltip";
  document.body.appendChild(tooltipEl);
}

function bindEditorEvents() {
  if (editorVideo._eventsBound) return;
  editorVideo._eventsBound = true;

  editorVideo.addEventListener("timeupdate", () => {
    if (!currentAnalysisData) return;

    if (previewMode && !_skipInProgress) {
      const cut = findEnabledCutAt(editorVideo.currentTime);
      if (cut) {
        _skipInProgress = true;
        const segIdx = currentAnalysisData.segments.indexOf(cut);
        const targetBar = teTrack?.querySelector(
          `.te-segment[data-idx="${segIdx}"]`,
        );
        if (targetBar) {
          targetBar.classList.add("te-skipping");
          setTimeout(() => targetBar.classList.remove("te-skipping"), 500);
        }
        editorVideo.currentTime = Math.min(
          cut.end + 0.01,
          currentAnalysisData.duration,
        );
        setTimeout(() => {
          _skipInProgress = false;
        }, 100);
        return;
      }
    }

    const pct = (editorVideo.currentTime / currentAnalysisData.duration) * 100;
    tePlayhead.style.left = pct + "%";

    const timeEl = document.getElementById("tePreviewTime");
    if (timeEl) {
      timeEl.textContent = `${formatMMSS(editorVideo.currentTime)} / ${formatMMSS(currentAnalysisData.duration)}`;
    }
  });

  editorVideo.addEventListener("play", () => {
    const btn = document.getElementById("tePlayBtn");
    if (btn) btn.innerHTML = '<i class="fas fa-pause"></i>';
    updateBigPlayButton(true);
  });
  editorVideo.addEventListener("pause", () => {
    const btn = document.getElementById("tePlayBtn");
    if (btn) btn.innerHTML = '<i class="fas fa-play"></i>';
    updateBigPlayButton(false);
  });

  document.getElementById("tePlayBtn")?.addEventListener("click", () => {
    if (editorVideo.paused) editorVideo.play();
    else editorVideo.pause();
  });

  const tePlayPreviewBig = document.getElementById("tePlayPreviewBig");
  if (tePlayPreviewBig && !tePlayPreviewBig._bound) {
    tePlayPreviewBig._bound = true;
    tePlayPreviewBig.addEventListener("click", () => {
      if (editorVideo.paused) {
        if (!previewMode) setPlaybackMode("preview");

        if (
          currentAnalysisData &&
          editorVideo.currentTime >= currentAnalysisData.duration - 0.3
        ) {
          editorVideo.currentTime = 0;
        }

        const cut = findEnabledCutAt(editorVideo.currentTime);
        if (cut) {
          editorVideo.currentTime = cut.end;
        }

        editorVideo.play();
      } else {
        editorVideo.pause();
      }
    });
  }

  teTimeline?.addEventListener("click", (e) => {
    if (!currentAnalysisData) return;
    if (e.target.closest(".te-segment")) return;
    const rect = teTimeline.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const t = pct * currentAnalysisData.duration;
    editorVideo.currentTime = Math.max(
      0,
      Math.min(t, currentAnalysisData.duration),
    );
  });

  document.getElementById("teModeNormal")?.addEventListener("click", () => {
    setPlaybackMode("normal");
  });
  document.getElementById("teModePreview")?.addEventListener("click", () => {
    setPlaybackMode("preview");
  });

  document.querySelectorAll(".te-qm-btn").forEach((btn) => {
    if (btn._qmBound) return;
    btn._qmBound = true;
    btn.addEventListener("click", () => {
      applyQuickMode(btn.dataset.mode);
    });
  });

  // Zoom controls
  const zoomInBtn = document.getElementById("teZoomIn");
  const zoomOutBtn = document.getElementById("teZoomOut");
  const zoomResetBtn = document.getElementById("teZoomReset");
  const zoomSlider = document.getElementById("teZoomSlider");

  if (zoomInBtn && !zoomInBtn._bound) {
    zoomInBtn._bound = true;
    zoomInBtn.addEventListener("click", zoomIn);
  }
  if (zoomOutBtn && !zoomOutBtn._bound) {
    zoomOutBtn._bound = true;
    zoomOutBtn.addEventListener("click", zoomOut);
  }
  if (zoomResetBtn && !zoomResetBtn._bound) {
    zoomResetBtn._bound = true;
    zoomResetBtn.addEventListener("click", resetZoom);
  }
  if (zoomSlider && !zoomSlider._bound) {
    zoomSlider._bound = true;
    zoomSlider.addEventListener("input", (e) => {
      setZoom(parseFloat(e.target.value));
    });
  }

  // V8.6.3: Advanced toggle
  const advToggle = document.getElementById("teAdvToggle");
  if (advToggle && !advToggle._bound) {
    advToggle._bound = true;
    advToggle.addEventListener("click", () => {
      const wrap = document.getElementById("timelineEditorWrap");
      const isAdvanced = wrap.classList.contains("advanced-on");
      setAdvancedMode(!isAdvanced);

      if (typeof toastSuccess === "function") {
        toastSuccess(
          isAdvanced ? "ÃƒÂ¢Ã…Â¡Ã¢â€žÂ¢ÃƒÂ¯Ã‚Â¸Ã‚Â Mode Sederhana aktif" : "ÃƒÂ¢Ã…Â¡Ã¢â€žÂ¢ÃƒÂ¯Ã‚Â¸Ã‚Â Mode Lanjutan aktif",
        );
      }
    });
  }

  document.getElementById("teUndoBtn")?.addEventListener("click", undoEdit);

  document.getElementById("teSiDelete")?.addEventListener("click", () => {
    if (selectedSegmentIdx < 0 || !currentAnalysisData) return;
    pushHistory();
    currentAnalysisData.segments.splice(selectedSegmentIdx, 1);
    selectedSegmentIdx = -1;
    updateStats();
    renderFilterChips();
    renderTimeline();
    renderSegmentInfo();
    if (typeof toastSuccess === "function") toastSuccess("ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Segmen dihapus");
  });

  const teSiKeepBtn = document.getElementById("teSiKeep");
  if (teSiKeepBtn && !teSiKeepBtn._bound) {
    teSiKeepBtn._bound = true;
    teSiKeepBtn.addEventListener("click", () => {
      if (selectedSegmentIdx < 0 || !currentAnalysisData) return;
      const seg = currentAnalysisData.segments[selectedSegmentIdx];
      if (seg.enabled === false) {
        if (typeof toastInfo === "function")
          toastInfo("ÃƒÂ¢Ã…Â¡Ã‚Âª Segmen ini sudah dipertahankan");
        return;
      }

      pushHistory();
      seg.enabled = false;
      updateStats();
      renderFilterChips();
      renderTimeline();
      renderSegmentInfo();
      if (typeof toastSuccess === "function")
        toastSuccess("ÃƒÂ¢Ã…Â¡Ã‚Âª Segmen dipertahankan ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â tidak akan dipotong");
    });
  }

  const teSiCutBtn = document.getElementById("teSiCut");
  if (teSiCutBtn && !teSiCutBtn._bound) {
    teSiCutBtn._bound = true;
    teSiCutBtn.addEventListener("click", () => {
      if (selectedSegmentIdx < 0 || !currentAnalysisData) return;
      const seg = currentAnalysisData.segments[selectedSegmentIdx];
      if (seg.enabled !== false) {
        if (typeof toastInfo === "function")
          toastInfo("ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â´ Segmen ini sudah akan dipotong");
        return;
      }

      pushHistory();
      seg.enabled = true;
      updateStats();
      renderFilterChips();
      renderTimeline();
      renderSegmentInfo();
      if (typeof toastSuccess === "function")
        toastSuccess("ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â´ Segmen akan dipotong dari video");
    });
  }

  document.addEventListener("keydown", (e) => {
    if (editorContainer?.style.display !== "block") return;
    if (e.target.tagName === "INPUT") return;

    if (e.code === "Space") {
      e.preventDefault();
      if (editorVideo.paused) editorVideo.play();
      else editorVideo.pause();
    } else if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") {
      e.preventDefault();
      undoEdit();
    } else if (e.code === "ArrowLeft") {
      editorVideo.currentTime = Math.max(0, editorVideo.currentTime - 0.5);
    } else if (e.code === "ArrowRight") {
      editorVideo.currentTime = Math.min(
        currentAnalysisData.duration,
        editorVideo.currentTime + 0.5,
      );
    } else if (
      (e.ctrlKey || e.metaKey) &&
      (e.code === "Equal" || e.code === "NumpadAdd")
    ) {
      e.preventDefault();
      zoomIn();
    } else if (
      (e.ctrlKey || e.metaKey) &&
      (e.code === "Minus" || e.code === "NumpadSubtract")
    ) {
      e.preventDefault();
      zoomOut();
    } else if ((e.ctrlKey || e.metaKey) && e.code === "Digit0") {
      e.preventDefault();
      resetZoom();
    } else if (e.code === "KeyP") {
      e.preventDefault();
      setPlaybackMode(previewMode ? "normal" : "preview");
    }
  });
}

// ============================================
// STATS
// ============================================
function updateStats() {
  if (!currentAnalysisData || !editorStats) return;

  const duration = currentAnalysisData.duration;
  const enabled = currentAnalysisData.segments.filter(
    (s) => s.enabled !== false,
  );
  const totalCut = enabled.reduce((sum, s) => sum + (s.end - s.start), 0);
  const newDur = Math.max(0, duration - totalCut);
  const savedPct = duration > 0 ? Math.round((totalCut / duration) * 100) : 0;

  editorStats.innerHTML = `
        <div class="te-stat-item">
            <div class="te-stat-label">Durasi Asli</div>
            <div class="te-stat-value">${formatSec(duration)}</div>
        </div>
        <div class="te-stat-item">
            <div class="te-stat-label">Akan Dipotong</div>
            <div class="te-stat-value danger">${formatSec(totalCut)} (${savedPct}%)</div>
        </div>
        <div class="te-stat-item">
            <div class="te-stat-label">Durasi Baru</div>
            <div class="te-stat-value success">${formatSec(newDur)}</div>
        </div>
        <div class="te-stat-item">
            <div class="te-stat-label">Segmen Aktif</div>
            <div class="te-stat-value primary">${enabled.length}/${currentAnalysisData.segments.length}</div>
        </div>
    `;
}

// ============================================
// FILTER CHIPS
// ============================================
function renderFilterChips() {
  if (!teChipsContainer || !currentAnalysisData) return;

  const byCat = {};
  currentAnalysisData.segments.forEach((s) => {
    const c = (s.source || "unknown").toLowerCase();
    if (!byCat[c]) byCat[c] = { total: 0, enabled: 0 };
    byCat[c].total++;
    if (s.enabled !== false) byCat[c].enabled++;
  });

  teChipsContainer.innerHTML = Object.entries(byCat)
    .map(([cat, data]) => {
      const meta = SOURCE_META[cat] || SOURCE_META.unknown;
      const isActive = activeCategoryFilters[cat] !== false;
      const cls = isActive ? "active" : "hidden-cat";
      return `
            <button class="te-chip ${cls}" data-cat="${cat}" title="Klik untuk toggle semua segmen kategori ini">
                <span>${meta.icon}</span>
                <span>${meta.label}</span>
                <span class="te-chip-count">${data.enabled}/${data.total}</span>
            </button>
        `;
    })
    .join("");

  teChipsContainer.querySelectorAll(".te-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const cat = chip.dataset.cat;
      const isCurrentlyActive = activeCategoryFilters[cat] !== false;
      activeCategoryFilters[cat] = !isCurrentlyActive;

      pushHistory();
      currentAnalysisData.segments.forEach((s) => {
        const c = (s.source || "unknown").toLowerCase();
        if (c === cat) s.enabled = !isCurrentlyActive;
      });

      updateStats();
      renderFilterChips();
      renderTimeline();
    });
  });
}

// ============================================
// TIME RULER
// ============================================
function renderTimeRuler() {
  if (!teTimeRuler || !currentAnalysisData) return;
  const duration = currentAnalysisData.duration;
  const marks = 6;

  let html = "";
  for (let i = 0; i < marks; i++) {
    const pct = i / (marks - 1);
    const t = pct * duration;
    const label =
      t < 60
        ? `${t.toFixed(0)}s`
        : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
    html += `<span class="te-time-mark" style="left:${pct * 100}%">${label}</span>`;
  }
  teTimeRuler.innerHTML = html;
}

// ============================================
// TIMELINE
// ============================================
function renderTimeline() {
  if (!teTrack || !currentAnalysisData) return;
  const duration = currentAnalysisData.duration;

  teTrack.querySelectorAll(".te-segment").forEach((el) => el.remove());

  currentAnalysisData.segments.forEach((seg, idx) => {
    const cat = (seg.source || "unknown").toLowerCase();
    const meta = SOURCE_META[cat] || SOURCE_META.unknown;
    const enabled = seg.enabled !== false;
    const leftPct = (seg.start / duration) * 100;
    const widthPct = ((seg.end - seg.start) / duration) * 100;

        const bar = document.createElement("div");
    bar.className = `te-segment ${enabled ? "cut" : "keep"}`;
    bar.style.left = leftPct + "%";
    bar.style.width = Math.max(widthPct, 0.4) + "%";
    bar.dataset.idx = idx;

    // ÃƒÂ¢Ã‚Â­Ã‚Â V9.5.1: Warna khusus untuk noise
    if (cat === "noise" && enabled) {
      bar.style.background = "linear-gradient(135deg, #ec4899, #be185d)";
      bar.style.boxShadow = "0 0 8px rgba(236, 72, 153, 0.4)";
    }

    // Label yang lebih friendly
    let segLabel = meta.label || 'Potong';
    if (cat === 'noise' && seg.reason) {
      const noiseType = seg.reason.replace('noise:', '');
      if (noiseType && noiseType !== 'unknown') {
        segLabel = `Noise (${noiseType})`;
      }
    }

    bar.innerHTML = `
            <div class="te-segment-handle left" data-handle="left" data-idx="${idx}"></div>
            <span class="te-segment-label">${meta.icon} ${escapeHtml(segLabel)}</span>
            <div class="te-segment-handle right" data-handle="right" data-idx="${idx}"></div>
        `;

    bar.addEventListener("mouseenter", (e) => showTooltip(e, seg));
    bar.addEventListener("mousemove", (e) => moveTooltip(e));
    bar.addEventListener("mouseleave", hideTooltip);

    bar.addEventListener("click", (e) => {
      if (e.target.classList.contains("te-segment-handle")) return;
      pushHistory();
      seg.enabled = !enabled;
      selectedSegmentIdx = idx;
      updateStats();
      renderFilterChips();
      renderTimeline();
      renderSegmentInfo();
      editorVideo.currentTime = seg.start;
    });

    bar.querySelectorAll(".te-segment-handle").forEach((h) => {
      h.addEventListener("pointerdown", (e) => startDrag(e, idx));
    });

    teTrack.appendChild(bar);
  });
}

// ============================================
// FILMSTRIP
// ============================================
let _filmstripCacheKey = null;

async function loadFilmstrip() {
  if (!teFilmstrip || !currentVideoFile) return;

  const cacheKey = `${currentVideoFile.name}_${currentVideoFile.size}_${currentVideoFile.lastModified}`;
  if (_filmstripCacheKey === cacheKey && teFilmstrip.querySelector("img")) {
    return;
  }
  _filmstripCacheKey = cacheKey;

  teFilmstrip.innerHTML =
    '<div class="te-filmstrip-loading"><i class="fas fa-spinner fa-spin"></i> Loading preview video...</div>';

  try {
    const thumbs = await extractThumbnails(currentVideoFile, 12);
    if (!thumbs || thumbs.length === 0) {
      teFilmstrip.innerHTML = "";
      return;
    }
    teFilmstrip.innerHTML = thumbs
      .map((src) => `<img src="${src}" alt="">`)
      .join("");
    console.log(`ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¬ [Filmstrip] Loaded ${thumbs.length} thumbnails`);
  } catch (e) {
    console.warn("Filmstrip failed:", e);
    teFilmstrip.innerHTML = "";
  }
}

function extractThumbnails(file, count) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    const blobUrl = URL.createObjectURL(file);
    video.src = blobUrl;

    const cleanup = () => {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch (e) {}
      try {
        video.remove();
      } catch (e) {}
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("Filmstrip timeout"));
    }, 45000);

    video.onerror = () => {
      clearTimeout(timeoutId);
      cleanup();
      reject(new Error("Video load error"));
    };

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        if (!duration || !isFinite(duration)) {
          clearTimeout(timeoutId);
          cleanup();
          reject(new Error("Invalid duration"));
          return;
        }

        const aspect = (video.videoWidth || 16) / (video.videoHeight || 9);
        const targetH = 80;
        const targetW = Math.max(40, Math.round(targetH * aspect));

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");

        const thumbs = [];
        let consecutiveFails = 0;
        const MAX_CONSECUTIVE_FAILS = 3;

        for (let i = 0; i < count; i++) {
          const t = ((i + 0.5) / count) * duration;
          await seekTo(video, t);
          try {
            ctx.drawImage(video, 0, 0, targetW, targetH);
            thumbs.push(canvas.toDataURL("image/jpeg", 0.55));
            consecutiveFails = 0;
          } catch (drawErr) {
            thumbs.push("");
            consecutiveFails++;
            if (consecutiveFails >= MAX_CONSECUTIVE_FAILS) {
              console.warn(
                `[Filmstrip] ${MAX_CONSECUTIVE_FAILS}x fail berturut ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â stop`,
              );
              break;
            }
          }
        }

        clearTimeout(timeoutId);
        cleanup();
        resolve(thumbs.filter(Boolean).length ? thumbs : []);
      } catch (e) {
        clearTimeout(timeoutId);
        cleanup();
        reject(e);
      }
    };
  });
}

function seekTo(video, time, timeoutMs = 400) {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      video.onseeked = null;
      resolve();
    };
    video.onseeked = finish;
    try {
      video.currentTime = time;
    } catch (e) {
      finish();
    }
    setTimeout(finish, timeoutMs);
  });
}

// ============================================
// DRAG
// ============================================
let dragState = null;

function startDrag(e, idx) {
  e.preventDefault();
  e.stopPropagation();
  const seg = currentAnalysisData.segments[idx];
  const timelineRect = teTimeline.getBoundingClientRect();
  const handle = e.target.dataset.handle;

  pushHistory();
  dragState = {
    idx,
    handle,
    timelineRect,
    origStart: seg.start,
    origEnd: seg.end,
    duration: currentAnalysisData.duration,
  };

  document.addEventListener("pointermove", onDragMove);
  document.addEventListener("pointerup", endDrag);
  document.body.style.cursor = "ew-resize";
}

function onDragMove(e) {
  if (!dragState) return;
  const { idx, handle, timelineRect, duration } = dragState;
  const seg = currentAnalysisData.segments[idx];

  const x = e.clientX - timelineRect.left;
  const pct = Math.max(0, Math.min(1, x / timelineRect.width));
  const newTime = pct * duration;

  if (handle === "left") {
    seg.start = Math.max(0, Math.min(newTime, seg.end - 0.1));
  } else {
    seg.end = Math.min(duration, Math.max(newTime, seg.start + 0.1));
  }

  const bar = teTrack.querySelector(`.te-segment[data-idx="${idx}"]`);
  if (bar) {
    bar.style.left = (seg.start / duration) * 100 + "%";
    bar.style.width =
      Math.max(((seg.end - seg.start) / duration) * 100, 0.4) + "%";
  }
}

function endDrag() {
  if (!dragState) return;
  document.removeEventListener("pointermove", onDragMove);
  document.removeEventListener("pointerup", endDrag);
  document.body.style.cursor = "";
  dragState = null;
  updateStats();
  renderSegmentInfo();
}

// ============================================
// TOOLTIP
// ============================================
function showTooltip(e, seg) {
  if (!tooltipEl) return;
  const cat = (seg.source || "unknown").toLowerCase();
  const meta = SOURCE_META[cat] || SOURCE_META.unknown;
  const dur = (seg.end - seg.start).toFixed(2);
  const status =
    seg.enabled !== false ? "ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â´ Akan dipotong" : "ÃƒÂ¢Ã…Â¡Ã‚Âª Dipertahankan";

  // ÃƒÂ¢Ã‚Â­Ã‚Â V9.5.1: Parse reason ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â strip prefix "noise:" agar label lebih clean
  let reasonText = seg.reason || meta.label;
  if (reasonText.startsWith('noise:')) {
    const noiseType = reasonText.slice(6); // "unknown", "click", dll
    reasonText = noiseType !== 'unknown' ? `Noise (${noiseType})` : 'Noise';
  } else if (reasonText.startsWith('noise ')) {
    reasonText = 'Noise';
  }

  // Kalau label dari meta lebih bagus, pakai itu sebagai judul
  const displayTitle = `${meta.icon} ${meta.label}`;
  const displaySubtitle = reasonText !== meta.label && reasonText !== 'Noise'
    ? `<div class="te-tt-subreason" style="font-size:0.72rem;opacity:0.75;margin-top:2px;">${escapeHtml(reasonText)}</div>`
    : '';

  tooltipEl.innerHTML = `
        <div class="te-tt-reason">${displayTitle}${displaySubtitle}</div>
        <div class="te-tt-time">${seg.start.toFixed(2)}s ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ${seg.end.toFixed(2)}s (${dur}s)</div>
        <div class="te-tt-hint">${status} ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Klik untuk toggle</div>
    `;
  tooltipEl.style.display = "block";
  moveTooltip(e);
}

function moveTooltip(e) {
  if (!tooltipEl) return;
  const x = e.clientX + 12;
  const y = e.clientY - 20;
  tooltipEl.style.left = Math.min(x, window.innerWidth - 250) + "px";
  tooltipEl.style.top = Math.max(y, 10) + "px";
}

function hideTooltip() {
  if (tooltipEl) tooltipEl.style.display = "none";
}

// ============================================
// SEGMENT INFO
// ============================================
function renderSegmentInfo() {
  if (!teSegmentInfo) return;

  if (
    selectedSegmentIdx < 0 ||
    !currentAnalysisData?.segments[selectedSegmentIdx]
  ) {
    teSegmentInfo.style.display = "none";
    return;
  }

  const seg = currentAnalysisData.segments[selectedSegmentIdx];
  const cat = (seg.source || "unknown").toLowerCase();
  const meta = SOURCE_META[cat] || SOURCE_META.unknown;
  const isCut = seg.enabled !== false;

  document.getElementById("teSiIcon").textContent = meta.icon;
  document.getElementById("teSiReason").textContent =
    `${meta.label} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â "${seg.reason || meta.label}"`;
  document.getElementById("teSiTime").textContent =
    `${seg.start.toFixed(2)}s ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ${seg.end.toFixed(2)}s (durasi ${(seg.end - seg.start).toFixed(2)}s)`;

  const keepBtn = document.getElementById("teSiKeep");
  const cutBtn = document.getElementById("teSiCut");
  if (keepBtn) keepBtn.classList.toggle("active", !isCut);
  if (cutBtn) cutBtn.classList.toggle("active", isCut);

  teSegmentInfo.style.display = "flex";
}

// ============================================
// HISTORY
// ============================================
function pushHistory() {
  if (!currentAnalysisData) return;
  editHistory.push(JSON.stringify(currentAnalysisData.segments));
  if (editHistory.length > 50) editHistory.shift();
}

function undoEdit() {
  if (editHistory.length === 0) {
    if (typeof toastError === "function")
      toastError("Tidak ada yang bisa di-undo");
    return;
  }
  const prev = editHistory.pop();
  currentAnalysisData.segments = JSON.parse(prev);
  selectedSegmentIdx = -1;
  updateStats();
  renderFilterChips();
  renderTimeline();
  renderSegmentInfo();
  if (typeof toastSuccess === "function") toastSuccess("ÃƒÂ¢Ã¢â‚¬Â Ã‚Â©ÃƒÂ¯Ã‚Â¸Ã‚Â Undo berhasil");
}

// ============================================
// RESET
// ============================================
function resetEdits() {
  if (!originalAnalysisData) return;
  pushHistory();
  currentAnalysisData = JSON.parse(JSON.stringify(originalAnalysisData));
  selectedSegmentIdx = -1;

  activeCategoryFilters = {};
  const uniqueCats = new Set(
    currentAnalysisData.segments.map((s) =>
      (s.source || "unknown").toLowerCase(),
    ),
  );
  uniqueCats.forEach((c) => {
    activeCategoryFilters[c] = true;
  });

  // V8.6.5: Reset ke aggressive (Hemat)
  currentQuickMode = "aggressive";
  zoomLevel = 1;

  updateStats();
  renderFilterChips();
  renderTimeline();
  renderSegmentInfo();

  setTimeout(() => {
    applyQuickMode("aggressive", { silent: true });
  }, 50);

  setZoom(1);

  if (typeof toastSuccess === "function")
    toastSuccess("ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Reset ke rekomendasi AI");
}

// ============================================
// RENDER FINAL
// ============================================
async function renderFinalVideo() {
  // V9.32.1: Use project UUID dari URL kalau analysisId cuma 8 chars
  var _urlParams = new URLSearchParams(window.location.search);
  var _urlProjectId = _urlParams.get("project");
  var _useId = currentAnalysisId;
  if (_urlProjectId && _urlProjectId.length > 20 && (!currentAnalysisId || currentAnalysisId.length < 20)) {
    console.log("[Render] Pakai project UUID:", _urlProjectId, "(bukan analysisId:", currentAnalysisId + ")");
    _useId = _urlProjectId;
    currentAnalysisId = _urlProjectId;
  }
  if (!currentAnalysisId || !currentAnalysisData) return;

  console.log('[Render] _useId =', _useId, '| currentAnalysisId =', currentAnalysisId, '| _urlProjectId =', _urlProjectId);

  const btn = document.getElementById("renderFinalBtn");
  const origHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> <span>Merender...</span>';

  if (typeof saveStyleMemory === "function") {
    try {
      await saveStyleMemory();
    } catch (e) {}
  }

  const headers = { "Content-Type": "application/json" };
  if (typeof AUTH_TOKEN !== "undefined" && AUTH_TOKEN)
    headers["Authorization"] = "Bearer " + AUTH_TOKEN;

  try {
    const r = await fetch(`${API_URL}/render/${_useId}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        // V9.8.0: pakai subtitle terjemahan kalau user sudah translate
        segments: currentAnalysisData.segments,
        translatedWords: (currentAnalysisData.translatedWords && currentAnalysisData.translatedWords.length)
          ? currentAnalysisData.translatedWords
          : null,
        preset:
          document.getElementById("qualitySelect")?.value ||
          currentAnalysisData.preset ||
          "720p",
        enable_burn_subtitle: currentAnalysisData.enableBurnSubtitle !== false,
        add_watermark: currentAnalysisData.addWatermark !== false,
      }),
    });
    const data = await r.json();

    if (!data.success) throw new Error(data.error || "Render gagal");

    currentJobId = data.jobId;
    currentProgressFilename = data.progressFilename;

    // V1.11.0: Tampilkan progress di halaman yang sama (tanpa redirect)
    editorContainer.style.display = "none";
    progressContainer.style.display = "block";
    updateProgressUI(5, "ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¬ Merender video final...");
    progressDetail.textContent = "Segmen yang Anda pilih sedang dirender...";

    console.log("[Render] Progress tampil di halaman yang sama");
    startPolling(currentJobId);
    return;
  } catch (err) {
    console.error("Render error:", err);
    if (typeof toastError === "function")
      toastError("Gagal render: " + err.message);
    btn.disabled = false;
    btn.innerHTML = origHtml;
  }
}

document
  .getElementById("editorCloseBtn")
  ?.addEventListener("click", async () => {
    const okConfirm = await window.showConfirm({
      title: "ÃƒÂ¢Ã…â€œÃ¢â‚¬Å¡ÃƒÂ¯Ã‚Â¸Ã‚Â Batalkan Edit?",
      message:
        "Semua perubahan pada timeline akan hilang dan file analisis akan dihapus.",
      type: "warning",
      okText: "Ya, Batalkan",
      cancelText: "Lanjut Edit",
    });
    if (okConfirm) {
      if (editorContainer) editorContainer.style.display = "none";
      currentAnalysisId = null;
      currentAnalysisData = null;
      selectedSegmentIdx = -1;
      previewMode = false;
      zoomLevel = 1;
      rapikanBtn.disabled = false;
      if (typeof loadQuota === "function") loadQuota();
    }
  });
document
  .getElementById("renderFinalBtn")
  ?.addEventListener("click", renderFinalVideo);
document.getElementById("resetEditsBtn")?.addEventListener("click", resetEdits);

// ============================================
// PROSES VIDEO
// ============================================
if (rapikanBtn) {
  rapikanBtn.addEventListener("click", async () => {
    if (!IS_ADMIN_JS && rapikanBtn.disabled) {
      if (typeof toastError === "function")
        toastError("ÃƒÂ°Ã…Â¸Ã…Â¡Ã‚Â« Kuota harian habis. Upgrade atau tunggu besok.");
      return;
    }

    if (!currentVideoFile) {
      if (typeof toastError === "function")
        toastError("ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¤ Upload video dulu ya!");
      return;
    }

    if (serverStatus && serverStatus.textContent.includes("Offline")) {
      if (typeof toastError === "function") toastError("ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â Server offline.");
      return;
    }

    const plan = getCurrentPlan();
    if (plan === "guest") {
      const lanjut = await window.showConfirm({
        title: "ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â Login Dulu?",
        message:
          "Login untuk dapat 3 video per hari (gratis).\n\nLanjut tanpa login? Hanya 1 video, maksimal 1 menit.",
        type: "info",
        okText: "Login Sekarang",
        cancelText: "Lanjut Guest",
      });
      if (lanjut) {
        window.location.href = "login.php";
        return;
      }
    }

    const formData = new FormData();
    formData.append("video", currentVideoFile);

    const aggrEl = document.getElementById("aggressiveness");
    let aggressiveness = "content";

    if (aggrEl && aggrEl.dataset.userChanged === "true" && aggrEl.value) {
      aggressiveness = aggrEl.value;
    }

    const contentModeEl = document.getElementById("contentCreatorMode");
    if (contentModeEl && contentModeEl.checked) {
      aggressiveness = "content";
    }

    console.log(`ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¬ [Mode] ${aggressiveness}`);
    formData.append("aggressiveness", aggressiveness);

    formData.append(
      "enable_ai",
      document.getElementById("enableAI")?.checked ? "true" : "false",
    );
    formData.append(
      "generate_subtitle",
      document.getElementById("generateSubtitle")?.checked ? "true" : "false",
    );
    formData.append("add_watermark", "true");

    const burnSubEl = document.getElementById("enableBurnSubtitle");
    let enableBurnSubtitle = true;
    if (burnSubEl) enableBurnSubtitle = burnSubEl.checked;
    formData.append(
      "enable_burn_subtitle",
      enableBurnSubtitle ? "true" : "false",
    );
    console.log(
      `ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ [Burn Subtitle] ${enableBurnSubtitle ? "AKTIF" : "NONAKTIF"}`,
    );

    const whisperEl = document.getElementById("whisperModel");
    if (whisperEl && !whisperEl.disabled) {
      formData.append("whisper_model", whisperEl.value);
    }

    const presetEl = document.getElementById("preset");
    if (presetEl) formData.append("preset", presetEl.value);

    formData.append(
      "enable_scene",
      document.getElementById("enableScene")?.checked ? "true" : "false",
    );
    formData.append(
      "enable_noise",
      document.getElementById("enableNoise")?.checked ? "true" : "false",
    );

    const v6Keys = {
      enableVerticalCrop: "enable_vertical_crop",
      enableThumbnail: "enable_thumbnail",
      enableMusic: "enable_music",
      enableMultiFormat: "enable_multi_format",
      enableAutoChapter: "enable_auto_chapter",
      enableMultiLang: "enable_multi_lang",
    };
    for (const [elId, param] of Object.entries(v6Keys)) {
      const el = document.getElementById(elId);
      if (el) formData.append(param, el.checked ? "true" : "false");
    }

    rapikanBtn.disabled = true;

    await analyzeVideo(formData);
  });
}

// ============================================
// ON JOB COMPLETED
// ============================================
function onJobCompleted(result) {
  updateProgressUI(100, "ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Video berhasil dirapikan!");
  loadQuota();

  // V3.0.0: Cek __RENDER_PAGE__ -- redirect ke download-page.php
  if (window.__RENDER_PAGE__) {
    var _files = [];
    if (result && result.filename) _files.push(result.filename);
    if (result && result.outputFilename) _files.push(result.outputFilename);
    if (result && result.downloadUrl) _files.push(result.downloadUrl.split('/').pop());
    if (result && result.subtitleFile) _files.push(result.subtitleFile);
    if (result && result.thumbnailFile) _files.push(result.thumbnailFile);
    if (_files.length > 0) {
      var _dlUrl = 'download-page.php?files=' + encodeURIComponent(_files.join('|'));
      console.log('[Redirect] Ke download-page.php: ' + _dlUrl);
      setTimeout(function() { window.location.replace(_dlUrl); }, 1500);
      return;
    }
  }

  // V3.0.0: INSTAN REDIRECT - skip semua UI, langsung ke render.php
  (function() {
    var _pid = (typeof currentAnalysisId !== 'undefined' && currentAnalysisId)
            || (window.__PROJECT_ID__)
            || (new URLSearchParams(window.location.search)).get('project')
            || (typeof result !== 'undefined' && result && (result.analysisId || result.analysis_id))
            || (typeof result !== 'undefined' && result && (result.project_id || result.projectId))
            || localStorage.getItem('clipora_project_id');
    
    if (_pid) {
      console.log('[Redirect] ÃƒÂ¢Ã…Â¡Ã‚Â¡ INSTAN ke render.php?project=' + _pid);
      try { localStorage.setItem('clipora_last_analysis_id', _pid); } catch(e) {}
      window.location.replace('render.php?project=' + encodeURIComponent(_pid));
      return;  // stop eksekusi selanjutnya
    }
  })();

  // Fallback: kalau tidak ada _pid, tampilkan UI seperti biasa
  setTimeout(() => {
    progressContainer.style.display = "none";
    resultBox.style.display = "block";
    renderResult(result);
    populateModal(result);

    // V1.22.0: Force show resultBox (override HideRapikan kalau perlu)
    var _rb = document.getElementById('resultBox');
    if (_rb) {
      _rb.style.display = 'block';
      _rb.style.visibility = 'visible';
      _rb.style.opacity = '1';
      _rb.style.setProperty('display', 'block', 'important');
      console.log('[Render] ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ ResultBox DIPAKSA muncul');
      // V3.0.0: Redirect ke halaman render pakai currentAnalysisId
      (function() {
        // currentAnalysisId masih terisi di sini (di-reset SETELAH redirect)
        var _pid = (typeof currentAnalysisId !== 'undefined' && currentAnalysisId)
                || (window.__PROJECT_ID__)
                || (new URLSearchParams(window.location.search)).get('project')
                || (typeof result !== 'undefined' && result && (result.analysisId || result.analysis_id))
                || (typeof result !== 'undefined' && result && (result.project_id || result.projectId))
                || localStorage.getItem('clipora_project_id');

        console.log('[Redirect] _pid =', _pid, '| currentAnalysisId =', 
                    (typeof currentAnalysisId !== 'undefined' ? currentAnalysisId : 'undefined'));

        if (_pid) {
          // Simpan ke localStorage untuk keperluan lain
          try { localStorage.setItem('clipora_last_analysis_id', _pid); } catch(e) {}
          console.log('[Redirect] ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Ke render.php?project=' + _pid);
          window.location.replace('render.php?project=' + encodeURIComponent(_pid));
        } else {
          console.warn('[Redirect] ÃƒÂ¢Ã‚ÂÃ…â€™ ID tidak ditemukan, skip redirect');
        }
      })();
    }

    // V1.22.0: Restore section yang di-hide HideRapikan
    document.querySelectorAll('[data-hidden-by-editor="1"]').forEach(function(el) {
      el.style.display = '';
      el.removeAttribute('data-hidden-by-editor');
    });

    if (typeof toastSuccess === "function") {
      const msg = result.subtitleBurned
        ? "ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Video berhasil + subtitle sudah menyatu!"
        : "ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Video berhasil dirapikan!";
      toastSuccess(msg);
    }

    currentAnalysisId = null;
    currentAnalysisData = null;
    previewMode = false;
    zoomLevel = 1;
    if (editorContainer) editorContainer.style.display = "none";

    if (typeof loadStyleMemoryStatus === "function") {
      setTimeout(loadStyleMemoryStatus, 1000);
    }
  }, 500);
}

function onJobFailed(error) {
  if (typeof toastError === "function") toastError("Gagal: " + error);
  progressContainer.style.display = "none";
  if (!IS_ADMIN_JS && currentQuotaRemaining !== null) {
    updateRapikanButton(currentQuotaRemaining);
  } else {
    rapikanBtn.disabled = false;
  }
}

// ============================================
// RENDER RESULT
// ============================================
function renderResult(data) {
  const oldDur = data.originalDuration || 0;
  const newDur = data.newDuration || 0;
  const saved = oldDur - newDur;
  const savedPercent = oldDur > 0 ? Math.round((saved / oldDur) * 100) : 0;

  statsGrid.innerHTML = `
        <div class="stat-item"><div class="stat-label">Durasi Asli</div>
            <div class="stat-value" style="color:var(--text-muted);">${formatDuration(oldDur)}</div></div>
        <div class="stat-item"><div class="stat-label">Durasi Baru</div>
            <div class="stat-value success">${formatDuration(newDur)}</div></div>
        <div class="stat-item"><div class="stat-label">Terpotong</div>
            <div class="stat-value primary">${formatDuration(saved)} (${savedPercent}%)</div></div>
        ${data.silences > 0 ? `<div class="stat-item"><div class="stat-label">ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Â¡ Jeda</div><div class="stat-value">${data.silences}</div></div>` : ""}
        ${data.noiseSegments > 0 ? `<div class="stat-item"><div class="stat-label">ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ…Â  Noise</div><div class="stat-value">${data.noiseSegments}</div></div>` : ""}
        ${data.aiSegments > 0 ? `<div class="stat-item"><div class="stat-label">ÃƒÂ°Ã…Â¸Ã‚Â¤Ã¢â‚¬â€œ AI</div><div class="stat-value ai">${data.aiSegments}</div></div>` : ""}
        ${data.repetitionSegments > 0 ? `<div class="stat-item"><div class="stat-label">ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â Frasa</div><div class="stat-value">${data.repetitionSegments}</div></div>` : ""}
        ${data.subtitleBurned ? `<div class="stat-item"><div class="stat-label">ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ Subtitle</div><div class="stat-value success">Burned</div></div>` : ""}
    `;
  resultTitle.textContent = "ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Video Berhasil Dirapikan!";
  durationInfo.innerHTML = `<div style="font-size:0.9rem;color:var(--text-muted);">
        ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Berhasil! (${savedPercent}% lebih pendek)${data.subtitleBurned ? " ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ Subtitle menyatu di video" : ""}</div>`;

  if (data.chapters && data.chapters.length > 0) {
    chaptersContainer.style.display = "block";
    chaptersList.innerHTML = "";
    data.chapters.forEach((ch) => {
      const div = document.createElement("div");
      div.className = "chapter";
      div.innerHTML = `<span class="time">${formatDuration(ch.start)} - ${formatDuration(ch.end)}</span>
                             <span class="title">${ch.title || "Bab"}</span>`;
      chaptersList.appendChild(div);
    });
  }
}

// ============================================
// MODAL
// ============================================
function populateModal(data) {
  const oldDur = data.originalDuration || 0;
  const newDur = data.newDuration || 0;
  const saved = oldDur - newDur;
  const savedPercent = oldDur > 0 ? Math.round((saved / oldDur) * 100) : 0;

  const setEl = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  setEl("modalFilename", data.filename || "-");
  setEl("modalSize", (data.filesize || "-") + " MB");
  setEl("modalOriginalDur", formatDuration(oldDur));
  setEl("modalNewDur", formatDuration(newDur));
  setEl("modalSaved", `${formatDuration(saved)} (${savedPercent}%)`);
  setEl("modalSilences", data.silences || 0);
  setEl("modalNoise", data.noiseSegments || 0);
  setEl("modalAI", data.aiSegments || 0);

  const speech =
    (data.stutterSegments || 0) +
    (data.falseStartSegments || 0) +
    (data.fillerSegments || 0);
  setEl("modalSpeech", speech || "Tidak ada");

  const burnedRow = document.getElementById("modalSubtitleBurnedRow");
  if (burnedRow)
    burnedRow.style.display = data.subtitleBurned ? "flex" : "none";

  const dl = document.getElementById("modalDownloadVideoBtn");
  if (dl) {
    dl.href = BASE_URL + (data.downloadUrl || "");
    dl.download = data.filename || "Clipora_video.mp4";
  }

  const subBtn = document.getElementById("modalDownloadSubtitleBtn");
  if (data.subtitleFile && subBtn) {
    subBtn.style.display = "flex";
    subBtn.href = BASE_URL + "/download/" + data.subtitleFile;
    subBtn.download = data.subtitleFile;
  } else if (subBtn) subBtn.style.display = "none";

  const thumbBtn = document.getElementById("modalDownloadThumbnailBtn");
  if (data.thumbnailFile && thumbBtn) {
    thumbBtn.style.display = "flex";
    thumbBtn.href = BASE_URL + "/download/" + data.thumbnailFile;
    thumbBtn.download = data.thumbnailFile;
  } else if (thumbBtn) thumbBtn.style.display = "none";

  const gifBtn = document.getElementById("modalDownloadGifBtn");
  if (data.gifFile && gifBtn) {
    gifBtn.style.display = "flex";
    gifBtn.href = BASE_URL + "/download/" + data.gifFile;
    gifBtn.download = data.gifFile;
  } else if (gifBtn) gifBtn.style.display = "none";

  const mp3Btn = document.getElementById("modalDownloadMp3Btn");
  if (data.mp3File && mp3Btn) {
    mp3Btn.style.display = "flex";
    mp3Btn.href = BASE_URL + "/download/" + data.mp3File;
    mp3Btn.download = data.mp3File;
  } else if (mp3Btn) mp3Btn.style.display = "none";

  const againBtn = document.getElementById("modalProcessAgainBtn");
  if (againBtn)
    againBtn.onclick = () => {
      closeModal();
      resetPage();
    };

  if (typeof window.refreshShareCaption === "function") {
    try {
      window.refreshShareCaption();
    } catch (e) {}
  }
}

function openModal() {
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

if (openModalBtn) openModalBtn.addEventListener("click", openModal);
if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
if (closeModalFooterBtn)
  closeModalFooterBtn.addEventListener("click", closeModal);
if (modal)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ============================================
// STYLE MEMORY
// ============================================
function computeStyleDelta() {
  if (!originalAnalysisData || !currentAnalysisData) return null;

  const categories = {};
  currentAnalysisData.segments.forEach((s) => {
    const cat = (s.source || "unknown").toLowerCase();
    if (!categories[cat]) {
      categories[cat] = {
        total_shown: 0,
        enabled_by_user: 0,
        disabled_by_user: 0,
      };
    }
    categories[cat].total_shown++;
    if (s.enabled !== false) categories[cat].enabled_by_user++;
    else categories[cat].disabled_by_user++;
  });
  return { categories };
}

async function saveStyleMemory() {
  if (typeof IS_LOGGED_IN === "undefined" || !IS_LOGGED_IN || !AUTH_TOKEN)
    return;
  if (IS_ADMIN_JS) return;

  const delta = computeStyleDelta();
  if (!delta || Object.keys(delta.categories).length === 0) return;

  try {
    const r = await fetch(`${API_URL}/user/style-memory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + AUTH_TOKEN,
      },
      body: JSON.stringify({ delta }),
    });
    const data = await r.json();

    if (data.success) {
      console.log(
        `ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Â  [StyleMemory] Saved: ${data.total_videos} videos, ${Object.keys(data.categories).length} categories`,
      );
      if (data.total_videos >= 5 && typeof toastSuccess === "function") {
        toastSuccess(
          `ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Â  AI belajar dari edit Anda! (${data.total_videos} videos)`,
        );
      }
    }
  } catch (e) {
    console.warn("Style memory save failed:", e);
  }
}

async function loadStyleMemoryStatus() {
  if (IS_ADMIN_JS) return;
  if (typeof IS_LOGGED_IN === "undefined" || !IS_LOGGED_IN || !AUTH_TOKEN)
    return;

  try {
    const r = await fetch(`${API_URL}/user/style-memory`, {
      cache: "no-store",
      headers: { Authorization: "Bearer " + AUTH_TOKEN },
    });
    if (!r.ok) return;

    const data = await r.json();
    if (!data.success || !data.memory) return;

    const totalVideos = data.memory.total_videos || 0;
    const categories = data.memory.categories || {};
    const learnedCount = Object.values(categories).filter(
      (c) => c.total_shown >= 5,
    ).length;

    const badge = document.getElementById("styleMemoryBadge");
    if (badge) {
      if (totalVideos >= 5 && learnedCount > 0) {
        badge.style.display = "inline-flex";
        badge.innerHTML = `<i class="fas fa-brain"></i> AI sudah belajar dari ${totalVideos} video Anda`;
        badge.title = `Kategori: ${Object.keys(categories).join(", ")}`;
      } else if (totalVideos > 0) {
        badge.style.display = "inline-flex";
        badge.style.opacity = "0.7";
        badge.innerHTML = `<i class="fas fa-brain"></i> AI belajar: ${totalVideos}/5 video`;
      } else {
        badge.style.display = "none";
      }
    }
  } catch (e) {
    console.warn("Load style memory failed:", e);
  }
}

if (typeof IS_LOGGED_IN !== "undefined" && IS_LOGGED_IN) {
  setTimeout(loadStyleMemoryStatus, 2000);
}

// ============================================
// INIT
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  const aggrEl = document.getElementById("aggressiveness");
  if (aggrEl) {
    aggrEl.addEventListener("change", function () {
      aggrEl.dataset.userChanged = "true";
      console.log(`ÃƒÂ°Ã…Â¸Ã…Â½Ã¢â‚¬ÂºÃƒÂ¯Ã‚Â¸Ã‚Â [Mode] User pilih manual: ${aggrEl.value}`);
    });

    if (!Array.from(aggrEl.options).some((o) => o.value === "content")) {
      const opt = document.createElement("option");
      opt.value = "content";
      opt.textContent = "ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¬ Content Creator (Paling Rapi)";
      aggrEl.insertBefore(opt, aggrEl.firstChild);
    }
    aggrEl.value = "content";
    console.log("ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¬ [Default] Mode = content (V8.6.5)");
  }

  const contentModeEl = document.getElementById("contentCreatorMode");
  if (contentModeEl) {
    contentModeEl.checked = true;
    contentModeEl.addEventListener("change", function () {
      console.log(
        `ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¬ [Toggle] Content Mode: ${contentModeEl.checked ? "ON" : "OFF"}`,
      );
    });
  }
});

// ============================================
// RESET PAGE
// ============================================
function resetPage() {
  // V8.9.3: revoke blob URL
  if (currentVideoBlobUrl) {
    try {
      URL.revokeObjectURL(currentVideoBlobUrl);
    } catch (e) {}
    currentVideoBlobUrl = null;
  }

  currentVideoFile = null;
  currentJobId = null;

  // V8.6.6: Reset quality selector ke default
  const qs = document.getElementById("qualitySelect");
  if (qs) {
    const defaultPreset = document.getElementById("preset")?.value || "720p";
    qs.value = defaultPreset;
  }
  currentAnalysisId = null;
  currentAnalysisData = null;
  originalAnalysisData = null;
  selectedSegmentIdx = -1;
  editHistory = [];
  previewMode = false;
  currentQuickMode = "aggressive";
  zoomLevel = 1;
  _filmstripCacheKey = null;

  if (pollInterval) clearInterval(pollInterval);
  videoPreview.classList.remove("show"); videoPreview.removeAttribute("data-show");
  controlPanel.style.display = "none";
  uploadArea.style.setProperty("display", "block", "important");
  resultBox.style.display = "none";
  if (chaptersContainer) chaptersContainer.style.display = "none";
  if (editorContainer) editorContainer.style.display = "none";
  videoPlayer.src = "";
  videoInput.value = "";
  progressContainer.style.display = "none";
  updateProgressUI(0, "");
  statsGrid.innerHTML = "";
  if (chaptersList) chaptersList.innerHTML = "";
  if (teFilmstrip) teFilmstrip.innerHTML = "";

  if (typeof IS_LOGGED_IN !== "undefined" && IS_LOGGED_IN) {
    loadQuota();
  } else {
    rapikanBtn.disabled = false;
  }
  closeModal();
}

// ============================================
// V9.1.0: SAMPLE VIDEO BUTTON HANDLER
// ============================================
(function () {
  "use strict";

  const wrap = document.getElementById("sampleVideoWrap");
  const btn = document.getElementById("sampleVideoBtn");

  if (!wrap || !btn) return;
  if (typeof IS_LOGGED_IN === "undefined" || !IS_LOGGED_IN) return;

  // Cek dulu: apakah user sudah pernah upload? Kalau ya, sembunyikan
  // Sembunyikan dulu ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â nanti muncul kalau memang perlu
  // (biar tidak muncul bareng widget lain)

  // Ambil status onboarding
  async function checkShowButton() {
    const TOKEN = (window.CLIPORA_AUTH && window.CLIPORA_AUTH.token) || "";
    if (!TOKEN) return;

    // Sembunyikan kalau admin
    if (window.CLIPORA_AUTH && window.CLIPORA_AUTH.isAdmin) return;

    try {
      const r = await fetch(`${API_URL}/user/onboarding`, {
        headers: { Authorization: "Bearer " + TOKEN },
        cache: "no-store",
      });
      const d = await r.json();
      if (!d.success) return;

      // Muncul kalau: belum pernah upload DAN belum pakai sample
      const o = d.onboarding;
      if (!o.first_upload_done && !o.sample_used) {
        setTimeout(() => {
          wrap.style.display = "block";
        }, 400);
      }
    } catch (e) {
      // silent
    }
  }

  // Handle klik sample
  btn.addEventListener("click", async () => {
    if (btn.disabled) return;

    const origHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat sample...';

    try {
      // Fetch file sample
      // Cache-busting: pakai query timestamp biar browser tidak pakai cache lama
      const res = await fetch("assets/sample/sample.mp4?t=" + Date.now(), {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Gagal download sample");

      const blob = await res.blob();
      const file = new File([blob], "sample-video.mp4", { type: "video/mp4" });

      // Mark step
      try {
        const TOKEN = (window.CLIPORA_AUTH && window.CLIPORA_AUTH.token) || "";
        await fetch("http://38.103.170.165:3000/api/user/onboarding/step", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ step: "sample_used" }),
        });
      } catch (e) {
        console.warn("Mark sample step error:", e);
      }

      btn.innerHTML = '<i class="fas fa-check"></i> Sample dimuat!';

      // Sembunyikan tombol
      setTimeout(() => {
        wrap.style.transition = "opacity 0.3s, transform 0.3s";
        wrap.style.opacity = "0";
        wrap.style.transform = "translateY(-8px)";
        setTimeout(() => (wrap.style.display = "none"), 300);
      }, 800);

      // Trigger upload handler dengan flag is_sample (bypass limit)
      if (typeof handleVideoFile === "function") {
        window.__IS_SAMPLE__ = true;
        handleVideoFile(file);
      } else {
        throw new Error("handleVideoFile tidak tersedia");
      }
    } catch (e) {
      console.error("Sample video error:", e);
      btn.disabled = false;
      btn.innerHTML = origHtml;
      if (typeof toastError === "function") {
        toastError("Gagal memuat sample: " + e.message);
      }
    }
  });

  // Jalankan cek
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkShowButton);
  } else {
    checkShowButton();
  }
})();

window.resetPage = resetPage;


/* ============================================================
   V9.8.0 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â TRANSLATE SUBTITLE HANDLER
   Contract: POST /api/translate  { text, from, to }
   Response: { success, translated, from, to, provider }
   ============================================================ */
(function () {
    function initTranslatePanel() {
        const panel       = document.getElementById("translatePanel");
        const btn         = document.getElementById("translateBtn");
        const resetBtn    = document.getElementById("translateResetBtn");
        const langSel     = document.getElementById("targetLanguage");
        const statusBox   = document.getElementById("translateStatus");
        const previewBox  = document.getElementById("translatePreview");
        const previewBody = document.getElementById("translatePreviewBody");

        if (!btn || !panel) return;

        function setStatus(type, html) {
            if (!statusBox) return;
            statusBox.style.display = "flex";
            statusBox.className = "te-translate-status " + type;
            statusBox.innerHTML = html;
        }
        function fmtTime(sec) {
            if (typeof sec !== "number") return "";
            const m = Math.floor(sec / 60);
            const s = (sec % 60).toFixed(1);
            return String(m).padStart(2,"0") + ":" + String(s).padStart(4,"0");
        }
        function escHtml(s) {
            return String(s == null ? "" : s)
                .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }

        function collectSegments() {
        const data = (typeof currentAnalysisData !== "undefined") ? currentAnalysisData : null;
        if (!data) return [];
        const words = data.words || [];
        if (!Array.isArray(words) || !words.length) return [];

        const groups = [];
        let buf = [];
        let bufStart = null, bufEnd = null, bufLen = 0;
        let prevEnd = null;

        const flush = () => {
            if (buf.length) {
                groups.push({
                    start: bufStart,
                    end: bufEnd,
                    text: buf.map(w => (w.word || "").trim()).join(" "),
                    originalWords: buf.slice()   // V9.9.0: simpan kata ASLI dengan timing Whisper
                });
                buf = []; bufStart = null; bufEnd = null; bufLen = 0;
            }
        };

        for (const w of words) {
            const t = (w.word || "").trim();
            if (!t) continue;
            if (prevEnd !== null && (w.start - prevEnd) > 0.8) flush();
            if (bufStart === null) bufStart = w.start;
            buf.push(w);
            bufEnd = w.end;
            bufLen += t.length + 1;
            prevEnd = w.end;
            if (bufLen > 50 || /[.!?]$/.test(t)) flush();
        }
        flush();

        console.log("[Translate] collectSegments: " + groups.length + " groups (timing asli Whisper)");
        return groups;
    }

        async function translateOne(text, from, to) {
            for (let attempt = 0; attempt < 3; attempt++) {
                try {
                    const _h = { "Content-Type": "application/json" };
                    if (typeof AUTH_TOKEN !== "undefined" && AUTH_TOKEN)
                        _h["Authorization"] = "Bearer " + AUTH_TOKEN;
                    const res = await fetch("/api/translate", {
                        method: "POST",
                        headers: _h,
                        credentials: "same-origin",
                        body: JSON.stringify({ text, from, to })
                    });
                    const data = await res.json();
                    if (res.status === 403) throw new Error("PREMIUM_REQUIRED");
                    if (!res.ok || !data.success) throw new Error(data.error || ("HTTP " + res.status));
                    return data.translated || text;
                } catch (e) {
                    if (e.message === "PREMIUM_REQUIRED") throw e;
                    if (attempt === 2) throw e;
                    await new Promise(r => setTimeout(r, 600 * (attempt + 1)));
                }
            }
        }

        async function runPool(items, worker, concurrency, onProgress) {
            const results = new Array(items.length);
            let idx = 0, done = 0;
            async function next() {
                while (true) {
                    const i = idx++;
                    if (i >= items.length) return;
                    try { results[i] = await worker(items[i], i); }
                    catch (e) { results[i] = { __error: e.message }; }
                    done++;
                    if (onProgress) onProgress(done, items.length);
                }
            }
            await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, next));
            return results;
        }

        btn.addEventListener("click", async () => {
            const target = langSel ? langSel.value : "";
            if (!target) {
                setStatus("error", '<i class="fas fa-exclamation-circle"></i> Pilih bahasa target dulu');
                return;
            }
            const data = (typeof currentAnalysisData !== "undefined") ? currentAnalysisData : null;
            if (!data) {
                setStatus("error", '<i class="fas fa-exclamation-circle"></i> Data analisis belum siap');
                return;
            }
            const segments = collectSegments();
            if (!segments.length) {
                setStatus("error", '<i class="fas fa-exclamation-circle"></i> Tidak ada subtitle untuk diterjemahkan');
                return;
            }

            const sourceLang = data.detectedLanguage || "id";
            const orig = btn.innerHTML;
            btn.disabled = true;
            setStatus("loading", '<i class="fas fa-spinner fa-spin"></i> Menerjemahkan 0/' + segments.length + ' baris...');

            try {
                const translated = await runPool(
                    segments,
                    (seg) => translateOne(seg.text, sourceLang, target),
                    3,
                    (done, total) => {
                        setStatus("loading", '<i class="fas fa-spinner fa-spin"></i> Menerjemahkan ' + done + '/' + total + ' baris...');
                        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + done + '/' + total;
                    }
                );

                const outSegments = segments.map((s, i) => {
                    const r = translated[i];
                    const isErr = r && typeof r === "object" && r.__error;
                    if (isErr && r.__error === "PREMIUM_REQUIRED") {
                        throw new Error("Fitur translate khusus Premium");
                    }
                    return {
                        start: s.start,
                        end: s.end,
                        text: isErr ? s.text : (r || s.text),
                        original: s.text,
                        error: isErr ? r.__error : null
                    };
                });


            // V9.9.0: Map hasil terjemahan ke TIMING ASLI Whisper (sync dengan audio)
            const _translatedWords = [];
            for (let _i = 0; _i < outSegments.length; _i++) {
                const _seg = outSegments[_i];
                const _orig = segments[_i].originalWords || [];
                const _trWords = String(_seg.text || "").trim().split(/\s+/).filter(Boolean);
                if (!_orig.length || !_trWords.length) continue;
                const _n = _orig.length, _m = _trWords.length;
                for (let _j = 0; _j < _n; _j++) {
                    const _idx = Math.min(_m - 1, Math.floor(_j * _m / _n));
                    _translatedWords.push({
                        word: _trWords[_idx],
                        start: _orig[_j].start,   // TIMING ASLI!
                        end: _orig[_j].end
                    });
                }
                // Sisa kata terjemahan (kalau M > N)
                if (_m > _n) {
                    const _last = _translatedWords[_translatedWords.length - 1];
                    const _extra = _trWords.slice(_n).join(" ");
                    if (_extra) _last.word = _last.word + " " + _extra;
                }
            }
            if (_translatedWords.length > 0) {
                data.translatedWords = _translatedWords;
                console.log("[Translate] translatedWords (timing asli):", _translatedWords.length);
            }
                data.translatedSegments = outSegments;
                data.translateTarget    = target;
                data.translateSource    = sourceLang;

                const errCount = outSegments.filter(s => s.error).length;
                if (errCount > 0) {
                    setStatus("error", '<i class="fas fa-exclamation-triangle"></i> Selesai dengan ' + errCount + ' baris gagal');
                } else {
                    setStatus("success", '<i class="fas fa-check-circle"></i> Berhasil diterjemahkan ' + outSegments.length + ' baris ke ' + target.toUpperCase());
                }
                if (resetBtn) resetBtn.style.display = "inline-flex";

                if (previewBody && previewBox) {
                    previewBody.innerHTML = outSegments.map(s =>
                        '<div class="te-translate-line">' +
                            '<div class="te-translate-line-time">' + fmtTime(s.start) + '</div>' +
                            '<div>' +
                                '<div class="te-translate-line-text"' + (s.error ? ' style="color:#f87171;"' : '') + '>' +
                                    escHtml(s.text) + (s.error ? ' ÃƒÂ¢Ã…Â¡Ã‚Â ' : '') +
                                '</div>' +
                                '<div class="te-translate-line-original">' + escHtml(s.original) + '</div>' +
                            '</div>' +
                        '</div>'
                    ).join("");
                    previewBox.style.display = "block";
                }
            } catch (e) {
                console.error("[Translate]", e);
                setStatus("error", '<i class="fas fa-times-circle"></i> ' + e.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = orig;
            }
        });

        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                const data = (typeof currentAnalysisData !== "undefined") ? currentAnalysisData : null;
                if (data) {
                    data.translatedSegments = null;
                    data.translateTarget    = null;
                    data.translateSource    = null;
                }
                if (previewBox) previewBox.style.display = "none";
                if (statusBox)  statusBox.style.display  = "none";
                if (langSel)    langSel.value = "";
                resetBtn.style.display = "none";
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initTranslatePanel);
    } else {
        initTranslatePanel();
    }
})();
/* ===================== END TRANSLATE HANDLER ===================== */


/* ============================================================
   V1.0.0: SAVE PROJECT HANDLER
   ============================================================ */
(function initSaveProject() {
    function init() {
        const btn = document.getElementById("saveProjectBtn");
        if (!btn) return;

        btn.addEventListener("click", async () => {
            // Cek data analysis tersedia
            if (typeof currentAnalysisData === "undefined" || !currentAnalysisData) {
                return notify("Belum ada data analisis", "error");
            }
            if (!currentAnalysisData.inputPath) {
                return notify("Path video tidak tersedia. Coba analisis ulang.", "error");
            }

            // Prompt nama proyek
            const def = "Proyek " + new Date().toLocaleString("id-ID", {
                day: "2-digit", month: "short",
                hour: "2-digit", minute: "2-digit",
            });
            const name = await window._showProjectNameModal(def);
            if (!name || !name.trim()) return;

            const orig = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

            try {
                const headers = { "Content-Type": "application/json" };
                if (typeof AUTH_TOKEN !== "undefined" && AUTH_TOKEN)
                    headers["Authorization"] = "Bearer " + AUTH_TOKEN;

                const payload = {
                    name: name.trim(),
                    inputVideoPath: currentAnalysisData.inputPath,
                    analysisJson: currentAnalysisData,
                    translatedWords: currentAnalysisData.translatedWords || null,
                    translatedSegments: currentAnalysisData.translatedSegments || null,
                    translateTarget: currentAnalysisData.translateTarget || null,
                    preset: (document.getElementById("qualitySelect") || {}).value || currentAnalysisData.preset || "720p",
                    enableBurnSubtitle: currentAnalysisData.enableBurnSubtitle !== false,
                    addWatermark: currentAnalysisData.addWatermark !== false,
                };

                const url = currentProjectId ? "/api/projects/" + currentProjectId : "/api/projects";
                const method = currentProjectId ? "PUT" : "POST";

                const res = await fetch(url, {
                    method: method,
                    headers: headers,
                    credentials: "same-origin",
                    body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.error || ("HTTP " + res.status));
                }

                if (data.projectId) currentProjectId = data.projectId;
                notify("ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Proyek " + (method === "PUT" ? "diperbarui" : "tersimpan") + "!", "success");
            } catch (e) {
                console.error("[SaveProject]", e);
                notify("Gagal simpan: " + e.message, "error");
            } finally {
                btn.disabled = false;
                btn.innerHTML = orig;
            }
        });

        console.log("[SaveProject] Handler ready");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

function notify(msg, type) {
    try {
        if (type === "error" && typeof toastError === "function") return toastError(msg);
        if (type === "success" && typeof toastSuccess === "function") return toastSuccess(msg);
    } catch (e) {}
    window.alert(msg);
}


/* ============================================================
   V1.0.0: LOAD PROJECT DARI URL (?project=xxx) ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â FIX v2
   ============================================================ */
(function initLoadProject() {
    function run() {
        const params = new URLSearchParams(window.location.search);
        const projectId = params.get("project");
        if (!projectId) return;

        // V9.13.0: Skip ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â biar autoclip.js yang handle di halaman autoclip
        if (window.location.pathname.indexOf('autoclip') !== -1) {
            console.log("[LoadProject] Skip ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â autoclip page");
            return;
        }

        console.log("[LoadProject] Detected project:", projectId);

        const editorEl = document.getElementById("editorContainer");
        if (editorEl) {
            editorEl.style.display = "block";
            // V1.0.3: JANGAN overwrite innerHTML (rusak struktur editor)
        }

        fetch(API_URL + "/projects/" + encodeURIComponent(projectId) + "/use", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + (typeof AUTH_TOKEN !== "undefined" ? AUTH_TOKEN : ""),
            },
            credentials: "same-origin",
        })
        .then(r => r.json())
        .then(data => {
            if (!data.success) throw new Error(data.error || "Gagal load proyek");

            // ÃƒÂ¢Ã‚Â­Ã‚Â Set LOCAL variables ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â SAMA seperti flow analyze sukses
            currentAnalysisId = data.analysisId;
            currentAnalysisData = JSON.parse(JSON.stringify(data.analysis));
            if (!currentAnalysisData.inputPath) currentAnalysisData.inputPath = data.analysis.inputPath;
            currentAnalysisData.analysisId = data.analysisId;
            if (data.translatedWords) currentAnalysisData.translatedWords = data.translatedWords;
            if (data.translatedSegments) currentAnalysisData.translatedSegments = data.translatedSegments;
            if (data.translateTarget) currentAnalysisData.translateTarget = data.translateTarget;

            originalAnalysisData = JSON.parse(JSON.stringify(currentAnalysisData));
            currentProjectId = data.projectId;

            // Reset semua state seperti flow analyze
            editHistory = [];
            selectedSegmentIdx = -1;
            previewMode = false;
            _skipInProgress = false;
            currentQuickMode = "aggressive";
            zoomLevel = 1;
            _filmstripCacheKey = null;

            activeCategoryFilters = {};
            const uniqueCats = new Set((currentAnalysisData.segments || []).map(s => (s.source || "unknown").toLowerCase()));
            uniqueCats.forEach(c => { activeCategoryFilters[c] = true; });

            // Hide progress container
            const progressEl = document.getElementById("progressContainer");
            if (progressEl) progressEl.style.display = "none";

            // Set video src ke stream URL
            if (editorVideo) {
                const t = (typeof AUTH_TOKEN !== "undefined" && AUTH_TOKEN) ? AUTH_TOKEN : "";
                editorVideo.src = API_URL + "/projects/" + encodeURIComponent(data.projectId) + "/video?token=" + encodeURIComponent(t);
            }

            console.log("[LoadProject] State OK:", {
                analysisId: currentAnalysisId,
                segments: (currentAnalysisData.segments || []).length,
                editorContainer: !!editorContainer,
                editorVideo: !!editorVideo,
            });

            if (typeof renderEditor === "function") {
                renderEditor(currentAnalysisData);
                console.log("[LoadProject] renderEditor dipanggil");

            // V1.0.16: Sync state internal editor-timeline.js
            setTimeout(function() {
                try {
                    if (window.CliporaEditor && typeof window.CliporaEditor.start === 'function') {
                        console.log("[LoadProject] Sync state via CliporaEditor.start()");
                        window.CliporaEditor.start(currentAnalysisData);
                        setTimeout(function() {
                            var st = window.CliporaEditor.getState();
                            console.log("[LoadProject] Verify state:", {
                                segments: st.segments ? st.segments.length : 0,
                                duration: st.duration,
                            });
                        }, 300);
                    } else {
                        console.warn("[LoadProject] CliporaEditor.start tidak ada");
                    }
                } catch (e) {
                    console.error("[LoadProject] Sync error:", e);
                }
            }, 500);
            // V1.0.9: Force updateStats + ensure data lengkap
            setTimeout(() => {
                try {
                    if (typeof updateStats === "function") {
                        updateStats();
                        const statsEl = document.querySelector(".te-stats");
                        console.log("[Project] updateStats() ->", statsEl ? statsEl.textContent.trim().slice(0, 100) : "no .te-stats");
                        if (statsEl && statsEl.textContent.trim().length < 5) {
                            const dur = currentAnalysisData.duration || 0;
                            const cuts = (currentAnalysisData.segments || []).filter(x => x.enabled !== false);
                            const cutDur = cuts.reduce((sum, c) => sum + ((c.end||0) - (c.start||0)), 0);
                            const newDur = Math.max(0, dur - cutDur);
                            const pct = dur > 0 ? Math.round((cutDur / dur) * 100) : 0;
                            const total = (currentAnalysisData.segments || []).length;
                            statsEl.innerHTML = '<div style="display:flex;gap:20px;flex-wrap:wrap;padding:12px 0;">'
                                + '<div><div style="font-size:0.7rem;color:#94a3b8;">DURASI ASLI</div><div style="font-size:1.3rem;font-weight:700;color:#fff;">' + dur.toFixed(2) + 's</div></div>'
                                + '<div><div style="font-size:0.7rem;color:#94a3b8;">AKAN DIPOTONG</div><div style="font-size:1.3rem;font-weight:700;color:#ef4444;">' + cutDur.toFixed(2) + 's (' + pct + '%)</div></div>'
                                + '<div><div style="font-size:0.7rem;color:#94a3b8;">DURASI BARU</div><div style="font-size:1.3rem;font-weight:700;color:#22c55e;">' + newDur.toFixed(2) + 's</div></div>'
                                + '<div><div style="font-size:0.7rem;color:#94a3b8;">SEGMEN AKTIF</div><div style="font-size:1.3rem;font-weight:700;color:#a78bfa;">' + cuts.length + '/' + total + '</div></div>'
                                + '</div>';
                            console.log("[Project] stats manual injected");
                        }
                    }
                } catch(e) { console.error("[Project] stats fix error:", e); }
            }, 800);;
            setTimeout(() => {
                const ec = document.getElementById("editorContainer");
                if (ec) {
                    ec.style.display = "block";
                    // V1.0.2: Unhide parents
let _p = ec.parentElement, _d = 0;
while (_p && _p !== document.body && _d < 10) {
    if (getComputedStyle(_p).display === "none") {
        _p.style.display = "block";
        console.log("[LoadProject] Show parent:", _p.className);
    }
    _p = _p.parentElement; _d++;
}
ec.scrollIntoView({ behavior: "smooth", block: "start" });
                    console.log("[LoadProject] Scroll ke editor");

                // V1.0.11: delayed scroll ke player
                setTimeout(function() {
                    const pw = document.querySelector(".te-player-wrap");
                    const ec = document.getElementById("editorContainer");
                    const target = pw || ec;
                    if (target) {
                        target.scrollIntoView({ behavior: "smooth", block: "start" });
                        // V1.0.11: offset setelah scroll ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â geser ke atas biar stats kelihatan
                        setTimeout(function() {
                            window.scrollBy({ top: -80, behavior: "smooth" });
                        }, 400);
                        console.log("[LoadProject] Scroll ke player + offset");
                    // V1.0.12: Force loadFilmstrip setelah video ready
                    (function triggerFilmstrip() {
                        const v = document.getElementById("editorVideo");
                        if (!v) { console.warn("[Project] video tidak ada, skip filmstrip"); return; }
                        const go = () => {
                            try {
                                if (typeof loadFilmstripStream === "function") {
                                    console.log("[Project] Trigger loadFilmstripStream");
                                    loadFilmstripStream();
                                } else if (typeof loadFilmstrip === "function") {
                                    console.log("[Project] Fallback loadFilmstrip");
                                    loadFilmstrip();
                                } else {
                                    console.warn("[Project] loadFilmstrip tidak ditemukan");
                                }
                            } catch (e) { console.error("[Project] filmstrip error:", e); }
                        };
                        if (v.readyState >= 2) {
                            console.log("[Project] video ready (readyState=" + v.readyState + "), langsung filmstrip");
                            setTimeout(go, 300);
                        } else {
                            console.log("[Project] tunggu video loaded, readyState=" + v.readyState);
                            v.addEventListener("loadeddata", function onLoad() {
                                v.removeEventListener("loadeddata", onLoad);
                                console.log("[Project] video loaded, trigger filmstrip");
                                setTimeout(go, 500);
                            });
                            // Fallback: kalau video tidak loaded dalam 5 detik
                            setTimeout(function() {
                                if (v.readyState >= 2) return;
                                console.log("[Project] timeout, coba filmstrip manual");
                                go();
                            }, 5000);
                        }
                    })();
                    }
                }, 1500);
                // V1.0.5: PROJECT MODE ROBUST ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â hide all siblings of editor
                (function enterProjectMode() {
                    document.body.classList.add("project-mode");
                    const editorEl = document.getElementById("editorContainer");
                    if (!editorEl) { console.warn("[Project] editor tidak ketemu"); return; }
                    let hidden = 0;
                    let node = editorEl;
                    while (node && node !== document.body) {
                        const parent = node.parentElement;
                        if (!parent) break;
                        Array.from(parent.children).forEach(child => {
                            if (child === node) return;
                            if (child.contains(node)) return;
                            const tag = child.tagName;
                            if (tag === "SCRIPT" || tag === "STYLE") return;
                            if (tag === "HEADER" || tag === "NAV" || tag === "FOOTER") return;
                            if (child.id && /modal|toast|notification|popup|overlay/i.test(child.id)) return;
                            if (child.className && /modal|toast|notification|popup|overlay/i.test(String(child.className))) return;
                            // V1.0.6: Whitelist ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â jangan hide elemen yang berhubungan dengan editor/player
                const _wl = /editor|player|te-|preview|timeline|segment|video|controls|play|subtitle|translate/i;
                const _cid = String(child.id || "");
                const _ccl = String(child.className || "");
                const _ctag = child.tagName;
                const _isWhitelisted = _wl.test(_cid) || _wl.test(_ccl)
                    || _ctag === "VIDEO" || _ctag === "AUDIO"
                    || child.querySelector("video") !== null
                    || child.querySelector(".te-player-wrap, #editorVideo, #teTimeline") !== null;
                if (_isWhitelisted) return;
                if (child.offsetHeight > 0) {
                                child.style.display = "none";
                                hidden++;
                                console.log("[Project] hide:", tag, child.id || (child.className && String(child.className).slice(0,40)));
                            }
                        });
                        node = parent;
                    }
                    // V1.0.6: Force semua elemen dalam editorContainer + player visible
                    const _force = ["editorContainer", "te-player-wrap", "editorVideo", "teTimeline", "teFilmstrip", "tePlayhead", "qualitySelect", "renderFinalBtn"];
                    _force.forEach(id => {
                        const el = document.getElementById(id);
                        if (el) {
                            el.style.display = "";
                            el.style.visibility = "visible";
                            if (el.offsetParent === null) el.style.display = "block";
                        }
                    });
                    // Cari juga elemen ber-class .te-*
                    document.querySelectorAll("[class*='te-']").forEach(el => {
                        if (el.style.display === "none" && !el.classList.contains("te-hidden")) {
                            el.style.display = "";
                        }
                    });
                    console.log("[Project] Force-visible editor elements");
                    // V1.0.15: Hide panel translate LAMA + section fitur di luar editor
                    (function hideExtra() {
                        var n = 0;
                        // Hide by text content (paling fleksibel)
                        var hideTexts = ["Terjemahan Multi-Bahasa", "AI Voice Over", "Tulis script untuk voice over"];
                        document.querySelectorAll("div, section").forEach(function(el) {
                            if (el.offsetHeight <= 50) return;
                            var txt = (el.textContent || "").trim().slice(0, 100);
                            for (var i = 0; i < hideTexts.length; i++) {
                                if (txt.indexOf(hideTexts[i]) === 0) {
                                    var target = el;
                                    var p = el.parentElement;
                                    if (p && p.offsetHeight < 500 && p.children.length <= 3) target = p;
                                    target.style.display = "none";
                                    n++;
                                    console.log("[Project] hide text:", hideTexts[i]);
                                    break;
                                }
                            }
                        });
                        console.log("[Project] Hide extra: " + n);
                    })();
                    console.log("[Project] Project mode aktif ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â " + hidden + " element disembunyikan");
                    
                                                        })();
                                }
            }, 500);
            } else {
                console.error("[LoadProject] renderEditor TIDAK ADA");
            }

            if (typeof toastSuccess === "function") toastSuccess("ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Å¡ Proyek dimuat");
        })
        .catch(e => {
            console.error("[LoadProject] Error:", e);
            if (editorEl) {
                editorEl.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#ef4444;"><i class="fas fa-exclamation-triangle" style="font-size:2rem;"></i><h3 style="margin:14px 0 6px;color:#fff;">Gagal Memuat Proyek</h3><p style="font-size:0.9rem;">' + e.message + '</p><a href="projects.php" style="display:inline-flex;align-items:center;gap:8px;margin-top:20px;padding:10px 20px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;"><i class="fas fa-arrow-left"></i> Kembali</a></div>';
            }
            if (typeof toastError === "function") toastError(e.message);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => setTimeout(run, 300));
    } else {
        setTimeout(run, 300);
    }
})();

/* ============================================================
   V1.0.13: loadFilmstripStream ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â versi project mode (URL)
   ============================================================ */
async function loadFilmstripStream() {
    const strip = document.getElementById("teFilmstrip");
    const video = document.getElementById("editorVideo");
    if (!strip) { console.log("[FilmstripStream] strip element tidak ada"); return; }
    if (!video || !video.src || video.src.length < 5) {
        console.log("[FilmstripStream] video URL tidak ada");
        return;
    }
    const url = video.src;
    const cacheKey = "stream_" + url.replace(/[^a-z0-9]/gi, "_").slice(-60);
    if (strip.dataset.cacheKey === cacheKey && strip.querySelector("img")) {
        console.log("[FilmstripStream] pakai cache");
        return;
    }
    strip.innerHTML = '<div class="te-filmstrip-loading"><i class="fas fa-spinner fa-spin"></i> Loading preview...</div>';
    try {
        const thumbs = await extractThumbnailsFromUrl(url, 12);
        if (!thumbs || !thumbs.length) {
            strip.innerHTML = "";
            console.log("[FilmstripStream] 0 thumbs");
            return;
        }
        strip.innerHTML = thumbs.map(function(src) { return '<img src="' + src + '" alt="">'; }).join("");
        strip.dataset.cacheKey = cacheKey;
        console.log("ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¬ [FilmstripStream] Loaded " + thumbs.length + " thumbnails");
    } catch (e) {
        console.warn("[FilmstripStream] Failed:", e);
        strip.innerHTML = "";
    }
}

function extractThumbnailsFromUrl(url, count) {
    return new Promise(function(resolve, reject) {
        var video = document.createElement("video");
        video.preload = "auto";
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = "anonymous";
        video.src = url;
        var thumbs = [];
        var timeoutId = setTimeout(function() {
            try { video.remove(); } catch (e) {}
            reject(new Error("Timeout"));
        }, 20000);
        video.addEventListener("loadedmetadata", async function() {
            var dur = video.duration;
            if (!dur || !isFinite(dur) || dur <= 0) {
                clearTimeout(timeoutId);
                try { video.remove(); } catch (e) {}
                reject(new Error("Duration tidak valid"));
                return;
            }
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            canvas.width = 160;
            canvas.height = 90;
            for (var i = 0; i < count; i++) {
                var t = (i / count) * dur;
                try {
                    video.currentTime = t;
                    await new Promise(function(r) {
                        var once = function() { video.removeEventListener("seeked", once); r(); };
                        video.addEventListener("seeked", once);
                        setTimeout(once, 2000);
                    });
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    thumbs.push(canvas.toDataURL("image/jpeg", 0.6));
                } catch (e) {
                    console.warn("[FilmstripStream] Frame " + i + " error: " + e.message);
                }
            }
            clearTimeout(timeoutId);
            try { video.remove(); } catch (e) {}
            resolve(thumbs);
        });
        video.addEventListener("error", function() {
            clearTimeout(timeoutId);
            try { video.remove(); } catch (e) {}
            reject(new Error("Video error code: " + (video.error ? video.error.code : "?")));
        });
        video.load();
    });
}

/* ============================================================
   V1.2.0: HIDE rapikan section saat editor aktif
   ============================================================ */
(function hideRapikanSection() {
    'use strict';

    function findEditor() {
        return document.getElementById('editorContainer');
    }

      function applyHide(force) {
        var ec = findEditor();

        // V1.15.0: Cek progress/result DULU sebelum cek isVisible
        var progressEl = document.getElementById('progressContainer');
        var resultEl = document.getElementById('resultBox');
                // Cek pakai style.display saja ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â offsetHeight bisa 0 saat baru muncul
                // V1.16.0: Cek lebih spesifik ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â cek offsetHeight DAN style.display
        var progressVisible = progressEl && progressEl.offsetHeight > 0 && progressEl.style.display !== 'none';
        var resultVisible = resultEl && resultEl.offsetHeight > 0 && resultEl.style.display !== 'none';

        if (progressVisible || resultVisible) {
            console.log('[HideRapikan] V1.15.0 SKIP TOTAL ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â progress/result aktif');
            ['.index-role-banner', '.index-hero', '.hero', '.power-sell-section'].forEach(function(sel) {
                document.querySelectorAll(sel).forEach(function(el) {
                    if (!el.getAttribute('data-hidden-by-editor')) {
                        el.style.display = 'none';
                        el.setAttribute('data-hidden-by-editor', '1');
                    }
                });
            });
            return;
        }

        var isVisible = force === true || (ec && (ec.style.display === 'block' || ec.offsetHeight > 0));
        if (!isVisible) return;
        if (!force && document.body.classList.contains('_editorActive')) return;

        document.body.classList.add('_editorActive');
        console.log('[HideRapikan] Editor aktif ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â hide section rapikan');

        // Sembunyikan SEMUA elemen yang ada sebelum editorContainer
        // (kecuali navbar, header)
        var editorTop = ec.offsetTop;
        var body = document.body;
        var nav = document.querySelector('nav, header, .navbar, .top-nav');

        // Walk semua sibling & ancestor di atas editor
        var all = document.querySelectorAll('body > *, body > * > *, main > *, .container > *, .main-content > *');
        var hiddenCount = 0;
        all.forEach(function(el) {
            if (!el || el.contains(ec) || el === ec) return;
            if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
            if (el.tagName === 'NAV' || el.tagName === 'HEADER' || el.tagName === 'FOOTER') return;
            if (nav && nav.contains(el)) return;
            if (el.id && /editor|modal|toast|notification|zoom|undo|tip/i.test(el.id)) return;
            if (el.className && /modal|toast|notification|editor|zoom|undo/i.test(String(el.className))) return;

            // Cek apakah posisinya di atas editor
            var rect = el.getBoundingClientRect();
            var editorRect = ec.getBoundingClientRect();
            if (rect.bottom <= editorRect.top + 50 && rect.height > 30) {
                // Cek apakah ini "section rapikan" ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â punya tombol Rapikan atau form upload
                var txt = (el.textContent || '').toLowerCase();
                var hasRapikan = txt.indexOf('rapikan video') !== -1 || txt.indexOf('upload video') !== -1;
                var hasWhisper = txt.indexOf('whisper') !== -1 || txt.indexOf('voice over') !== -1;
                var hasTranslate = txt.indexOf('terjemahan multi') !== -1;
                var hasWatermark = txt.indexOf('watermark') !== -1;
                var hasUpload = el.querySelector('input[type="file"], .upload-area, #rapikanBtn') !== null;

                if (hasRapikan || hasWhisper || hasTranslate || hasWatermark || hasUpload) {
                    el.style.display = 'none';
                    el.setAttribute('data-hidden-by-editor', '1');
                    hiddenCount++;
                    console.log('[HideRapikan] Hide:', el.tagName, el.id || el.className.slice(0, 40));
                }
            }
        });

                // Juga hide tombol rapikan secara langsung
        ['rapikanBtn', 'uploadArea', 'dropZone'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) { el.style.display = 'none'; hiddenCount++; }
        });

        // V1.9.0: Hide checkbox Subtitle, Voice Over, Watermark, dll
        // Semua label checkbox di panel kontrol
        document.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
            var parent = cb.closest('.setting-group, .control-panel, .card, label, .form-group, .option-row, section, .panel');
            if (!parent || parent.contains(ec)) return;
            if (parent.getAttribute('data-hidden-by-editor')) return;
            parent.style.display = 'none';
            parent.setAttribute('data-hidden-by-editor', '1');
            hiddenCount++;
            console.log('[HideRapikan] V1.9.0 hide checkbox parent');
        });

        // Hide semua element yang mengandung text "Subtitle" (kecuali di editor)
        document.querySelectorAll('label, div, span, section').forEach(function(el) {
            if (el.contains(ec)) return;
            if (el.getAttribute('data-hidden-by-editor')) return;
            if (el.children.length > 5) return; // skip container besar
            var txt = (el.textContent || '').trim();
            if (txt.length > 100) return; // skip text panjang
            if (txt === 'Subtitle' || 
                txt === 'Voice Over' || 
                txt === 'Watermark' ||
                txt.indexOf('Subtitle') === 0 ||
                txt.indexOf('AI Voice Over') === 0) {
                var rect = el.getBoundingClientRect();
                if (rect.height > 10 && rect.width > 50) {
                    // Cari wrapper-nya
                    var wrapper = el.closest('.setting-group, .control-panel, .card, .panel, section, .option-row');
                    if (!wrapper || wrapper === document.body) wrapper = el;
                    wrapper.style.display = 'none';
                    wrapper.setAttribute('data-hidden-by-editor', '1');
                    hiddenCount++;
                    console.log('[HideRapikan] V1.9.0 hide by text:', txt.substring(0, 30));
                }
            }
        });
                // V1.9.0: Hide panel pengaturan & kontrol saat proses
                var panelSelectors = [
            '.setting-group',       // Panel "Kekuatan Potong"
            '.control-panel',
            '#controlPanel',
            '.settings-section',
            '.card',
            '.panel'
        ];
        panelSelectors.forEach(function(sel) {
            document.querySelectorAll(sel).forEach(function(el) {
                if (el.contains(ec)) return; // jangan hide editor
                // V1.12.0: JANGAN hide kalau ada progress/result di dalamnya
                if (el.contains(document.getElementById('progressContainer'))) return;
                if (el.contains(document.getElementById('resultBox'))) return;
                if (el.id === 'controlPanel' && 
                    (document.getElementById('progressContainer')?.style.display === 'block' ||
                     document.getElementById('resultBox')?.style.display === 'block')) {
                    // Kalau controlPanel ada progress/result, jangan hide
                    // Tapi hide children-nya kecuali progress & result
                    el.querySelectorAll('.setting-group, .panel-title, .info-box').forEach(function(child) {
                        if (child.contains(ec)) return;
                        if (child.getAttribute('data-hidden-by-editor')) return;
                        child.style.display = 'none';
                        child.setAttribute('data-hidden-by-editor', '1');
                        hiddenCount++;
                    });
                    return; // jangan hide controlPanel secara keseluruhan
                }
                if (el.getAttribute('data-hidden-by-editor')) return;
                var rect = el.getBoundingClientRect();
                if (rect.height > 50 && rect.width > 200) {
                    el.style.display = 'none';
                    el.setAttribute('data-hidden-by-editor', '1');
                    hiddenCount++;
                    console.log('[HideRapikan] V1.9.0 hide panel:', sel);
                }
            });
        });
        // V1.2.1: Hide video preview player di atas editor + info file
        ['videoPreview', 'previewVideo', 'previewContainer', 'videoInfo', 
         'fileInfo', 'previewPlayer', 'videoPlayer', 'previewSection',
         'videoPreviewContainer', 'uploadedVideoInfo', 'fileMeta'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el && el.offsetHeight > 0) {
                el.style.display = 'none';
                el.setAttribute('data-hidden-by-editor', '1');
                hiddenCount++;
                console.log('[HideRapikan] Hide by id:', id);
            }
        });

        // Hide video element di atas editor (kecuali editorVideo)
        document.querySelectorAll('video').forEach(function(v) {
            if (v.id === 'editorVideo') return;
            if (ec.contains(v)) return;
            var rect = v.getBoundingClientRect();
            var editorRect = ec.getBoundingClientRect();
            if (rect.bottom <= editorRect.top + 50 && rect.height > 50) {
                // Cari container-nya
                var container = v.closest('.preview, .preview-section, .preview-container, .video-wrapper, .video-preview, [class*="preview"]');
                if (!container) container = v.parentElement;
                if (container && container.offsetHeight > 0) {
                    container.style.display = 'none';
                    container.setAttribute('data-hidden-by-editor', '1');
                    hiddenCount++;
                    console.log('[HideRapikan] Hide video preview');
                }
            }
        });

        // V1.2.2: Hide SEMUA section di atas editor (brute force)
        // Walk semua element yang berada di atas editor dan bukan navbar/footer
        (function hideAllAbove() {
            var editorRect = ec.getBoundingClientRect();
            var editorTopY = editorRect.top + window.scrollY;
            
            // Ambil semua element di body
            var all = document.querySelectorAll('body *');
            var candidates = [];
            all.forEach(function(el) {
                if (el === ec || el.contains(ec)) return;
                if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'NAV' || el.tagName === 'HEADER' || el.tagName === 'FOOTER' || el.tagName === 'BODY' || el.tagName === 'HTML') return;
                if (el.id && /editor|modal|toast|notif|zoom|undo|tip|navbar|nav|footer|header/i.test(el.id)) return;
                if (el.className && /editor|modal|toast|notif|zoom|undo|navbar|nav-bar|nav-|footer|header|container|wrapper/i.test(String(el.className))) return;
                
                var rect = el.getBoundingClientRect();
                var topY = rect.top + window.scrollY;
                var bottomY = rect.bottom + window.scrollY;
                
                // Hanya element yang SELESAI sebelum editor mulai
                if (bottomY < editorTopY - 20 && rect.height > 20 && rect.width > 100) {
                    // Skip kalau punya tag FORM, INPUT penting
                    if (el.tagName === 'FORM' && el.querySelector('input[type="text"], input[type="email"]')) return;
                    candidates.push({ el: el, height: rect.height, depth: 0 });
                }
            });
            
            // Ambil hanya top-level element (yang paling luar) ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â hapus nested
            var final = [];
            candidates.sort(function(a, b) { return b.height - a.height; });
            candidates.forEach(function(c) {
                var isNested = final.some(function(f) { return f.el.contains(c.el); });
                if (!isNested) final.push(c);
            });
            
            var n = 0;
            final.forEach(function(c) {
                // Cek text content ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â apakah ini "section rapikan"
                var txt = (c.el.textContent || '').toLowerCase();
                var isRapikanSection = 
                    txt.indexOf('pengaturan') !== -1 ||
                    txt.indexOf('cara kerja ai') !== -1 ||
                    txt.indexOf('voice over') !== -1 ||
                    txt.indexOf('terjemahan multi') !== -1 ||
                    txt.indexOf('watermark') !== -1 ||
                    txt.indexOf('whisper') !== -1 ||
                    txt.indexOf('rapikan video') !== -1 ||
                    txt.indexOf('upload video') !== -1 ||
                    txt.indexOf('subtitle otomatis') !== -1 ||
                    txt.indexOf('model whisper') !== -1;
                
                if (isRapikanSection) {
                    c.el.style.display = 'none';
                    c.el.setAttribute('data-hidden-by-editor', '1');
                    n++;
                    console.log('[HideRapikan] V1.2.2 hide:', c.el.tagName, (c.el.className || '').slice(0, 30) || c.el.id);
                }
            });
            hiddenCount += n;
            console.log('[HideRapikan] V1.2.2 hidden: ' + n);
        })();

        // V1.5.0: Hide by text content ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â deteksi section rapikan secara robust
        (function hideByText() {
            var hideTexts = [
                'AI Voice Over',
                'Terjemahan Multi-Bahasa',
                'Model Whisper',
                'Whisper Model',
                'Video akan memiliki watermark',
                'Cara Kerja AI',
                // V1.9.0: Hide panel kontrol saat progress
                'Kekuatan Potong',
                'Content Creator Mode',
                'AI Deteksi Kata Berulang',
                'Content Creator (Paling Rapi)'
            ];
            var hidden = 0;
            var candidates = document.querySelectorAll('div, section, label');
            candidates.forEach(function(el) {
                if (el.contains(ec)) return;
                if (el.getAttribute('data-hidden-by-editor')) return;
                if (el.offsetHeight <= 10) return;

                var txt = (el.textContent || '').trim().slice(0, 200);
                for (var i = 0; i < hideTexts.length; i++) {
                    if (txt.indexOf(hideTexts[i]) !== -1) {
                        // Cari wrapper terdekat
                        var wrapper = el.closest('.setting-group, .section-group, .card, section');
                        if (!wrapper || wrapper === document.body) wrapper = el;
                        // Naik 2 level kalau perlu
                        if (wrapper.parentElement && wrapper.parentElement.children.length <= 3
                            && wrapper.parentElement.offsetHeight < 500) {
                            wrapper = wrapper.parentElement;
                        }
                        if (wrapper.offsetHeight > 10 && !wrapper.contains(ec)) {
                            wrapper.style.display = 'none';
                            wrapper.setAttribute('data-hidden-by-editor', '1');
                            hidden++;
                            console.log('[HideRapikan] V1.5.0 hide by text: ' + hideTexts[i]);
                            break;
                        }
                    }
                }
            });
            hiddenCount += hidden;
            console.log('[HideRapikan] V1.5.0 hidden by text: ' + hidden);
        })();

        // Hide section/file info yang mengandung ".mp4" atau durasi
        document.querySelectorAll('div, section').forEach(function(el) {
            if (el.contains(ec)) return;
            if (el.getAttribute('data-hidden-by-editor')) return;
            var rect = el.getBoundingClientRect();
            var editorRect = ec.getBoundingClientRect();
            if (rect.bottom > editorRect.top + 50) return;
            if (rect.height < 30) return;
            
            var txt = (el.textContent || '').trim();
            // Cek pattern: file .mp4 + size/duration
            if (/\\.(mp4|mov|avi|mkv)/i.test(txt) && /(MB|GB|KB|m\\s*\\d+s)/i.test(txt) && txt.length < 200) {
                el.style.display = 'none';
                el.setAttribute('data-hidden-by-editor', '1');
                hiddenCount++;
                console.log('[HideRapikan] Hide file info block');
            }
        });

        // Hide semua .section / .card di atas editor
        document.querySelectorAll('.section, .card, .panel, .settings-section, .setting-group, .voiceover-section, .voice-over-section').forEach(function(el) {
            if (el.contains(ec)) return;
            var rect = el.getBoundingClientRect();
            var editorRect = ec.getBoundingClientRect();
            if (rect.bottom <= editorRect.top + 50 && rect.height > 30) {
                el.style.display = 'none';
                el.setAttribute('data-hidden-by-editor', '1');
                hiddenCount++;
            }
        });

        console.log('[HideRapikan] Total disembunyikan: ' + hiddenCount);

        // Scroll ke editor
        setTimeout(function() {
            ec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
    }

    function restoreShow() {
        document.body.classList.remove('_editorActive');
        document.querySelectorAll('[data-hidden-by-editor="1"]').forEach(function(el) {
            el.style.display = '';
            el.removeAttribute('data-hidden-by-editor');
        });
        ['rapikanBtn', 'uploadArea', 'dropZone'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.style.display = '';
        });
        console.log('[HideRapikan] Restore semua section');
    }

        function watch() {
        var ec = document.getElementById('editorContainer');
        if (!ec) { setTimeout(watch, 800); return; }

        console.log('[HideRapikan] Init');

        // Initial check
        applyHide();
        
        // Watch perubahan display editorContainer
        var obs = new MutationObserver(function() {
            var isVisible = ec.style.display === 'block' || ec.offsetHeight > 0;
            if (isVisible && !document.body.classList.contains('_editorActive')) {
                applyHide();
            } else if (!isVisible && document.body.classList.contains('_editorActive')) {
                // V1.6.0: Cek progressContainer + resultBox (halaman hasil)
                setTimeout(function() {
                    var pc = document.getElementById('progressContainer');
                    var rb = document.getElementById('resultBox');
                    var isRendering = pc && (pc.style.display === 'block' || pc.offsetHeight > 0);
                    var isResultVisible = rb && (rb.style.display === 'block' || rb.offsetHeight > 0);
                    
                    if (isRendering) {
                        console.log('[HideRapikan] Skip restore ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â sedang render');
                    } else if (isResultVisible) {
                        console.log('[HideRapikan] Skip restore ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â hasil render tampil');
                    } else {
                        console.log('[HideRapikan] Restore (delay)');
                        restoreShow();
                    }
                }, 400);
            }
        });
        obs.observe(ec, { attributes: true, attributeFilter: ['style'] });

        // Watch perubahan childList (kalau editor muncul dynamic)
        var obs2 = new MutationObserver(function(muts) {
            muts.forEach(function(m) {
                m.addedNodes.forEach(function(n) {
                    if (n.id === 'editorContainer') setTimeout(applyHide, 100);
                });
            });
        });
        obs2.observe(document.body, { childList: true, subtree: true });
        
        // V1.6.0: Watch resultBox ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â kalau muncul, hide section rapikan
        var rb = document.getElementById('resultBox');
        if (rb) {
            var obsRb = new MutationObserver(function() {
                var rbVisible = rb.style.display === 'block' || rb.offsetHeight > 0;
                if (rbVisible) {
                    console.log('[HideRapikan] ResultBox muncul ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â hide section');
                    document.body.classList.add('_renderActive');
                    // Delay sedikit biar section yang baru di-render ke-hide
                    setTimeout(function() { applyHide(true); }, 200);
                    setTimeout(function() { applyHide(true); }, 600);
                }
            });
            obsRb.observe(rb, { attributes: true, attributeFilter: ['style'] });
        }

        // V1.3.0: Render mode ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â hide section saat progressContainer muncul
        var progress = document.getElementById('progressContainer');
        if (progress) {
            console.log('[HideRapikan] Watch progressContainer');
                    var obs3 = new MutationObserver(function() {
            // V1.16.0: Delay cek ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â pastikan style.display sudah ke-update
            setTimeout(function() {
                var isVisible = progress.style.display === 'block' && progress.offsetHeight > 0;
                if (isVisible) {
                    if (!document.body.classList.contains('_renderActive')) {
                        document.body.classList.add('_renderActive');
                        console.log('[HideRapikan] RENDER MODE ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â hide section rapikan');
                        applyHide(true); // force hide
                    }
                } else {
                    // V1.6.0: Cek resultBox sebelum restore
                    var _rb = document.getElementById('resultBox');
                    var _rbVisible = _rb && (_rb.style.display === 'block' || _rb.offsetHeight > 0);
                    if (_rbVisible) {
                        console.log('[HideRapikan] Progress selesai ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â hasil tampil, tetap hide');
                    } else if (document.body.classList.contains('_renderActive')) {
                        document.body.classList.remove('_renderActive');
                        console.log('[HideRapikan] Render selesai ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â restore');
                        var ec = document.getElementById('editorContainer');
                        var editorVisible = ec && (ec.style.display === 'block' || ec.offsetHeight > 0);
                        if (!editorVisible) restoreShow();
                    }
                }
            }, 100); // delay 100ms
        });
            obs3.observe(progress, { attributes: true, attributeFilter: ['style'] });

            // Cek awal
            if (progress.style.display === 'block' || progress.offsetHeight > 0) {
                document.body.classList.add('_renderActive');
                applyHide(true);
            }
        } else {
            console.warn('[HideRapikan] progressContainer tidak ada');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(watch, 1200); });
    } else {
        setTimeout(watch, 1200);
    }
})();


/* ============================================================
   V1.8.0: Nuclear hide ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â detect work mode & result mode
   3 kondisi: analisis berjalan, render berjalan, halaman hasil
   ============================================================ */
/* ============================================================
   V1.8.0: Nuclear hide  HANYA hide marketing elements
   V9.600.0: Fix  jangan hide panel + editor + voice over
   ============================================================ */
(function nuclearHide() {
    // Selector yang DIIZINKAN untuk di-hide (marketing only)
    var MARKETING_SELECTORS = [
        '.index-hero',           // Hero banner
        '.hero',                 // Hero alternatif
        '.index-role-banner-free', // Banner free user
        '.power-sell-section',   // Power sell section
        '.sample-video-btn'      // Sample video button
    ];
    
    // Selector yang DILARANG di-hide (fungsional)
    var PROTECTED_SELECTORS = [
        '.setting-group',        // Panel pengaturan
        '.control-panel',        // Panel utama
        '.timeline-editor-wrap', // Editor timeline
        '.editor-container',     // Editor container
        '.compact-lock-card',    // Voice over lock
        '.info-box',             // Info box
        '.watermark-notice'      // Watermark notice
    ];
    
    function isProtected(el) {
        for (var i = 0; i < PROTECTED_SELECTORS.length; i++) {
            if (el.matches && el.matches(PROTECTED_SELECTORS[i])) {
                return true;
            }
            if (el.closest && el.closest(PROTECTED_SELECTORS[i])) {
                return true;
            }
        }
        return false;
    }
    
    function check() {
        try {
            var rb = document.getElementById('rapikanBtn');
            var pc = document.getElementById('progressContainer');
            var ec = document.getElementById('editorContainer');
            
            var rbVisible = rb && rb.offsetParent !== null;
            var pcVisible = pc && getComputedStyle(pc).display !== 'none';
            var ecVisible = ec && getComputedStyle(ec).display !== 'none';
            
            if (rbVisible || pcVisible || ecVisible) {
                if (!document.body.classList.contains('_v18active')) {
                    document.body.classList.add('_v18active');
                    console.log('[V1.8.0] Work mode aktif');
                }
                
                // Hide HANYA marketing elements
                MARKETING_SELECTORS.forEach(function(selector) {
                    try {
                        document.querySelectorAll(selector).forEach(function(el) {
                            // Skip kalau protected
                            if (isProtected(el)) return;
                            
                            if (el.getAttribute('data-v18-hidden') !== '1') {
                                el.style.setProperty('display', 'none', 'important');
                                el.setAttribute('data-v18-hidden', '1');
                                console.log('[V1.8.0] Hide (marketing):', el.tagName, (el.className || '').slice(0, 40));
                            }
                        });
                    } catch (e) {}
                });
            } else {
                if (document.body.classList.contains('_v18active')) {
                    document.body.classList.remove('_v18active');
                    console.log('[V1.8.0] Work selesai  restore');
                    
                    // Restore marketing elements
                    MARKETING_SELECTORS.forEach(function(selector) {
                        try {
                            document.querySelectorAll(selector).forEach(function(el) {
                                if (el.getAttribute('data-v18-hidden') === '1') {
                                    el.style.removeProperty('display');
                                    el.removeAttribute('data-v18-hidden');
                                }
                            });
                        } catch (e) {}
                    });
                }
            }
        } catch (e) {
            console.warn('[V1.8.0] Error:', e.message);
        }
    }
    
    setInterval(check, 500);
    setTimeout(check, 500);
    console.log('[V1.8.0] Nuclear hide aktif (fixed v9.600.0)');
})();


/* ============================================================
   V9.52.1: Orange theme fix
   ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Override semua warna ungu/cyan di halaman manapun
   ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Inject via JS biar tidak sentuh PHP
   ============================================================ */
(function initOrangeThemeFix() {
    'use strict';
    if (document.getElementById('clipora-orange-theme')) return;

    var css = `
        /* Empty state icon folder ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ orange */
        .empty-state i, .projects-empty i, .ac-projects-empty i,
        .empty-state .fas.fa-folder, .empty-state .fas.fa-folder-open,
        .fas.fa-folder::before, .fas.fa-folder-open::before {
            color: #f59e0b !important;
        }
        
        /* Icon ungu di empty state */
        .empty-state svg, .projects-empty svg {
            stroke: #f59e0b !important;
            fill: #f59e0b !important;
        }

        /* Tombol gradient orange-cyan ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ orange */
        .btn-primary,
        .btn-new-project,
        .btn-create-project,
        button[onclick*="createProject"],
        button[onclick*="openProjectModal"],
        button[onclick*="newProject"],
        .empty-state .btn,
        .empty-state button {
            background: linear-gradient(135deg, #f59e0b, #d97706) !important;
            color: #fff !important;
            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4) !important;
            border: none !important;
        }
        
        .btn-primary:hover,
        .btn-new-project:hover,
        .btn-create-project:hover,
        .empty-state .btn:hover {
            background: linear-gradient(135deg, #fbbf24, #f59e0b) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 10px 28px rgba(245, 158, 11, 0.55) !important;
        }

        /* Border dashed empty state ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ orange */
        .empty-state,
        .projects-empty,
        .ac-projects-empty {
            border-color: rgba(245, 158, 11, 0.25) !important;
        }

        /* Search input focus */
        input[type="search"]:focus,
        input[placeholder*="Cari"]:focus,
        .projects-search input:focus {
            border-color: #f59e0b !important;
            box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.12) !important;
        }

        /* Card hover */
        .ac-proj-card:hover,
        .project-card:hover {
            border-color: rgba(245, 158, 11, 0.4) !important;
            box-shadow: 0 12px 32px rgba(245, 158, 11, 0.15) !important;
        }

        /* Progress bar fill */
        .ac-proj-bar-fill,
        .progress-fill {
            background: linear-gradient(90deg, #f59e0b, #d97706) !important;
        }

        /* Auto-clip hero title */
        .autoclip-hero h1 span {
            background: linear-gradient(135deg, #fbbf24, #f59e0b, #d97706) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
        }

        /* Upload zone */
        .ac-upload-zone,
        #acUploadZone {
            border-color: rgba(245, 158, 11, 0.35) !important;
        }
        
        .ac-upload-zone:hover,
        #acUploadZone:hover,
        .ac-upload-zone.dragover,
        #acUploadZone.dragover {
            border-color: #f59e0b !important;
            background: rgba(245, 158, 11, 0.05) !important;
        }

        /* Icon upload (folder/cloud) */
        .ac-upload-zone i,
        .ac-upload-icon i {
            color: #f59e0b !important;
        }

        /* Tombol Pilih Video */
        #acPickBtn,
        .ac-upload-btn {
            background: linear-gradient(135deg, #f59e0b, #d97706) !important;
            color: #fff !important;
            border: none !important;
            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35) !important;
        }
        
        #acPickBtn:hover,
        .ac-upload-btn:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 10px 28px rgba(245, 158, 11, 0.55) !important;
        }

        /* Section head icons */
        .tl-section-head h3 i,
        .tl-section-head i {
            color: #f59e0b !important;
        }
    `;

    var style = document.createElement('style');
    style.id = 'clipora-orange-theme';
    style.type = 'text/css';
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    document.head.appendChild(style);
    
    console.log('[V9.52.1] Orange theme injected');
})();

// V9.500.0: TAB NAVIGATION  dihapus (tidak dipakai)







// ============================================================
// V9.613.0: HIDE UPGRADE BUTTONS FOR ADMIN (direct DOM)
// ============================================================
(function() {
  'use strict';
  
  function hideUpgradeButtons() {
    // Cek admin
    var isAdmin = (typeof IS_ADMIN_JS !== 'undefined' && IS_ADMIN_JS);
    if (!isAdmin) return; // User biasa ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â biarkan tombol tampil

    var hiddenCount = 0;

    // 1. Sembunyikan semua tombol dengan teks "Upgrade"
    document.querySelectorAll('button, a').forEach(function(el) {
      var t = (el.textContent || '').trim();
      if (t === 'Upgrade' || t === 'Upgrade ke Premium' || 
          t === 'Upgrade ke PRO' || t.indexOf('Upgrade untuk') === 0 ||
          t.indexOf('Upgrade') === 0) {
        if (el.style.display !== 'none') {
          el.style.display = 'none';
          hiddenCount++;
          console.log('[Admin/HideUpgrade] Sembunyikan tombol:', t);
        }
      }
    });

    // 2. Sembunyikan parent card dari tombol Upgrade (biar rapi)
    var parentsToHide = [
      '.index-role-actions',
      '.compact-lock-card',
      '.watermark-notice',
      '.te-quality-row',
      '.te-translate-lock-card'
    ];
    parentsToHide.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(el) {
        // Cek apakah card ini isinya cuma "Upgrade"
        var txt = (el.textContent || '').trim();
        if (txt.indexOf('Upgrade') !== -1 && txt.length < 200) {
          if (el.style.display !== 'none') {
            el.style.display = 'none';
            hiddenCount++;
            console.log('[Admin/HideUpgrade] Sembunyikan card:', sel);
          }
        }
      });
    });

    // 3. Sembunyikan badge "PRO"
    document.querySelectorAll('[class*="pro-badge"], [class*="badge-pro"], .pro-tag, [class*="PRO"]').forEach(function(el) {
      var t = (el.textContent || '').trim();
      if (t === 'PRO' || t === 'Pro') {
        if (el.style.display !== 'none') {
          el.style.display = 'none';
          hiddenCount++;
        }
      }
    });

    // 4. Sembunyikan tulisan "Model tiny untuk Free. Upgrade untuk lebih akurat"
    document.querySelectorAll('*').forEach(function(el) {
      if (el.children.length > 0) return;
      var t = (el.textContent || '').trim();
      if (t.indexOf('Model tiny untuk Free') === 0 ||
          t.indexOf('Video akan memiliki watermark') === 0) {
        if (el.style.display !== 'none') {
          el.style.display = 'none';
          hiddenCount++;
          console.log('[Admin/HideUpgrade] Sembunyikan notice:', t.substring(0, 50));
        }
      }
    });

    if (hiddenCount > 0) {
      console.log('[Admin/HideUpgrade] Total disembunyikan:', hiddenCount);
    }
  }

  // Jalankan saat DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideUpgradeButtons);
  } else {
    hideUpgradeButtons();
  }

  // Jalankan lagi setelah 500ms, 1s, 2s (untuk element yang di-render lambat)
  setTimeout(hideUpgradeButtons, 500);
  setTimeout(hideUpgradeButtons, 1000);
  setTimeout(hideUpgradeButtons, 2000);

  // MutationObserver: jalankan setiap kali DOM berubah
  try {
    var observer = new MutationObserver(function(mutations) {
      // Debounce
      if (window._hideUpgradeTimer) clearTimeout(window._hideUpgradeTimer);
      window._hideUpgradeTimer = setTimeout(hideUpgradeButtons, 100);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('[Admin/HideUpgrade] MutationObserver aktif');
  } catch (e) {
    console.warn('[Admin/HideUpgrade] MutationObserver error:', e.message);
  }

  console.log('[Admin/HideUpgrade] Module loaded');
})();



// ============================================================
// V9.614.0: CLEANUP ADMIN ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Sembunyikan semua "Upgrade" & "Watermark"
// Dijalankan hanya kalau IS_ADMIN_JS = true
// ============================================================
(function() {
  'use strict';

  // Teks yang HARUS disembunyikan (untuk admin)
  var TEXT_TO_HIDE = [
    'Model tiny untuk Free',
    'Upgrade untuk lebih akurat',
    'Video akan memiliki watermark',
    'Upgrade untuk hapus watermark',
    'Upgrade untuk 1080p',
    'Upgrade ke Premium',
    'Upgrade ke PRO',
    'Maks 2 menit /video',
    'Kualitas 720p',
    'Ada Watermark',
    'AI Insights + 1080p',
    'Tersisa',
    'Reset otomatis setiap tengah malam'
  ];

  // Selector parent card yang HARUS disembunyikan (untuk admin)
  var PARENT_SELECTORS = [
    '.index-role-actions',       // "Upgrade ke Premium"
    '.compact-lock-card',         // AI Voice Over lock
    '.watermark-notice',          // "Video akan memiliki watermark"
    '.te-quality-row',            // "Upgrade untuk 1080p"
    '.te-translate-lock-card',    // Translate lock
    '.hint'                       // "Model tiny untuk Free"
  ];

  function isAdmin() {
    return (typeof IS_ADMIN_JS !== 'undefined' && IS_ADMIN_JS === true);
  }

  function cleanupAdmin() {
    if (!isAdmin()) return 0;

    var hidden = 0;

    // 1. Sembunyikan tombol/link dengan teks "Upgrade"
    document.querySelectorAll('button, a, span').forEach(function(el) {
      if (el.style.display === 'none') return;
      if (el.children.length > 0) return;
      var t = (el.textContent || '').trim();
      if (t === 'Upgrade' ||
          t === 'Upgrade ke Premium' ||
          t === 'Upgrade ke PRO' ||
          t.indexOf('Upgrade untuk') === 0 ||
          t.indexOf('Upgrade') === 0) {
        el.style.display = 'none';
        hidden++;
      }
    });

    // 2. Sembunyikan parent card berdasarkan selector
    PARENT_SELECTORS.forEach(function(sel) {
      try {
        document.querySelectorAll(sel).forEach(function(el) {
          if (el.style.display === 'none') return;
          el.style.display = 'none';
          hidden++;
        });
      } catch (e) {}
    });

    // 3. Sembunyikan elemen dengan teks tertentu
    document.querySelectorAll('*').forEach(function(el) {
      if (el.style.display === 'none') return;
      if (el.children.length > 0) return; // hanya elemen leaf
      var t = (el.textContent || '').trim();
      if (t.length === 0 || t.length > 200) return;

      for (var i = 0; i < TEXT_TO_HIDE.length; i++) {
        if (t.indexOf(TEXT_TO_HIDE[i]) !== -1) {
          // Sembunyikan parent card-nya (biar rapi)
          var parent = el.closest(
            '[class*="lock-card"], [class*="watermark-notice"], ' +
            '[class*="quality-row"], [class*="role-actions"], ' +
            '[class*="hint"], [class*="badge"], [class*="notice"]'
          );
          if (parent && parent.style.display !== 'none') {
            parent.style.display = 'none';
            hidden++;
          } else {
            el.style.display = 'none';
            hidden++;
          }
          break;
        }
      }
    });

    // 4. Sembunyikan badge "PRO"
    document.querySelectorAll('[class*="pro-badge"], [class*="badge-pro"], .pro-tag').forEach(function(el) {
      var t = (el.textContent || '').trim();
      if (t === 'PRO' || t === 'Pro' || t === 'pro') {
        if (el.style.display !== 'none') {
          el.style.display = 'none';
          hidden++;
        }
      }
    });

    // 5. Sembunyikan panel "Paket FREE - Kuota Harian" (khusus user biasa, admin juga)
    //    -> Cari elemen yang mengandung "Paket FREE"
    document.querySelectorAll('div, section, aside').forEach(function(el) {
      if (el.style.display === 'none') return;
      if (el.querySelector('video')) return; // jangan sembunyikan video
      var t = (el.textContent || '').trim();
      if (t.indexOf('Paket FREE') !== -1 && t.length < 500) {
        var parent = el.closest('[class*="card"], [class*="panel"], section, aside');
        if (parent && parent !== document.body) {
          parent.style.display = 'none';
          hidden++;
        } else if (el !== document.body) {
          el.style.display = 'none';
          hidden++;
        }
      }
    });

    return hidden;
  }

  // Jalankan saat DOM ready
  function runCleanup() {
    if (!isAdmin()) {
      console.log('[Admin/Cleanup] Bukan admin ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â skip');
      return;
    }
    var n = cleanupAdmin();
    if (n > 0) {
      console.log('[Admin/Cleanup] ' + n + ' elemen disembunyikan');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runCleanup);
  } else {
    runCleanup();
  }

  // Jalankan berkali-kali (handle elemen yang di-render lambat)
  [300, 800, 1500, 3000].forEach(function(ms) {
    setTimeout(runCleanup, ms);
  });

  // MutationObserver ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â pantau DOM, bersihkan setiap kali ada perubahan
  try {
    var _cleanupTimer = null;
    var observer = new MutationObserver(function() {
      if (_cleanupTimer) clearTimeout(_cleanupTimer);
      _cleanupTimer = setTimeout(runCleanup, 150);
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
      console.log('[Admin/Cleanup] MutationObserver aktif');
    }
  } catch (e) {
    console.warn('[Admin/Cleanup] Error:', e.message);
  }

  console.log('[Admin/Cleanup] Module loaded (admin-only)');
})();








// ============================================
// V3.0.0: HAPUS RUANG KOSONG
// ============================================
(function() {
    'use strict';
    
    function hapusRuangKosong() {
        var vp = document.getElementById('videoPreview');
        var cp = document.getElementById('controlPanel');
        
        if (!vp || !cp) return;
        if (vp.style.display === 'none') return;
        
        // Cek jarak antara video & panel
        var vpRect = vp.getBoundingClientRect();
        var cpRect = cp.getBoundingClientRect();
        var jarak = cpRect.top - vpRect.bottom;
        
        if (jarak < 20) return; // sudah rapat
        
        console.log('[Rapat] Jarak:', Math.round(jarak), 'px ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â cari element kosong');
        
        // Loop semua element di body
        var all = document.querySelectorAll('body *');
        var hidden = 0;
        
        all.forEach(function(el) {
            if (el === vp || el === cp) return;
            if (el.contains(vp) || el.contains(cp)) return;
            if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
            if (el.tagName === 'HEADER' || el.tagName === 'FOOTER' || 
                el.tagName === 'NAV' || el.tagName === 'BODY' || 
                el.tagName === 'HTML' || el.tagName === 'MAIN') return;
            
            var rect = el.getBoundingClientRect();
            
            // Kalau element ada di antara video & panel
            if (rect.top >= vpRect.bottom - 20 && 
                rect.bottom <= cpRect.top + 20 &&
                rect.height > 20) {
                
                var txt = (el.textContent || '').trim();
                
                // Hide kalau kosong / pendek
                if (txt.length < 20 || el.children.length === 0) {
                    console.log('[Rapat] Hide:', el.tagName, el.className || el.id, '| h:', Math.round(rect.height));
                    el.style.setProperty('display', 'none', 'important');
                    hidden++;
                }
            }
        });
        
        // Paksa margin
        vp.style.setProperty('margin-bottom', '0', 'important');
        cp.style.setProperty('margin-top', '0', 'important');
        
        // Cek ulang
        setTimeout(function() {
            var newJarak = cp.getBoundingClientRect().top - vp.getBoundingClientRect().bottom;
            console.log('[Rapat] Jarak setelah fix:', Math.round(newJarak), 'px | hidden:', hidden);
        }, 100);
    }
    
    // Jalankan tiap 1 detik (biar aman)
    setInterval(hapusRuangKosong, 1000);
    
    // Jalankan awal
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(hapusRuangKosong, 500);
            setTimeout(hapusRuangKosong, 1500);
        });
    } else {
        setTimeout(hapusRuangKosong, 500);
        setTimeout(hapusRuangKosong, 1500);
    }
    
    console.log('[Rapat] Ready');
})();

// ============================================================
// V9.266.0: BLOKIR REQUEST CULTURE (Anti-CORS)
// ============================================================
(function() {
    var _origFetch = window.fetch;
    window.fetch = function(url, options) {
        // Blokir request ke /api/culture/regions
        if (typeof url === 'string' && url.indexOf('/api/culture/regions') !== -1) {
            console.log("[BlockCulture] Request diblokir, mengembalikan data kosong");
            return Promise.resolve(new Response(JSON.stringify({
                success: true,
                regions: [],
                _fallback: true
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }));
        }
        return _origFetch.apply(this, arguments);
    };
    console.log("[BlockCulture] Fetch interceptor aktif!");
})();