let hideShorts = true;

chrome.storage.sync.get(
    { 
        hideShorts: true
    },
    function (data) {
        hideShorts = data.hideShorts;

        actualizarYouTube();
    }
);

chrome.storage.onChanged.addListener(
    function (changes, area) {
        if (area === "sync" && changes.hideShorts){
            hideShorts = changes.hideShorts.newValue;
            actualizarYouTube();
        }
    }
);

function actualizarYouTube() {
    const shorts = document.querySelectorAll(
        ['a[href^="/shorts/"]', 'ytd-reel-shelf-renderer'].join(",")
    );

    shorts.forEach(function (elemento) {
        if (hideShorts) {
            elemento.style.display = "none";
        } else {
            elemento.style.display = "";
        }
    });
}

const observer = new MutationObserver(
    function () {
        if (hideShorts) {
            actualizarYouTube();
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