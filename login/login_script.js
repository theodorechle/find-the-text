function Submit() {
    const token = sessionStorage.getItem("connection_token")
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    const body = {username, password, token}
    const options = {method: "POST", headers: {"Content-Type":"text/json"},body: JSON.stringify(body)}
    document.getElementById("error").setAttribute("hidden", "hidden")
    fetch('/login', options)
    .then(res => {
        if (res.status == 401) {
            document.getElementById("error").removeAttribute("hidden")
            }
        else {return res.json()}})
    .then(
    res => {
        if (res) {
            sessionStorage.setItem("connection_token",res.token);
            const options = {method: "POST", headers: {"Content-type":"text/json"}, body: JSON.stringify({token})}
            fetch("/game/disconnect", options)
            .then(res => res.json())
            .then(() => {
            sessionStorage.setItem("connection_token",res.token);
            sessionStorage.removeItem("anonymous")
            window.location.assign("/game/");
            })
    }})
}

function check_enter(event) {
    if (event.key === "Enter") {
        Submit()
    }
}

window.onload = () => {
document.getElementById("username").addEventListener("keydown", check_enter)
document.getElementById("password").addEventListener("keydown", check_enter)
}