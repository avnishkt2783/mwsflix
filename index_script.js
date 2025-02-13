const apiKey = "a28bda684eca7826525d86acdbc4edea";
const posterSize = "w500";  
const backdropSize = "w1280";
const imageBaseURL = "https://image.tmdb.org/t/p/w500";
const backdropBaseURL = "https://image.tmdb.org/t/p/w1280";
const backdropContainer = document.getElementById("backdropContainer");
let backdropImages = [];

document.getElementById("searchButton").addEventListener("click", function () {
    let query = document.getElementById("searchInput").value.trim();
    if (query) {
        window.location.href = `search.html?query=${encodeURIComponent(query)}`;
    }
});

document.getElementById("searchInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("searchButton").click();
    }
});

async function fetchMovies(category, containerId) {
    const url = `https://api.themoviedb.org/3/movie/${category}?api_key=${apiKey}&language=en-US&page=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayMovies(data.results, containerId);
    } catch (error) {
        console.error(`Error fetching ${category} movies:`, error);
    }
}

function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    movies.forEach((movie, index) => {
        if (!movie.poster_path) return;
        const backdropPath = movie.backdrop_path ? `${backdropBaseURL}${movie.backdrop_path}` : "";

        if (backdropPath) {
            backdropImages.push({
                category: containerId,
                index: index,
                url: backdropPath
            });
        }

        const movieCard = `
            <div class="movie-card" onmouseover="changeBackdrop('${containerId}', ${index})">
                <a href="details.html?id=${movie.id}" class="text-decoration-none">
                    <img src="${imageBaseURL}${movie.poster_path}" alt="${movie.title}">
                    <h6 class="mt-3 text-white">${movie.title}</h6>
                </a>
            </div>
        `;
        container.innerHTML += movieCard;
    });
}

function updateBackground(imageUrl) {
    const backdropContainer = document.getElementById("backdropContainer");
    backdropContainer.innerHTML = `<img src="${imageUrl}" class="active-backdrop">`;
}

function changeBackdrop(category, index) {
    const backdrop = backdropImages.find(img => img.category === category && img.index === index);
    
    if (backdrop) {
        const backdropContainer = document.getElementById("backdropContainer");

        const newBackdrop = document.createElement("img");
        newBackdrop.src = backdrop.url;
        newBackdrop.classList.add("backdrop-image", "fade-in-backdrop");

        const existingBackdrop = document.querySelector(".backdrop-image.active-backdrop");
        if (existingBackdrop) {
            existingBackdrop.classList.remove("active-backdrop");
            existingBackdrop.classList.add("fade-out-backdrop");

            setTimeout(() => {
                existingBackdrop.remove();
            }, 500);
        }

        backdropContainer.appendChild(newBackdrop);
        setTimeout(() => newBackdrop.classList.add("active-backdrop"), 10);
    }
}


async function fetchOTTProviders() {
    const url = `https://api.themoviedb.org/3/watch/providers/movie?api_key=${apiKey}&language=en-US`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results) {
            let ottContainer = document.getElementById("ottLogos");
            ottContainer.innerHTML = ""; 

            let logos = data.results
                .filter(p => p.logo_path) 
                .map(p => `<img src="${imageBaseURL}${p.logo_path}" class="ott-logo" style="border-radius: 0.5rem">`)
                .join("");

            ottContainer.innerHTML = `<div class="marquee-inner">${logos + logos}</div>`;
        }
    } catch (error) {
        console.error("Error fetching OTT providers:", error);
    }
}

fetchMovies("now_playing", "inTheaters");
fetchMovies("popular", "popularMovies");
fetchMovies("top_rated", "topRatedMovies");
fetchOTTProviders();

document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token"); // Retrieve JWT token

    if (token) {
        document.getElementById("loginBtn").style.display = "none";
        document.getElementById("registerBtn").style.display = "none";
        document.getElementById("logoutBtn").style.display = "block";
    } else {
        document.getElementById("logoutBtn").style.display = "none";
    }
});

function logoutUser() {
    localStorage.removeItem("token");
    window.location.reload(); // Refresh to update UI
}
