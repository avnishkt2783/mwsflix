const apiKey = "a28bda684eca7826525d86acdbc4edea";
let currentPage = 1;
let totalPages = 1;
let currentQuery = "";
const movieResults = document.getElementById("movieResults");
const backdropContainer = document.getElementById("backdropContainer");

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

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function handleSearch(query, page = 1) {
    currentQuery = query; 
    if (query) {
        document.getElementById("searchQuery").textContent = query;
        fetchMovies(query, page);
    } else {
        document.getElementById("searchQuery").textContent = "No query provided";
    }
}

function fetchMovies(query, page) {
    fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`)
        .then(response => response.json())
        .then(data => {
            totalPages = data.total_pages;

            const sortedMovies = data.results.sort((a, b) => {
                const isExactMatchA = a.title.toLowerCase() === query.toLowerCase();
                const isExactMatchB = b.title.toLowerCase() === query.toLowerCase();

                if (isExactMatchA && !isExactMatchB) return -1;
                if (!isExactMatchA && isExactMatchB) return 1;

                if (b.vote_count !== a.vote_count) {
                    return b.vote_count - a.vote_count;
                }

                return b.popularity - a.popularity;
            });

            displayMovies(sortedMovies);
            updatePaginationButtons();
        })
        .catch(error => console.error("Error fetching movies:", error));
}

function displayMovies(movies) {
    movieResults.innerHTML = "";
    backdropContainer.innerHTML = "";

    if (!movies.length) {
        movieResults.innerHTML = "<p class='text-center'>No movies found.</p>";
        return;
    }

    movies.forEach((movie, index) => {
        const backdrop = document.createElement("img");
        backdrop.src = `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;
        backdrop.classList.add("backdrop-image");
        if (index === 0) backdrop.classList.add("active-backdrop");
        backdropContainer.appendChild(backdrop);

        const movieCard = `
            <div class="movie-card p-3 m-3" onmouseover="changeBackdrop(${index})">
                <a href="details.html?id=${movie.id}" class="text-white text-decoration-none">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="poster" alt="${movie.title}"></a>
                <div class="flex-grow-1">
                    <a href="details.html?id=${movie.id}" class="text-white text-decoration-none"><h5>${movie.title}</h5>
                    <p>${movie.overview.slice(0, 100)}...</p></a>
                </div>
                
                
            </div>
        `;
        movieResults.innerHTML += movieCard;
    });
}

function changeBackdrop(index) {
    document.querySelectorAll(".backdrop-image").forEach(img => img.classList.remove("active-backdrop"));
    document.querySelectorAll(".backdrop-image")[index]?.classList.add("active-backdrop");
}

function updatePaginationButtons() {
    document.getElementById("prevPage").style.display = currentPage > 1 ? "inline-block" : "none";
    document.getElementById("nextPage").style.display = currentPage < totalPages ? "inline-block" : "none";
}

function initializeSearch() {
    currentQuery = getQueryParam("query") || "";
    currentPage = parseInt(getQueryParam("page")) || 1;

    if (currentQuery) {
        handleSearch(currentQuery, currentPage);
    }
}
window.addEventListener("popstate", function () {
    currentQuery = getQueryParam("query") || "";
    currentPage = parseInt(getQueryParam("page")) || 1;

    if (currentQuery) {
        handleSearch(currentQuery, currentPage);
    }
});
initializeSearch(); 

document.getElementById("searchButton").addEventListener("click", function () {
    let newQuery = document.getElementById("searchInput").value.trim();
    if (newQuery) {
        currentQuery = newQuery;
        currentPage = 1;
        window.history.pushState({}, "", `?query=${encodeURIComponent(newQuery)}&page=1`);
        handleSearch(newQuery, currentPage);
    }
});

document.getElementById("searchInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("searchButton").click();
    }
});

document.getElementById("nextPage").addEventListener("click", function () {
    if (currentPage < totalPages) {
        currentPage++;
        window.history.pushState({}, "", `?query=${encodeURIComponent(currentQuery)}&page=${currentPage}`);
        handleSearch(currentQuery, currentPage);
    }
});

document.getElementById("prevPage").addEventListener("click", function () {
    if (currentPage > 1) {
        currentPage--;
        window.history.pushState({}, "", `?query=${encodeURIComponent(currentQuery)}&page=${currentPage}`);
        handleSearch(currentQuery, currentPage);
    }
});


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