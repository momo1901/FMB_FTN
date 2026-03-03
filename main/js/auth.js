function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "madarwala" && password === "1234") {
        localStorage.setItem("role", "madarwala");
        window.location.href = "costing.html";
    } 
    else if (username === "admin" && password === "admin123") {
        localStorage.setItem("role", "admin");
        window.location.href = "costing.html";
    } 
    else {
        alert("Invalid credentials");
    }
}