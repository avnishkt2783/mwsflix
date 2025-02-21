const apiKey = "a28bda684eca7826525d86acdbc4edea";
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");
let backdropIndex = 0;
let backdropImages = [];

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