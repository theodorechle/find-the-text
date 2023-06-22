var change_value_of_timer;

function create_button() {
    const token = sessionStorage.getItem("connection_token")
    if (token != null && !sessionStorage.getItem("anonymous")) {
            connection = document.createElement("button");
            connection.onclick = disconnect
            connection.innerHTML = "Déconnexion";
            document.body.appendChild(connection);
    }
    else {
        connection = document.createElement("button");
        link = document.createElement("a");
        link.href = "/create_account/";
        link.text = "Créer un compte";
        connection.appendChild(link);
        document.body.appendChild(connection);
        connection = document.createElement("button");
        link = document.createElement("a");
        link.href = "/login/";
        link.text = "Connexion";
        connection.appendChild(link);
        document.body.appendChild(connection);
        }
    saved_texts()
}

function disconnect() {
    const options = {method: "POST", headers: {"Content-type":"text/json"}, body: JSON.stringify({"token": sessionStorage.getItem("connection_token")})}
    fetch("/game/disconnect", options)
    .then( () => {
    sessionStorage.removeItem("connection_token")
    sessionStorage.removeItem("id")
    window.location.assign("/game/")
    })
}

function start() {
    const text = document.getElementById("text").value;
    const name = document.getElementById("name").value;
    let timer = document.getElementById("text_timer")
    if (timer === null) {
        timer = 0
    }
    else {
           timer = timer.dataset.time
    }
    const token = sessionStorage.getItem("connection_token")
    const body = {name, text, timer, token};
    if (text == "" || name == "") {return}
    const options = {method: "POST", headers: {"Content-Type":"text/json"},body: JSON.stringify(body)}
    fetch("/game/new_text", options)
    .then(res => res.json())
    .then(data => {
    sessionStorage.setItem("id", data.id)
    sessionStorage.setItem("connection_token", data.token)
    window.location.assign("/play/")
    })
}


    
function save() {
    const text = document.getElementById("text").value;
    const name = document.getElementById("name").value;
    const token = sessionStorage.getItem("connection_token")
    let timer = document.getElementById("text_timer")
    if (timer === null) {
        timer = 0
    }
    else {
        timer = timer.dataset.time
    }
    if (text != "" && name != "") {
        const body = {name, text, token, timer};
        const options = {method: "POST", headers: {"Content-Type":"text/json"},body: JSON.stringify(body)}
        fetch('/game/save', options)
        .then(
        saved_texts()
        )
    }
}

function saved_texts() {
    const token = sessionStorage.getItem("connection_token")
    if (token) {
        let table = document.getElementById("texts")
        let tr = document.createElement("tr")
        let th1 = document.createElement("th")
        th1.innerHTML = "Titre"
        let th2 = document.createElement("th")
        th2.innerHTML = "Supprimer"
        tr.appendChild(th1)
        tr.appendChild(th2)
        table.children[1] = [tr]
        const options = {method: "POST", headers: {"Content-Type":"text/plain"},body: token}
        fetch("/game/texts_db", options)
        .then(res => res.json())
        .then(lines =>
        lines.forEach(function(item) {
        const line = table.insertRow(-1)
        line.id = `${item[0]}`
        const case1 = line.insertCell(0)
        const div1 = document.createElement("div")
        div1.className = "title"
        div1.innerHTML = item[1]
        case1.appendChild(div1)
        const case2 = line.insertCell(  1)
        case2.className = "delete"
        case2.innerHTML = "X"
    }))
}
}

function click_on_table(event) {
    const clickedRow = event.target.closest("tr");
    if (clickedRow && clickedRow.id) {
        const clickedDiv = event.target.closest("td")
        if (clickedDiv && clickedDiv.classList[0] === "delete") {
            const options = {method: "POST", headers: {"Content-type": "text/plain"}, body: clickedRow.id}
            fetch("/delete", options)
            .then(
                document.getElementById("texts").deleteRow(clickedRow.rowIndex)
            )
        }
        else {
        const options = {method: "POST", headers: {"Content-type": "text/plain"}, body: clickedRow.id}
        fetch("/get_text_infos", options)
        .then(
            res => {
                return res.json()
            })
            .then(res => {
                document.getElementById("name").value = clickedRow.cells[0].innerText;
                document.getElementById("text").value = res.text;
                document.getElementById("text_timer").dataset.time = res.timer;
                restart_timer()
        })
        }}
}

function create_anonymous_token() {
    fetch('/login/login_anonym')
    .then(res => {
        return res.json()})
    .then(res => {
        sessionStorage.setItem("connection_token",res.token);
        sessionStorage.setItem("anonymous",true)
    })
}

function begin() {
    create_button()
    const token = sessionStorage.getItem("connection_token")
    if (!token) {create_anonymous_token()}
    else {
        if (sessionStorage.getItem("anonymous")) {return}
        const id = sessionStorage.getItem("id")
        sessionStorage.removeItem("anonymous")
        if (id) {
            const options = {method: "POST", headers: {"Content-Type":"text/plain"},body: JSON.stringify({id, token})}
            fetch("/get_text", options)
            .then(res => res.json())
            .then(res => {
                sessionStorage.setItem("connection_token", res.token)
                if (Object.keys(res).length > 1) {
                document.getElementById("name").value = res.name
                document.getElementById("text").value = res.text
                document.getElementById("text_timer").dataset.time = res.timer
                restart_timer()
                }
        })
        }
    }
    restart_timer()
    document.getElementById("texts").addEventListener("click",click_on_table);
}

function set_timer_value(min, sec) {
    let timer = document.getElementById("text_timer")
    const s_min = min.toString().padStart(2, "0")
    const s_sec = sec.toString().padStart(2, "0")
    timer.innerText = `${s_min}:${s_sec}`
    timer.dataset.min = s_min
    timer.dataset.sec = s_sec
}
function add_time_from_button(button) {
    add_time(button)
    change_value_of_timer = setInterval(add_time, 100, button)
}

function remove_time_from_button(button) {
    remove_time(button)
    change_value_of_timer = setInterval(remove_time, 100, button)
}

function add_time(button) {
    let timer = document.getElementById("text_timer")
    if (button.className == "sec") {
    timer.dataset.time = (parseInt(timer.dataset.time)+1).toString()}
    else {
    timer.dataset.time = (parseInt(timer.dataset.time)+60).toString()}
    restart_timer()
}

function remove_time(button) {
    let timer = document.getElementById("text_timer")
    let time = parseInt(timer.dataset.time)
    if (button.className == "sec") {
        if (time > 0) {
        timer.dataset.time = (parseInt(time)-1).toString()}
        restart_timer()
    }
    else {
        if (time >= 60) {
    timer.dataset.time = (parseInt(time)-60).toString()
    restart_timer()
    }
    }
}

function stop_time() {
    clearInterval(change_value_of_timer)
}

function restart_timer() {
    let timer = document.getElementById("text_timer")
    let time = parseInt(timer.dataset.time);
    set_timer_value(parseInt(time / 60).toString(), (time % 60).toString())
}

