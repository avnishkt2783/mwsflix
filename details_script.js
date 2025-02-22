const apiKey = "a28bda684eca7826525d86acdbc4edea";
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");
let backdropIndex = 0;
let backdropImages = [];

document.addEventListener("DOMContentLoaded", async () => {
    const movieId = new URLSearchParams(window.location.search).get("id");
    const favoriteBtn = document.getElementById("favorite-btn");
    const watchlistBtn = document.getElementById("watchlist-btn");
    const shareBtn = document.getElementById("share-btn");
    const play_btn = document.getElementById("play-btn");
    const token = localStorage.getItem("token");

    if (!favoriteBtn || !watchlistBtn || !play_btn || !shareBtn) return;

    if (!token) {
        favoriteBtn.disabled = true;
        watchlistBtn.disabled = true;
        shareBtn.disabled = true;
        play_btn.disabled = true;
        return;
    }

    async function fetchUserData() {
        try {
            const res = await fetch("https://mwsflix.onrender.com/api/auth/user", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) return;
            const user = await res.json();

            if (user.favorites.includes(movieId)) {
                favoriteBtn.firstElementChild.classList.replace("bi-heart", "bi-heart-fill");
            }

            if (user.watchlist.includes(movieId)) {
                watchlistBtn.firstElementChild.classList.replace("bi-bookmark", "bi-bookmark-fill");
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    }

    await fetchUserData();

    favoriteBtn.addEventListener("click", async () => {
        try {
            const res = await fetch("https://mwsflix.onrender.com/api/auth/favorite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ movieId }),
            });

            if (res.ok) {
                const data = await res.json();
                const icon = favoriteBtn.firstElementChild;
                if (data.favorites.includes(movieId)) {
                    icon.classList.replace("bi-heart", "bi-heart-fill");
                } else {
                    icon.classList.replace("bi-heart-fill", "bi-heart");
                }
            }
        } catch (error) {
            console.error("Error updating favorites:", error);
        }
    });

    watchlistBtn.addEventListener("click", async () => {
        try {
            const res = await fetch("https://mwsflix.onrender.com/api/auth/watchlist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ movieId }),
            });

            if (res.ok) {
                const data = await res.json();
                const icon = watchlistBtn.firstElementChild;
                if (data.watchlist.includes(movieId)) {
                    icon.classList.replace("bi-bookmark", "bi-bookmark-fill");
                } else {
                    icon.classList.replace("bi-bookmark-fill", "bi-bookmark");
                }
            }
        } catch (error) {
            console.error("Error updating watchlist:", error);
        }
    });

    play_btn.addEventListener("click", async () => {
        try {
            const res = await fetch("https://mwsflix.onrender.com/api/auth/viewed", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ movieId }),
            });

            if (res.ok) {
                console.log("Movie added to viewed history");
            }
        } catch (error) {
            console.error("Error adding to viewed history:", error);
        }
    });

    shareBtn.addEventListener("click", async () => {
        const movieLink = window.location.href;
        const movieTitle = document.title;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: movieTitle,
                    text: `Check out this movie: ${movieTitle}`,
                    url: movieLink,
                });
                console.log("✅ Movie link shared successfully!");
            } catch (err) {
                console.error("❌ Error sharing:", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(movieLink);
                alert("✅ Link copied to clipboard!");
            } catch (err) {
                alert("❌ Failed to copy link. Try manually copying.");
            }
        }
    });

});

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

async function fetchMovieDetails() {
    if (!movieId) {
        document.body.innerHTML = "<h2 style='color: white; text-align: center;'>Invalid Movie ID</h2>";
        return;
    }

    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits,recommendations,images`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        displayMovieDetails(data);
        displayBackdrops(data.images.backdrops);
        displayCast(data.credits.cast);
        displayRecommendations(data.recommendations.results);
    } catch (error) {
        console.error("Error fetching movie details:", error);
    }
}

function displayMovieDetails(movie) {
    document.getElementById("title").textContent = movie.title;
    document.title = movie.title;
    document.getElementById("year").textContent = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
    document.getElementById("genres").textContent = movie.genres.map(genre => genre.name).join(", ");
    document.getElementById("overview").textContent = movie.overview || "No overview available.";
    document.getElementById("poster").src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    document.getElementById("tmdbLink").href = `https://www.themoviedb.org/movie/${movie.id}`;
    document.getElementById("playButton").href = `watch.html?id=${movie.id}&title=${encodeURIComponent(movie.title)}`;
    document.getElementById("runtime").textContent = movie.runtime || "N/A";
    document.getElementById("rating").textContent = movie.vote_average.toFixed(1);
    document.getElementById("production").textContent = movie.production_companies.map(p => p.name).join(", ");
}

function displayBackdrops(backdrops) {
    const backdropContainer = document.getElementById("backdropContainer");
    backdropContainer.innerHTML = "";

    backdropImages = backdrops
        .filter(b => b.file_path)
        .slice(0, 5)
        .map(b => `https://image.tmdb.org/t/p/w1280${b.file_path}`);

    if (backdropImages.length > 0) {
        backdropImages.forEach((imgSrc, index) => {
            const img = document.createElement("img");
            img.src = imgSrc;
            img.classList.add(index === 0 ? "active-backdrop" : "backdrop-image");
            backdropContainer.appendChild(img);
        });

        if (backdropImages.length > 1) {
            setInterval(() => {
                const images = document.querySelectorAll(".backdrop-container img");
                images.forEach(img => img.classList.remove("active-backdrop"));
                backdropIndex = (backdropIndex + 1) % backdropImages.length;
                images[backdropIndex]?.classList.add("active-backdrop");
            }, 2000);
        }
    }
}

function displayCast(cast) {
    const castContainer = document.getElementById("flush-collapseOne");
    castContainer.innerHTML = "";

    if (!cast || cast.length === 0) {
        castContainer.innerHTML = "<p class='text-muted p-3'>No cast information available.</p>";
        return;
    }

    let gridContainer = `<div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">`;

    cast.slice(0, 10).forEach(member => {
        const profileImg = member.profile_path
            ? `https://image.tmdb.org/t/p/w200${member.profile_path}`
            : "https://via.placeholder.com/75x100?text=No+Image";

        gridContainer += `
            <div class="col">
                <a href="https://www.themoviedb.org/person/${member.id}" target="_blank" 
                    class="text-white text-decoration-none">
                    <div class="d-flex align-items-center p-2 rounded shadow-sm"
                            style="border-radius: 15px; min-width: 100%; max-width: 100%;">
                        <img src="${profileImg}" alt="${member.name}" 
                                class="rounded me-2" width="50" height="75" 
                                style="object-fit: cover; border-radius: 10px;">
                        <span class="fw-bold">${member.name}</span>
                    </div>
                </a>
            </div>`;
    });

    gridContainer += `</div>`;
    castContainer.innerHTML = gridContainer;
}

function displayRecommendations(recommendations) {
    const recommendationsContainer = document.getElementById("flush-collapseTwo");
    recommendationsContainer.innerHTML = "";

    if (!recommendations || recommendations.length === 0) {
        recommendationsContainer.innerHTML = "<p class='text-muted p-3'>No recommendations available.</p>";
        return;
    }

    let gridContainer = `<div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">`;

    recommendations.slice(0, 10).forEach(movie => {
        if (!movie.poster_path) return;

        gridContainer += `
            <div class="col">
                <a href="details.html?id=${movie.id}" class="text-white text-decoration-none">
                    <div class="d-flex align-items-center p-2 rounded shadow-sm"
                            style="border-radius: 15px; min-width: 100%; max-width: 100%;">
                        <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" 
                                alt="${movie.title}" 
                                class="rounded me-2" width="50" height="75" 
                                style="object-fit: cover; border-radius: 10px;">
                        <span class="fw-bold">${movie.title}</span>
                    </div>
                </a>
            </div>`;
    });

    gridContainer += `</div>`;
    recommendationsContainer.innerHTML = gridContainer;
}

fetchMovieDetails();

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