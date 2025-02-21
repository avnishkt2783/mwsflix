const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");
let movieName = urlParams.get("title");

movieName = movieName ? decodeURIComponent(movieName.replace(/\+/g, " ")) : "Unknown Movie";

document.title = `Watch - ${movieName}`;

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