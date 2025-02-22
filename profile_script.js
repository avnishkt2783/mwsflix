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
        alert("Please log in first!");
        window.location.href = "login.html";
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "login.html");

    const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
    });
    const user = await res.json();

    document.getElementById("username").textContent = user.username;

    const favoritesList = document.getElementById("favorites-list");
    const watchlistList = document.getElementById("watchlist-list");
    const viewedList = document.getElementById("viewed-list");

    const tmdbApiKey = "a28bda684eca7826525d86acdbc4edea"; 
    const tmdbBaseUrl = "https://api.themoviedb.org/3/movie/";

    async function fetchMovieDetails(movieId) {
        const response = await fetch(`${tmdbBaseUrl}${movieId}?api_key=${tmdbApiKey}`);
        return response.json();
    }

    async function displayMovies(movieIds, container, removeFunction) {
        for (const movieId of movieIds.reverse()) {
            const movie = await fetchMovieDetails(movieId);
            const movieCard = document.createElement("div");
            movieCard.classList.add("movie-card");

            if (container.id === "viewed-list") {
                movieCard.id = `viewed-${movieId}`;
            }

            movieCard.innerHTML = `
                <div class="movie-item" style="position: relative;">
                <a href="details.html?id=${movieId}" class="text-decoration-none">    
                <div class="movie-img-container">
                        <img src="${imageBaseURL}${movie.poster_path}" alt="${movie.title}">
                    </div>
                    <h6 class="mt-3 text-white">${movie.title}</h6>
                    
                    </a>
                    <button class="remove-btn" onclick="${container.id === 'viewed-list' ? 'removeViewedHistory' : removeFunction}('${movieId}')">
                    <i class="bi-x-circle-fill"></i>
                </button>
                </div>
            `;

            movieCard.addEventListener("mouseenter", () => {
                const backdropContainer = document.getElementById("backdropContainer");
                const newBackdrop = document.createElement("img");
                newBackdrop.src = `${backdropBaseURL}${movie.backdrop_path}`;
                newBackdrop.classList.add("backdrop-image", "fade-in-backdrop");

                backdropContainer.appendChild(newBackdrop);
                setTimeout(() => newBackdrop.classList.add("active-backdrop"), 10);
            });
            
            container.appendChild(movieCard);
        }
    }

    await displayMovies(user.favorites, favoritesList, "removeFavorite");
    await displayMovies(user.watchlist, watchlistList, "removeWatchlist");
    await displayMovies(user.viewed, viewedList, "removeViewed");
});

async function removeFavorite(movieId) {
    await fetch("/api/auth/favorite", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ movieId }),
    });
    location.reload();
}

async function removeWatchlist(movieId) {
    await fetch("/api/auth/watchlist", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ movieId }),
    });
    location.reload();
}

async function removeViewed(movieId) {
    await fetch("/api/auth/viewed", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ movieId }),
    });
    location.reload();
}

async function removeViewedHistory(movieId) {
    try {
        const response = await fetch(`/api/auth/viewed/${movieId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to remove movie");
        }

        document.getElementById(`viewed-${movieId}`).remove();

    } catch (error) {
        console.error("Error removing viewed movie:", error);
    }
}

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