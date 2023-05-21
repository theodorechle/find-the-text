function Submit() {
    username = document.getElementById("username").value
    password = document.getElementById("password").value
    const body = {username, password}
    const options = {method: "POST", headers: {"Content-Type":"text/json"},body: JSON.stringify(body)}
    document.getElementById("error").setAttribute("hidden", "hidden")
    fetch('/login', options)
    .then(res => {
        console.log(res.status)
        if (res.status == 401) {document.getElementById("error").removeAttribute("hidden")}
        return res.json()})
    .then(
    res => {
            sessionStorage.setItem("connection_token",res.token);
            window.location.assign("/game/");
    })
}

function check_enter(event) {
    console.log("yes")
    if (event.key === "Enter") {
        Submit()
    }
}

window.onload = () => {
document.getElementById("username").addEventListener("keydown", check_enter)
document.getElementById("password").addEventListener("keydown", check_enter)
}