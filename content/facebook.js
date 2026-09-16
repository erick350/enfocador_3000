// ===== facebook.js =====
// NOTA: corregido para usar "hideFReels" (antes usaba por error "hideReels",
// lo que hacía que el interruptor de Facebook no funcionara y que
// cambiar el de Instagram afectara también a Facebook).

let hideFReels = true;
let extensionEnabled = true;

chrome.storage.sync.get(
    {
        hideFReels: true,
        extensionEnabled: true
    },
    function (data) {
        hideFReels = data.hideFReels;
        extensionEnabled = data.extensionEnabled;
        actualizarFacebook();
    }
);

chrome.storage.onChanged.addListener(
    function (changes, area) {
        if (area !== "sync") return;

        if (changes.hideFReels) {
            hideFReels = changes.hideFReels.newValue;
        }
        if (changes.extensionEnabled) {
            extensionEnabled = changes.extensionEnabled.newValue;
        }
        actualizarFacebook();
    }
);

function actualizarFacebook() {
    const reels = document.querySelectorAll(
        ['a[href^="/reels/"]', 'a[href^="/reel/"]'].join(",")
    );

    const debeOcultar = extensionEnabled && hideFReels;

    reels.forEach(function (elemento) {
        elemento.style.display = debeOcultar ? "none" : "";
    });
}

// Facebook agrega contenido dinámicamente
const facebookObserver = new MutationObserver(
    function () {
        if (extensionEnabled && hideFReels) {
            actualizarFacebook();
        }
    }
);

function iniciarObservadorFacebook() {
    if (!document.body) {
        document.addEventListener("DOMContentLoaded", iniciarObservadorFacebook, { once: true });
        return;
    }
    facebookObserver.observe(document.body, { childList: true, subtree: true });
}

iniciarObservadorFacebook();
