const errors = ["bad-name", "bad-passwords", "empty-name", "empty-passwd", "internal-error"];

function sendInfos() {
    let body = {
        'username': document.getElementById('username-input').value,
        'password': document.getElementById('password-input').value,
        'password-check': document.getElementById('password-check-input').value
    };
    let options = {
        method: 'POST',
        body: JSON.stringify(body)
    }
    fetch('', options)
    .then( res => res.json())
    .then( res => {
        if (res.created) window.location = "../index.php";
        else toggleErrorMessages(res);
    }
    )
}



function toggleErrorMessages(res) {
    errors.forEach( (error) => document.getElementById(error).hidden = true);
    if (res.exists) document.getElementById(errors[0]).hidden = false;
    else if (res.differentPasswd) document.getElementById(errors[1]).hidden = false;
    else if (res.nameEmpty) document.getElementById(errors[2]).hidden = false;
    else if (res.passwdEmpty) document.getElementById(errors[3]).hidden = false;
    else if (res.internalError) document.getElementById(errors[4]).hidden = false;
}