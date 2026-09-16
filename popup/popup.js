// ===== popup.js =====

const masterToggle = document.getElementById("masterToggle");
const masterEstado = document.getElementById("masterEstado");

const shortsToggle = document.getElementById("shortsToggle");
const reelsToggle = document.getElementById("reelsToggle");
const reelsFToggle = document.getElementById("reelsFToggle");

const studyMinutesInput = document.getElementById("studyMinutes");
const breakMinutesInput = document.getElementById("breakMinutes");
const pomodoroEstado = document.getElementById("pomodoroEstado");
const btnIniciar = document.getElementById("btnIniciar");
const btnDetener = document.getElementById("btnDetener");

let relojInterval = null;

// ---------- Cargar configuración guardada ----------
function cargarConfiguracion() {
    chrome.storage.sync.get(
        {
            extensionEnabled: true,
            hideShorts: true,
            hideReels: true,
            hideFReels: true,
            pomodoro: {
                active: false,
                phase: "study",
                studyMinutes: 25,
                breakMinutes: 5,
                endTimestamp: null
            }
        },
        function (data) {
            masterToggle.checked = data.extensionEnabled;
            masterEstado.textContent = data.extensionEnabled ? "Activado" : "Desactivado";

            shortsToggle.checked = data.hideShorts;
            reelsToggle.checked = data.hideReels;
            reelsFToggle.checked = data.hideFReels;

            studyMinutesInput.value = data.pomodoro.studyMinutes;
            breakMinutesInput.value = data.pomodoro.breakMinutes;

            actualizarUIPomodoro(data.pomodoro);
        }
    );
}

cargarConfiguracion();

// Si algo cambia mientras el popup está abierto (p.ej. el Pomodoro termina una fase)
chrome.storage.onChanged.addListener(function (changes, area) {
    if (area !== "sync") return;
    if (changes.pomodoro) {
        actualizarUIPomodoro(changes.pomodoro.newValue);
    }
    if (changes.extensionEnabled) {
        masterToggle.checked = changes.extensionEnabled.newValue;
        masterEstado.textContent = changes.extensionEnabled.newValue ? "Activado" : "Desactivado";
    }
});

// ---------- Interruptor maestro ----------
masterToggle.addEventListener("change", function () {
    chrome.storage.sync.set({ extensionEnabled: masterToggle.checked });
    masterEstado.textContent = masterToggle.checked ? "Activado" : "Desactivado";
});

// ---------- Toggles individuales ----------
shortsToggle.addEventListener("change", function () {
    chrome.storage.sync.set({ hideShorts: shortsToggle.checked });
});

reelsToggle.addEventListener("change", function () {
    chrome.storage.sync.set({ hideReels: reelsToggle.checked });
});

reelsFToggle.addEventListener("change", function () {
    chrome.storage.sync.set({ hideFReels: reelsFToggle.checked });
});

// ---------- Pomodoro ----------
btnIniciar.addEventListener("click", function () {
    const studyMinutes = Math.max(1, parseInt(studyMinutesInput.value) || 25);
    const breakMinutes = Math.max(1, parseInt(breakMinutesInput.value) || 5);

    chrome.storage.sync.set(
        {
            pomodoro: {
                active: false,
                phase: "study",
                studyMinutes: studyMinutes,
                breakMinutes: breakMinutes,
                endTimestamp: null
            }
        },
        function () {
            chrome.runtime.sendMessage({ action: "iniciarPomodoro" });
        }
    );
});

btnDetener.addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "detenerPomodoro" });
});

function actualizarUIPomodoro(p) {
    clearInterval(relojInterval);

    if (!p || !p.active) {
        pomodoroEstado.textContent = "Inactivo";
        btnIniciar.disabled = false;
        btnDetener.disabled = true;
        return;
    }

    btnIniciar.disabled = true;
    btnDetener.disabled = false;

    function tick() {
        const restante = Math.max(0, (p.endTimestamp || Date.now()) - Date.now());
        const min = Math.floor(restante / 60000);
        const seg = Math.floor((restante % 60000) / 1000);
        const etiqueta = p.phase === "study" ? "📚 Estudiando" : "☕ Descanso";
        pomodoroEstado.textContent = `${etiqueta}: ${min}:${seg.toString().padStart(2, "0")}`;
    }

    tick();
    relojInterval = setInterval(tick, 1000);
}
