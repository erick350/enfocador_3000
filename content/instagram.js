let hideReels = true;

// Cargar configuración
chrome.storage.sync.get(
    {
        hideReels: true 
    },
    function (data) {
        hideReels = data.hideReels;

        actualizarInstagram();
    }
);


// Escuchar cambios en la configuración
chrome.storage.onChanged.addListener(
    function (changes, area) {
        if(area === "sync" && changes.hideReels){
            hideReels = changes.hideReels.newValue;
            actualizarInstagram();
        }
    }
);

function actualizarInstagram() {
    const reels = document.querySelectorAll(
        ['a[href^="/reels/"]', 'a[href^="/reel/"]'].join(",")
    );

    reels.forEach(function (elemento) {
        if (hideReels) {
            elemento.style.display = "none";
        } else {
            elemento.style.display = "";
        }
    });
}


// YouTube agrega contenido dinámicamente
const observer = new MutationObserver(
    function () {
        if (hideReels) {
            actualizarInstagram();
        }
    }
);

observer.observe(
    document.body,
    {
        childList: true,
        subtree: true
    }
);