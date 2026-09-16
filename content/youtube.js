// ===== youtube.js =====
let hideShorts = true;
let extensionEnabled = true;

chrome.storage.sync.get(
    {
        hideShorts: true,
        extensionEnabled: true
    },
    function (data) {
        hideShorts = data.hideShorts;
        extensionEnabled = data.extensionEnabled;
        actualizarYouTube();
    }
);

chrome.storage.onChanged.addListener(
    function (changes, area) {
        if (area !== "sync") return;

        if (changes.hideShorts) {
            hideShorts = changes.hideShorts.newValue;
        }
        if (changes.extensionEnabled) {
            extensionEnabled = changes.extensionEnabled.newValue;
        }
        actualizarYouTube();
    }
);

function actualizarYouTube() {
    const shorts = document.querySelectorAll(
        ['a[href^="/shorts/"]', 'ytd-reel-shelf-renderer', '[title="Shorts"]'].join(",")
    );

    const debeOcultar = extensionEnabled && hideShorts;

    shorts.forEach(function (elemento) {
        elemento.style.display = debeOcultar ? "none" : "";
    });
}

// YouTube agrega contenido dinámicamente
const youtubeObserver = new MutationObserver(
    function () {
        if (extensionEnabled && hideShorts) {
            actualizarYouTube();
        }
    }
);

function iniciarObservadorYouTube() {
    if (!document.body) {
        document.addEventListener("DOMContentLoaded", iniciarObservadorYouTube, { once: true });
        return;
    }
    youtubeObserver.observe(document.body, { childList: true, subtree: true });
}

iniciarObservadorYouTube();
