const shortsToggle = document.getElementById("shortsToggle");
const reelsToggle = document.getElementById("reelsToggle");


// Cargar configuración guardada
chrome.storage.sync.get(
    {
        hideShorts: true,
        hideReels: true
    },
    function (data) {
        shortsToggle.checked = data.hideShorts;
        reelsToggle.checked = data.hideReels;
    }
);


// Detectar cambios de YouTube
shortsToggle.addEventListener(
    "change",
    function () {
        chrome.storage.sync.set({
            hideShorts: shortsToggle.checked
        });
    }
);


// Detectar cambios de Instagram
reelsToggle.addEventListener(
    "change",
    function () {
        chrome.storage.sync.set({
            hideReels: reelsToggle.checked
        });
    }
);