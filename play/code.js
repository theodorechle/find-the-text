var timer_interval;
var answers = [];
var answers_index = 0;

window.onload = () => {

    document.getElementById("entire_name").innerHTML = ""
    document.getElementById("entire_text").innerHTML = ""
    restart_timer()
    document.getElementById("text_timer").addEventListener(
        "timer_ended", () => {
            finish()
    })
}

function start(button) {
    button.hidden = true
    document.getElementById("win").hidden = true
    document.getElementById("pause_button").hidden = false;
    document.getElementById("entire_name").innerHTML = ""
    document.getElementById("entire_text").innerHTML = ""
    document.getElementById("new_word").value = ""
    document.getElementById("new_word").disabled = false;
    id = sessionStorage.getItem("id")
    token = sessionStorage.getItem("connection_token")
    const body = {id, token}
    const options = {method: "POST", headers: {"Content-Type":"text/plain"},body: JSON.stringify(body)}
    fetch('/get_indexes', options)
    .then(res => res.json())
    .then(json_indexes => {
        sessionStorage.setItem("connection_token", json_indexes.token)
        set_indexes(json_indexes.name.indexes, document.getElementById("entire_name"), "n")
        set_indexes(json_indexes.text.indexes, document.getElementById("entire_text"), "w")
        document.getElementById("text_timer").dataset.time = json_indexes.timer
        document.getElementById("text_timer").hidden = false;
        restart_timer()
    });
    launch_timer()
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
    if (word == "") {return}
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
        let label = document.getElementById("win")
        label.hidden = false
        label.textContent = "Félicitations, tu as fini !"
        document.getElementById("start_button").hidden = false
        document.getElementById("new_word").disabled = true

        clearInterval(timer_interval);
    }
}


function launch_timer () {
    timer_interval = setTimeout(timer_function, 1000);
}

function restart_timer() {
    let timer = document.getElementById("text_timer")
    let time = parseInt(timer.dataset.time);
    set_timer_value(parseInt(time / 60).toString(), (time % 60).toString())
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

function set_timer_value(min, sec) {
    let timer = document.getElementById("text_timer")
    const s_min = min.toString().padStart(2, "0")
    const s_sec = sec.toString().padStart(2, "0")
    timer.innerText = `${s_min}:${s_sec}`
    timer.dataset.min = s_min
    timer.dataset.sec = s_sec
}

function stop_time() {
    clearInterval(timer_interval)
}


function finish() {
    let split_chars = /([ ,\?\.;\/:!'"`\n\t\\|_\-]+)/
    answers = []
    let label = document.getElementById("win")
    label.hidden = false
    label.textContent = "Presque !"
    document.getElementById("new_word").disabled = true
    document.getElementById("start_button").hidden = false
    document.getElementById("pause_button").hidden = true;
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
        )}
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
})
}

function change_pause(button) {
    if (button.dataset.pause == "false") {
        button.innerHTML = "Reprendre"
        button.dataset.pause = "true"
        stop_time()
        document.getElementById("new_word").disabled = true
    }
    else {
        button.innerHTML = "Pause"
        button.dataset.pause = "false"
        launch_timer()
        document.getElementById("new_word").disabled = false
    }
}