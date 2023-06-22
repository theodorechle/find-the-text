function Submit() {
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    document.getElementById("length_error").setAttribute("hidden", "hidden")
    document.getElementById("empty_error").setAttribute("hidden", "hidden")
    document.getElementById("password_error").setAttribute("hidden", "hidden")
    document.getElementById("username_error").setAttribute("hidden", "hidden")
    if (username.length < 25) {
    if (username && password) {
    if (password == document.getElementById("password_confirmation").value) {
        const body = {username, password}
        const options = {method: "POST", headers: {"Content-Type":"text/json"},body: JSON.stringify(body)}
        fetch('/create_account', options)
        .then(res => {
        if (res.status == 201)
        {
            disconnect()
            fetch('/login', options)
            .then(res => {
                return res.json()})
            .then(
            res => {
                sessionStorage.setItem("connection_token",res.token);
                sessionStorage.removeItem("anonymous")
                window.location.assign("/game/")
            })

        }
        else
        {
            document.getElementById("username_error").removeAttribute("hidden")
        };
    })
    }
    else {
    document.getElementById("password_error").removeAttribute("hidden")
    }
    }
    else {
        document.getElementById("empty_error").removeAttribute("hidden")
    }
    }
    else {
        document.getElementById("length_error").removeAttribute("hidden")
    }
}

function disconnect() {
    const options = {method: "POST", headers: {"Content-type":"text/json"}, body: JSON.stringify({"token": sessionStorage.getItem("connection_token")})}
    fetch("/game/disconnect", options)
    sessionStorage.removeItem("connection_token")
}

function check_enter(event) {
    if (event.key === "Enter") {
        Submit()
    }
}

window.onload = () => {
document.getElementById("username").addEventListener("keydown", check_enter)
document.getElementById("password").addEventListener("keydown", check_enter)
document.getElementById("password_confirmation").addEventListener("keydown", check_enter)
}