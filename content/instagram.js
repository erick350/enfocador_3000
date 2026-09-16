// ===== instagram.js =====
let hideReels = true;
let extensionEnabled = true;

chrome.storage.sync.get(
    {
        hideReels: true,
        extensionEnabled: true
    },
    function (data) {
        hideReels = data.hideReels;
        extensionEnabled = data.extensionEnabled;
        actualizarInstagram();
    }
);

chrome.storage.onChanged.addListener(
    function (changes, area) {
        if (area !== "sync") return;

        if (changes.hideReels) {
            hideReels = changes.hideReels.newValue;
        }
        if (changes.extensionEnabled) {
            extensionEnabled = changes.extensionEnabled.newValue;
        }
        actualizarInstagram();
    }
);

function actualizarInstagram() {
    const reels = document.querySelectorAll(
        ['a[href^="/reels/"]', 'a[href^="/reel/"]'].join(",")
    );

    const debeOcultar = extensionEnabled && hideReels;

    reels.forEach(function (elemento) {
        elemento.style.display = debeOcultar ? "none" : "";
    });
}

// Instagram agrega contenido dinámicamente
const instagramObserver = new MutationObserver(
    function () {
        if (extensionEnabled && hideReels) {
            actualizarInstagram();
        }
    }
);

function iniciarObservadorInstagram() {
    if (!document.body) {
        document.addEventListener("DOMContentLoaded", iniciarObservadorInstagram, { once: true });
        return;
    }
    instagramObserver.observe(document.body, { childList: true, subtree: true });
}

iniciarObservadorInstagram();
