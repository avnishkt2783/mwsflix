document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            alert("Login Successful!");
            window.location.href = "index.html";
        } else {
            alert(data.message || "Login failed!");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong!");
    }
});

document.getElementById("togglePassword").addEventListener("click", function () {
    let passwordField = document.getElementById("password");
    let icon = this.querySelector("i");

    if (passwordField.type === "password") {
        passwordField.type = "text";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
    } else {
        passwordField.type = "password";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
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