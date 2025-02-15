document.querySelector("#loginForm").addEventListener("submit", handleSubmit);

async function handleSubmit(event) {
    event.preventDefault();

    let user = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    let response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    });

    if (response.status != 200) {
        const errorBox = document.createElement("div");
        errorBox.className = "error-login";
        errorBox.innerHTML = "email ou mot de pass incorrect";
        document.querySelector("form").prepend(errorBox);
        return;
    }

    let result = await response.json();
    const token = result.token;
    // Stocke le token dans le sessionStorage
    sessionStorage.setItem("authToken", token);


    // Redirection après connexion réussie
    window.location.href= "index.html";




}