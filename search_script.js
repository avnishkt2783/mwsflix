const apiKey = "a28bda684eca7826525d86acdbc4edea";
let currentPage = 1;
let totalPages = 1;
let currentQuery = "";
const movieResults = document.getElementById("movieResults");
const backdropContainer = document.getElementById("backdropContainer");

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
        backdrop.src = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
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