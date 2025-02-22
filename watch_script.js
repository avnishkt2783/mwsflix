const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");
let movieName = urlParams.get("title");

movieName = movieName ? decodeURIComponent(movieName.replace(/\+/g, " ")) : "Unknown Movie";

document.title = `Watch - ${movieName}`;
document.getElementById("exitPlayer").href = `https://mwsflix.onrender.com/details.html?id=${movieId}`;

document.addEventListener("DOMContentLoaded", function () {
    let popupElement = document.getElementById('warningPopup');
    let warningPopup = new bootstrap.Modal(popupElement);

    document.getElementById('openWarningPopup').addEventListener('click', function () {
        warningPopup.show();
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const sources = [
        { name: "111Movies", url: "https://111movies.com/movie/" },
        { name: "2Embed", url: "https://www.2embed.cc/embed/" },
        { name: "AutoEmbed", url: "https://player.autoembed.cc/embed/movie/" },
        { name: "Embed.su", url: "https://embed.su/embed/movie/" },
        { name: "Flicky", url: "https://flicky.host/embed/movie/?id=" },
        { name: "GDrive Player", url: "https://databasegdriveplayer.xyz/player.php?tmdb=" },
        { name: "GoDrivePlayer", url: "https://godriveplayer.com/player.php?imdb=" },
        { name: "MoviesAPI", url: "https://moviesapi.club/movie/" },
        { name: "PStream", url: "https://iframe.pstream.org/embed/tmdb-movie-" },
        { name: "RG Shows (API 1)", url: "https://embed.rgshows.me/api/1/movie/?id=" },
        { name: "RG Shows (API 2)", url: "https://embed.rgshows.me/api/2/movie/?id=" },
        { name: "RG Shows (API 3)", url: "https://embed.rgshows.me/api/3/movie/?id=" },
        { name: "Rivestream", url: "https://rivestream.live/embed?type=movie&id=" },
        { name: "SmashyStream", url: "https://player.smashy.stream/movie/" },
        { name: "SpencerDevs", url: "https://embed.spencerdevs.xyz/movie/" },
        { name: "Videasy", url: "https://player.videasy.net/movie/" },
        { name: "VidFast", url: "https://vidfast.pro/movie/" },
        { name: "VidLink", url: "https://vidlink.pro/movie/" },
        { name: "Vidsrc.in", url: "https://vidsrc.in/embed/movie?tmdb=" },
        { name: "VidSrc.cc", url: "https://vidsrc.cc/v2/embed/movie/?autoPlay=false&tmdb=" },
        { name: "VidSrc.rip", url: "https://vidsrc.rip/embed/movie/" },
        { name: "VidSrc.su", url: "https://vidsrc.su/embed/movie/" },
        { name: "VidSrc.vip", url: "https://vidsrc.vip/embed/movie/" },
        { name: "VidStream", url: "https://vidstream.site/embed/movie/" },
    ];

    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get("id");

    if (!movieId) {
        document.body.innerHTML = "<h2 style='color: white; text-align: center;'>Invalid Movie ID</h2>";
        return;
    }

    const movieFrame = document.getElementById("movieFrame");
    const sourceDropdown = document.getElementById("sourceDropdown");
    const sourceList = document.getElementById("sourceList");

    function changeSource(url, listItem) {
        movieFrame.src = url + movieId;

        sourceDropdown.value = url;

        document.querySelectorAll("#sourceList li").forEach(li => li.classList.remove("active"));

        if (listItem) {
            listItem.classList.add("active");
        }
    }

    sources.forEach(source => {
        const listItem = document.createElement("li");
        listItem.textContent = source.name;
        listItem.addEventListener("click", () => changeSource(source.url, listItem));
        sourceList.appendChild(listItem);

        const option = document.createElement("option");
        option.value = source.url;
        option.textContent = source.name;
        sourceDropdown.appendChild(option);
    });

    sourceDropdown.addEventListener("change", function () {
        changeSource(this.value, null);
    });

    changeSource(sources[0].url, document.querySelector("#sourceList li"));
});