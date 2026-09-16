// ===== common.js =====
// Cargado antes que el script específico de cada sitio (youtube.js, instagram.js, facebook.js).
// Se encarga del bloqueo TOTAL de la página durante la fase de estudio del Pomodoro.

const ENFOCADOR_OVERLAY_ID = "enfocador3000-overlay";

function enfocadorMostrarBloqueo(minutosRestantesTexto) {
    if (document.getElementById(ENFOCADOR_OVERLAY_ID)) return; // ya está puesto

    const overlay = document.createElement("div");
    overlay.id = ENFOCADOR_OVERLAY_ID;
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        background: #0f0f0f;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 20px;
    `;
    overlay.innerHTML = `
        <div style="font-size:48px; margin-bottom:10px;">🎯</div>
        <h1 style="font-size:26px; margin:0 0 10px;">Modo estudio activo</h1>
        <p style="color:#aaaaaa; font-size:15px; max-width:320px;">
            Esta página está bloqueada mientras dure tu sesión de concentración.
        </p>
        <p id="enfocador3000-timer" style="margin-top:20px; font-size:32px; font-weight:bold; letter-spacing:1px;">
            ${minutosRestantesTexto || ""}
        </p>
    `;

    // Evita que el resto de la página reciba scroll o interacciones
    document.documentElement.style.overflow = "hidden";
    (document.body || document.documentElement).appendChild(overlay);
}

function enfocadorQuitarBloqueo() {
    const overlay = document.getElementById(ENFOCADOR_OVERLAY_ID);
    if (overlay) overlay.remove();
    document.documentElement.style.overflow = "";
}

function enfocadorFormatearTiempo(ms) {
    const totalSeg = Math.max(0, Math.floor(ms / 1000));
    const min = Math.floor(totalSeg / 60);
    const seg = totalSeg % 60;
    return `${min}:${seg.toString().padStart(2, "0")}`;
}

let enfocadorIntervaloReloj = null;

function enfocadorRevisarBloqueoTotal() {
    chrome.storage.sync.get(
        {
            extensionEnabled: true,
            pomodoro: { active: false, phase: "study", endTimestamp: null }
        },
        function (data) {
            const p = data.pomodoro || {};
            const debeBloquear =
                data.extensionEnabled &&
                p.active &&
                p.phase === "study";

            clearInterval(enfocadorIntervaloReloj);

            if (debeBloquear) {
                enfocadorMostrarBloqueo(enfocadorFormatearTiempo((p.endTimestamp || Date.now()) - Date.now()));

                // Actualiza el contador visible cada segundo
                enfocadorIntervaloReloj = setInterval(() => {
                    const timerEl = document.getElementById("enfocador3000-timer");
                    if (timerEl) {
                        timerEl.textContent = enfocadorFormatearTiempo((p.endTimestamp || Date.now()) - Date.now());
                    }
                }, 1000);
            } else {
                enfocadorQuitarBloqueo();
            }
        }
    );
}

// Revisar al cargar la página
enfocadorRevisarBloqueoTotal();

// Revisar cada vez que cambie algo en storage (toggle del popup, fin del Pomodoro, etc.)
chrome.storage.onChanged.addListener(function (changes, area) {
    if (area === "sync" && (changes.extensionEnabled || changes.pomodoro)) {
        enfocadorRevisarBloqueoTotal();
    }
});

// Por si la página tarda en montar <body> (document_start)
document.addEventListener("DOMContentLoaded", enfocadorRevisarBloqueoTotal);
