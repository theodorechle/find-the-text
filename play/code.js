var timer_interval;
var change_value_of_timer;
var answers = [];
var answers_index = 0

function create_button() {
    token = sessionStorage.getItem("connection_token")
    if (token != null) {
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
    window.location.assign("/game/")
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
    [].forEach.call(document.getElementsByClassName("min"), (element => element.hidden = true));
    [].forEach.call(document.getElementsByClassName("sec"), (element => element.hidden = true));
    launch_timer();
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

function previous_answer() {
    if (answers.length > 0 && answers_index > 0) {
        answers_index -= 1
        let input = document.getElementById("new_word")
        input.value = answers[answers_index]
    }
}

function next_answer() {
    if (answers_index < answers.length-1) {
        answers_index += 1
        let input = document.getElementById("new_word")
        input.value = answers[answers_index]
    
    }
    else {if (answers_index === answers.length-1) {
        answers_index += 1
        let input = document.getElementById("new_word")
        input.value = ""
    }}
}


function submit_word(event) {
    switch (event.key) {
        case "Enter":
            find_word()
            break;
        case "ArrowUp":
            previous_answer()
            event.preventDefault()
            break;
        case "ArrowDown":
            next_answer()
            event.preventDefault()
            break;
    }

}

function find_word() {
    let input_word = document.getElementById("new_word");
    let word = input_word.value.toLowerCase();
    word = word.replaceAll(" ", "");
    const id = sessionStorage.getItem("id")
    const body = {word, id}
    answers.push(word)
    answers_index = answers.length
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
    input.value = "";
    [].forEach.call(document.getElementsByClassName("min"), (element => element.hidden = false));
    [].forEach.call(document.getElementsByClassName("sec"), (element => element.hidden = false));
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
        let table = document.getElementById("texts");
        Array.prototype.forEach.call(table.getElementsByTagName("tr"), (row => row.remove()))
        const options = {method: "POST", headers: {"Content-Type":"text/plain"},body: sessionStorage.getItem("connection_token")}
        fetch("/game/texts_db", options)
        .then(res => res.json())
        .then(lines =>
            lines.forEach(function(item) {
            const line = document.createElement("tr")
            line.id = `${item[0]}`
            const case1 = document.createElement("td")
            const div1 = document.createElement("div")
            div1.className = "title"
            div1.innerHTML = item[1]
            case1.appendChild(div1)
            line.appendChild(case1)
            const case2 = document.createElement("td")
            case2.className = "delete"
            case2.innerHTML = "X"
            line.appendChild(case2)

            table.appendChild(line)
        }))
        document.body.appendChild(table)
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
    })
}

function begin() {
    if (!sessionStorage.getItem("connection_token")) {create_anonymous_token()}
    create_button()
    restart_timer()
    document.getElementById("texts").addEventListener("click",click_on_table);
    document.getElementById("text_timer").addEventListener(
        "timer_ended", () => {
            finish()
        }
        )
        
    }

function launch_timer () {
    restart_timer()
    timer_interval = setTimeout(timer_function, 1000);
}

function restart_timer() {
    let timer = document.getElementById("text_timer")
    let time = parseInt(timer.dataset.time);
    set_timer_value(parseInt(time / 60).toString(), (time % 60).toString())
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
    answers = []
    document.body.appendChild(label)
    document.getElementById("start_button").disabled = false
    document.getElementById("new_word").disabled = true
    try {
        document.getElementById("texts").hidden = false
    } catch (error) {}
   const id = sessionStorage.getItem("id")
    if (!id) {return}
    [].forEach.call(document.getElementsByClassName("min"), (element => element.hidden = false));
    [].forEach.call(document.getElementsByClassName("sec"), (element => element.hidden = false));
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
        if (time > 60) {
    timer.dataset.time = (parseInt(time)-60).toString()
    restart_timer()
    }
    }
}

function stop_time() {
    clearInterval(change_value_of_timer)
}