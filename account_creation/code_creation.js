function Submit() {
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    if (username && password) {
        if (password == document.getElementById("password_confirmation").value) {
    const body = {username, password}
    const options = {method: "POST", headers: {"Content-Type":"text/json"},body: JSON.stringify(body)}
    document.getElementById("username_error").setAttribute("hidden", "hidden")
    document.getElementById("password_error").setAttribute("hidden", "hidden")
    document.getElementById("empty_error").setAttribute("hidden", "hidden")
    fetch('/create_account', options)
    .then(res => {
        if (res.status == 201)
        {window.location.assign("/game/")}
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

function check_enter(event) {
    console.log("yes")
    if (event.key === "Enter") {
        Submit()
    }
}

window.onload = () => {
document.getElementById("username").addEventListener("keydown", check_enter)
document.getElementById("password").addEventListener("keydown", check_enter)
document.getElementById("password_confirmation").addEventListener("keydown", check_enter)
}