var timer_interval;

function create_button() {
    token = sessionStorage.getItem("connection_token")
    console.log("token : ", token)
    if (token != null && token >= 0) {
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
}

function disconnect() {
    console.log("token : ", sessionStorage.getItem("connection_token"))
    const options = {method: "POST", headers: {"Content-type":"text/json"}, body: JSON.stringify({"token": sessionStorage.getItem("connection_token")})}
    fetch("/game/disconnect", options)
    .then( () => {
    console.log(1, sessionStorage.getItem("connection_token"))
    sessionStorage.removeItem("connection_token")
    console.log(2, sessionStorage.getItem("connection_token"))
    window.location.assign("/game/")
    console.log(3, sessionStorage.getItem("connection_token"))
    })
}

function start() {
    const pre_text = document.getElementById("entire_text");
    const pre_name = document.getElementById("entire_name");
    const text = document.getElementById("text").value;
    const name = document.getElementById("name").value;
    let timer = document.getElementById("text_timer")
    if (timer === null) {
        timer = 0
    }
    else {
           timer = timer.dataset.time
    }
    const body = {name, text, timer};
    if (text == "" || name == "") {return}
    try {
        document.getElementById("texts").hidden = true
    } catch (error) {}
    pre_text.value = "";
    pre_name.value = "";
    win = document.getElementById("win");
    if (win) {win.remove()};
    document.getElementById("entire_name").innerHTML = ""
    document.getElementById("entire_text").innerHTML = ""
    const options = {method: "POST", headers: {"Content-Type":"text/json"},body: JSON.stringify(body)}
    fetch('/game/new_text', options)
    .then(res => res.json())
    .then(json_indexes => {
        sessionStorage.setItem("id", json_indexes.id)
        set_indexes(json_indexes.name.indexes, pre_name, "n")
        set_indexes(json_indexes.text.indexes, pre_text, "w")
        document.getElementById("new_word").disabled = false;
        document.getElementById("start_button").disabled = true;
        document.getElementById("text").value = "";
        document.getElementById("name").value = "";
    });
    restart_timer();
}

function set_indexes(indexes, container, prefix) {
    indexes.forEach(
    (value, index_) => {
        const index = value[0];
        const word = value[1];
        
        let span = document.createElement("span");
        span.id = `${prefix}_${index_}`;
        if (word === "") {
            span.classList.add("hide");
            span.innerHTML = "&nbsp;".repeat(index);
        }
        else {
            span.innerHTML = word;
        }
        container.appendChild(span);
        
    })
}

function submit_word(event) {
    if (event.key === "Enter") {
        find_word()
    }
}

function find_word() {
    let input_word = document.getElementById("new_word");
    let word = input_word.value.toLowerCase();
    word = word.replaceAll(" ", "");
    const id = sessionStorage.getItem("id")
    const body = {word, id}
    fetch("/game/submit_word",{method: "POST", headers: {"Content-Type":"text/json"},body: JSON.stringify(body)})
    .then(res => res.json())
    .then(data => {
        data.name.forEach((value) => {
            element = document.getElementById(`n_${value[0]}`)
            element.classList.remove("hide")
            element.innerHTML = value[1]
        })
        data.text.forEach((value) => {
            element = document.getElementById(`w_${value[0]}`)
            element.classList.remove("hide")
            element.innerHTML = value[1]
        })
        input_word.value = ""
        complete()
    }
    )
}

function complete() {
    if (document.getElementsByClassName("hide").length == 0) {
        if (document.getElementById("win") === null) {
        let label = document.createElement("label")
        label.textContent = "Félicitations, tu as fini !"
        label.id = "win"
        document.body.appendChild(label)
        document.getElementById("start_button").disabled = false
        document.getElementById("new_word").disabled = true
        try {
            document.getElementById("texts").hidden = false
        } catch (error) {}
        clearInterval(timer_interval);
    }}
}

function restart() {
    id = sessionStorage.getItem("id")
    if (timer_interval) {
        clearInterval(timer_interval);
    }
    if (!id) {return}
    try {
        document.getElementById("texts").hidden = false
    } catch (error) {}
    button = document.getElementById("start_button")
    button.disabled = false
    input = document.getElementById("new_word")
    input.disabled = true
    input.value = ""
    const options = {method: "POST", headers: {"Content-Type":"text/plain"},body: id}
    fetch("/get_text", options)
    .then(
        res => {
            if (res.status === 401) {
                sessionStorage.removeItem("id")
            }
            return res.json()
        })
        .then(res => {
            if (sessionStorage.getItem("id") != null) {
                document.getElementById("name").value = res.name;
                document.getElementById("text").value = res.text;
            }
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
    if (sessionStorage.getItem("connection_token")) {
        table = document.getElementById("texts")
        const options = {method: "POST", headers: {"Content-Type":"text/plain"},body: sessionStorage.getItem("connection_token")}
        fetch("/game/texts_db", options)
        .then(res => res.json())
        .then(lines =>
        lines.forEach(function(item, index) {
            const line = document.createElement("tr")
            line.id = `${index}`
            const case1 = document.createElement("div")
            const container1 = document.createElement("td")
            case1.innerHTML = item[1]
            case1.className = "scrollbox"
            container1.appendChild(case1)
            line.appendChild(container1)
            const case2 = document.createElement("div")
            const container2 = document.createElement("td")
            case2.innerHTML = item[2]
            case2.className = "scrollbox"
            container2.appendChild(case2)
            line.appendChild(container2)
            const case3 = document.createElement("div")
            const container3 = document.createElement("td")
            case3.innerHTML = item[4]
            case3.className = "scrollbox"
            container3.appendChild(case3)
            line.appendChild(container3)
            
            table.appendChild(line)
        }))
        document.body.appendChild(table)
        
        table.addEventListener("click",click_on_table);
    }
}

function click_on_table(event) {
    const clickedRow = event.target.closest("tr");
    if (clickedRow && clickedRow.id) {
        const values = clickedRow.cells
        document.getElementById("name").value = values[0].getElementsByClassName("scrollbox")[0].innerHTML;
        document.getElementById("text").value = values[1].getElementsByClassName("scrollbox")[0].innerHTML;
        document.getElementById("text_timer").dataset.time = values[2].getElementsByClassName("scrollbox")[0].innerHTML;
    }
}

function create_anonymous_token() {
    fetch('/login/login_anonym')
    .then(res => {
        return res.json()})
    .then(res => {
        sessionStorage.setItem("connection_token",res.token);
    })
}

function begin() {
    if (!sessionStorage.getItem("connection_token")) {create_anonymous_token()}
    create_button()
    saved_texts()
    document.getElementById("text_timer").addEventListener(
        "timer_ended", () => {
            finish()
        }
        )
        
    }

function restart_timer() {
    let timer = document.getElementById("text_timer")
    let time = parseInt(timer.dataset.time);
    set_timer_value(parseInt(time / 60).toString(), (time % 60).toString())
    timer_interval = setTimeout(timer_function, 1000);
}

function set_timer_value(min, sec) {
    let timer = document.getElementById("text_timer")
    const s_min = min.toString().padStart(2, "0")
    const s_sec = sec.toString().padStart(2, "0")
    timer.innerText = `${s_min}:${s_sec}`
    timer.dataset.min = s_min
    timer.dataset.sec = s_sec
}

function timer_function() {
    let timer = document.getElementById("text_timer")
    let min = parseInt(timer.dataset.min)
    let sec = parseInt(timer.dataset.sec)
    sec --
    if (sec === -1) {
        min --
        sec += 60
    }
    set_timer_value(min, sec)
    if (min == 0 && sec == 0 || min < 0) {
        timer.innerText = "00:00"
        timer.dispatchEvent(new Event("timer_ended"))
    }
    else {
        timer_interval = setTimeout(timer_function, 1000);
    }}
    
function finish() {
    let label = document.createElement("label")
    let split_chars = /([ ,\?\.;\/:!'"`\n\t\\|_\-]+)/
    label.textContent = "Presque !"
    label.id = "win"
    document.body.appendChild(label)
    document.getElementById("start_button").disabled = false
    document.getElementById("new_word").disabled = true
    try {
        document.getElementById("texts").hidden = false
    } catch (error) {}
   const id = sessionStorage.getItem("id")
    if (!id) {return}
    const options = {method: "POST", headers: {"Content-Type":"text/plain"},body: id}
    fetch("/get_text", options)
    .then(
    res => {
        if (res.status === 401) {
            sessionStorage.removeItem("id")
        }
        return res.json()
    })
    .then(res => {
        if (sessionStorage.getItem("id") != null) {
        res.name.split(split_chars).filter(Boolean).forEach(
            (word, index) => {
                let span = document.getElementById(`n_${index}`)
                if (span.classList.contains("hide")) {
                    span.classList.remove("hide")
                    span.classList.add("not-found")
                    span.innerHTML = word
                }
            }
        )
    res.text.split(split_chars).filter(Boolean).forEach(
        (word, index) => {
            let span = document.getElementById(`w_${index}`)
            if (span.classList.contains("hide")) {
                span.classList.remove("hide")
                span.classList.add("not-found")
                span.innerHTML = word
            }
        }
    )
    }
})
}