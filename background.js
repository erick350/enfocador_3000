// ===== background.js =====
const ALARM_NAME = "enfocador3000_pomodoroTick";

function iniciarFase(phase) {
    chrome.storage.sync.get(
        { pomodoro: { studyMinutes: 25, breakMinutes: 5 } },
        function (data) {
            const p = data.pomodoro;
            const minutos = phase === "study" ? p.studyMinutes : p.breakMinutes;
            const endTimestamp = Date.now() + minutos * 60000;

            chrome.storage.sync.set({
                pomodoro: {
                    ...p,
                    active: true,
                    phase: phase,
                    endTimestamp: endTimestamp
                }
            });

            chrome.alarms.create(ALARM_NAME, { delayInMinutes: minutos });

            chrome.notifications.create({
                type: "basic",
                iconUrl: "icons/icon128.png",
                title: phase === "study" ? "🎯 Modo estudio activado" : "☕ Descanso",
                message:
                    phase === "study"
                        ? `Las páginas quedarán bloqueadas por ${minutos} min.`
                        : `Disfruta tu descanso: ${minutos} min.`
            });

            actualizarBadge(phase);
        }
    );
}

function detenerPomodoro() {
    chrome.alarms.clear(ALARM_NAME);
    chrome.storage.sync.get({ pomodoro: {} }, function (data) {
        chrome.storage.sync.set({
            pomodoro: {
                ...data.pomodoro,
                active: false,
                endTimestamp: null
            }
        });
    });
    chrome.action.setBadgeText({ text: "" });
}

function actualizarBadge(phase) {
    chrome.action.setBadgeText({ text: phase === "study" ? "📚" : "☕" });
    chrome.action.setBadgeBackgroundColor({
        color: phase === "study" ? "#e74c3c" : "#2ecc71"
    });
}

// Cuando el temporizador termina, cambia de fase automáticamente
chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;

    chrome.storage.sync.get({ pomodoro: {} }, function (data) {
        const siguienteFase = data.pomodoro.phase === "study" ? "break" : "study";
        iniciarFase(siguienteFase);
    });
});

// Mensajes desde el popup
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action === "iniciarPomodoro") {
        iniciarFase("study");
        sendResponse({ ok: true });
    }
    if (msg.action === "detenerPomodoro") {
        detenerPomodoro();
        sendResponse({ ok: true });
    }
    return true; // permite respuesta asíncrona
});

// Si Chrome se reinicia con un Pomodoro activo, restaura el badge
chrome.runtime.onStartup.addListener(function () {
    chrome.storage.sync.get({ pomodoro: { active: false, phase: "study" } }, function (data) {
        if (data.pomodoro.active) {
            actualizarBadge(data.pomodoro.phase);
        }
    });
});
