// const urlParams = new URLSearchParams(window.location.search);
// const movieId = urlParams.get("id");
// let movieName = urlParams.get("title");

// movieName = movieName ? decodeURIComponent(movieName.replace(/\+/g, " ")) : "Unknown Movie";

// document.title = `Watch - ${movieName}`;

// if (movieId) {
//     document.getElementById("movieFrame").src = `https://moviesapi.club/movie/${movieId}`;
// } else {
//     document.body.innerHTML = "<h2 style='color: white; text-align: center;'>Invalid Movie ID</h2>";
// }

// function toggleFullScreen() {
//     const iframe = document.getElementById("movieFrame");
//     if (iframe.requestFullscreen) {
//         iframe.requestFullscreen();
//     } else if (iframe.mozRequestFullScreen) {
//         iframe.mozRequestFullScreen();
//     } else if (iframe.webkitRequestFullscreen) {
//         iframe.webkitRequestFullscreen();
//     } else if (iframe.msRequestFullscreen) {
//         iframe.msRequestFullscreen();
//     }
// }

// function handleOrientationChange() {
//     if (window.innerWidth < 768 && (screen.orientation.angle === 90 || screen.orientation.angle === -90)) {
//         toggleFullScreen();
//     }
// }

// window.addEventListener("orientationchange", handleOrientationChange);

// document.addEventListener("DOMContentLoaded", () => {
//     if (window.innerWidth < 768) {
//         toggleFullScreen();
//     }
// });


const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");
let movieName = urlParams.get("title");

movieName = movieName ? decodeURIComponent(movieName.replace(/\+/g, " ")) : "Unknown Movie";

document.title = `Watch - ${movieName}`;

// Ensure blockedScripts is only defined once
if (typeof window.blockedScripts === "undefined") {
    window.blockedScripts = [
        "jquery-3.6.0.min.js",
        "crypto-js.min.js",
        "devtools-detector.js",
        "pako.min.js",
        "sweetalert2.js",
        "sweetalert2_theme-dark.min.css",
        "playerjs_skin2_20.0.3.js"
    ];
}

// MutationObserver to block scripts dynamically
if (!window.scriptObserverInitialized) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.tagName === "SCRIPT" || node.tagName === "LINK") {
                    window.blockedScripts.forEach((blocked) => {
                        if (node.src?.includes(blocked) || node.href?.includes(blocked)) {
                            console.log(`Blocking script: ${blocked}`);
                            node.remove();
                        }
                    });
                }
            });
        });
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.scriptObserverInitialized = true; // Prevent multiple observers
}

// Load the movie frame
if (movieId) {
    document.getElementById("movieFrame").src = `https://w1.moviesapi.club/movie/${movieId}`;

} else {
    document.body.innerHTML = "<h2 style='color: white; text-align: center;'>Invalid Movie ID</h2>";
}

// Fullscreen toggle
function toggleFullScreen() {
    const iframe = document.getElementById("movieFrame");
    if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
    } else if (iframe.mozRequestFullScreen) {
        iframe.mozRequestFullScreen();
    } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
    }
}

// Detect landscape mode on mobile
function handleOrientationChange() {
    if (window.innerWidth < 768 && (screen.orientation.angle === 90 || screen.orientation.angle === -90)) {
        toggleFullScreen();
    }
}

window.addEventListener("orientationchange", handleOrientationChange);

document.addEventListener("DOMContentLoaded", () => {
    if (window.innerWidth < 768) {
        toggleFullScreen();
    }
});
