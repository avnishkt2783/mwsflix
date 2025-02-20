const apiKey = "a28bda684eca7826525d86acdbc4edea";
const posterSize = "w500";  
const backdropSize = "w1280";
const imageBaseURL = "https://image.tmdb.org/t/p/w500";
const backdropBaseURL = "https://image.tmdb.org/t/p/w1280";
const backdropContainer = document.getElementById("backdropContainer");
let backdropImages = [];

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    // if (!token) return (window.location.href = "login.html");

    const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
    });
    const user = await res.json();

    document.getElementById("username").textContent = user.username;

    const favoritesList = document.getElementById("favorites-list");
    const watchlistList = document.getElementById("watchlist-list");
    const viewedList = document.getElementById("viewed-list");

    const tmdbApiKey = "a28bda684eca7826525d86acdbc4edea"; // Replace with your TMDb API Key
    const tmdbBaseUrl = "https://api.themoviedb.org/3/movie/";

    async function fetchMovieDetails(movieId) {
        const response = await fetch(`${tmdbBaseUrl}${movieId}?api_key=${tmdbApiKey}`);
        return response.json();
    }

    async function displayMovies(movieIds, container, removeFunction) {
        for (const movieId of movieIds) {
            const movie = await fetchMovieDetails(movieId);
            const movieCard = document.createElement("div");
            movieCard.classList.add("movie-card");

            movieCard.innerHTML = `
                <div class="movie-item" style="position: relative;">
                <a href="details.html?id=${movieId}" class="text-decoration-none">    
                <div class="movie-img-container">
                        <img src="${imageBaseURL}${movie.poster_path}" alt="${movie.title}">
                    </div>
                    <h6 class="mt-3 text-white">${movie.title}</h6>
                    <button class="remove-btn" onclick="${removeFunction}('${movieId}')">❌</button>
                    </a>
                </div>
            `;

            // Set backdrop on hover
            movieCard.addEventListener("mouseenter", () => {
                // document.body.style.backgroundImage = `url('${backdropBaseURL}${movie.backdrop_path}')`;
                // document.body.style.backgroundSize = "cover";
                // document.body.style.backgroundPosition = "center";
                // document.body.style.backgroundRepeat = "no-repeat";
                // document.body.style.transition = "opacity 0.5s ease-in-out";
                const backdropContainer = document.getElementById("backdropContainer");
                const newBackdrop = document.createElement("img");
                newBackdrop.src = `${backdropBaseURL}${movie.backdrop_path}`;
                newBackdrop.classList.add("backdrop-image", "fade-in-backdrop");

                backdropContainer.appendChild(newBackdrop);
                setTimeout(() => newBackdrop.classList.add("active-backdrop"), 10);
                // backdropContainer.innerHTML = `<img src="${backdropBaseURL}${movie.backdrop_path}" class="backdrop-image fade-in-backdrop active-backdrop">`;
            });
            

            // movieCard.addEventListener("mouseleave", () => {
            //     document.body.style.backgroundImage = "";
            // });

            container.appendChild(movieCard);
        }
    }

    await displayMovies(user.favorites, favoritesList, "removeFavorite");
    await displayMovies(user.watchlist, watchlistList, "removeWatchlist");
    await displayMovies(user.viewed, viewedList, "removeViewed");
});

// Remove Favorite
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

// Remove Watchlist
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

// Remove Viewed
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



// JWT TOKEN VERIFY
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

function isTokenExpired(token) {
    try {
        const decoded = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
        const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
        return decoded.exp < currentTime; // Check if token is expired
    } catch (error) {
        console.error("Error decoding token:", error);
        return true; // Assume expired if decoding fails
    }
}

// Function to handle logout on token expiration
function handleExpiredToken() {
    alert("Session expired. Please log in again.");
    localStorage.removeItem("token"); // Remove token
    window.location.href = "login.html"; // Redirect to login page
}

// Check token expiration before making API requests
function secureFetch(url, options = {}) {
    const token = localStorage.getItem("token");

    if (!token || isTokenExpired(token)) {
        handleExpiredToken();
        return Promise.reject("Token expired");
    }

    // Attach Authorization header
    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    return fetch(url, options).then(response => {
        if (response.status === 401) { // Handle unauthorized response
            handleExpiredToken();
            return Promise.reject("Unauthorized");
        }
        return response.json();
    });
}