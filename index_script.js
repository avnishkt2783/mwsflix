const apiKey = "a28bda684eca7826525d86acdbc4edea";
const posterSize = "w500";  
const backdropSize = "w1280";
const imageBaseURL = "https://image.tmdb.org/t/p/w500";
const backdropBaseURL = "https://image.tmdb.org/t/p/w1280";
const backdropContainer = document.getElementById("backdropContainer");
let backdropImages = [];

async function getUserProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Not authenticated! Please log in.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("/api/auth/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById("username").innerText = data.username;
            document.getElementById("email").innerText = data.email;
        } else {
            alert(data.message || "Failed to fetch user data");
            localStorage.removeItem("token");
            window.location.href = "login.html";
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong!");
    }
}
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // alert("Logged out successfully!");
    window.location.href = "login.html";
}

document.getElementById("logoutBtn").addEventListener("click", logout);
function checkAuth() {
    if (!localStorage.getItem("token")) {
        // alert("Please log in first!");
        window.location.href = "login.html";
    }
}

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
    let url = `https://api.themoviedb.org/3/${category}?api_key=${apiKey}&page=1`;
    if (category === "discover/movie") {
        url = `https://api.themoviedb.org/3/${category}?api_key=${apiKey}&with_original_language=hi&sort_by=popularity.desc&page=1`;
    }
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

fetchMovies("movie/now_playing", "inTheaters");
fetchMovies("discover/movie","popularMoviesHindi");
fetchMovies("movie/popular", "popularMovies");
fetchMovies("movie/top_rated", "topRatedMovies");
fetchOTTProviders();

document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");

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
    window.location.reload(); 
}

function isTokenExpired(token) {
    try {
        const decoded = JSON.parse(atob(token.split(".")[1])); 
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime; 
    } catch (error) {
        console.error("Error decoding token:", error);
        return true;
    }
}

function handleExpiredToken() {
    alert("Session expired. Please log in again.");
    localStorage.removeItem("token"); 
    window.location.href = "login.html"; 
}

function secureFetch(url, options = {}) {
    const token = localStorage.getItem("token");

    if (!token || isTokenExpired(token)) {
        handleExpiredToken();
        return Promise.reject("Token expired");
    }

    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    return fetch(url, options).then(response => {
        if (response.status === 401) { 
            handleExpiredToken();
            return Promise.reject("Unauthorized");
        }
        return response.json();
    });
}