<?php
$dbHostname = "localhost";
$dbUsername = "root";
$dbPassword = "";
$dbName = "database";
$attemptToConnect = false;
$badEntry = false;
$connection = new mysqli($dbHostname, $dbUsername, $dbPassword, $dbName);
if ($connection->connect_error) {
    die("Connection failed to database : " . $connection->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $attemptToConnect = true;
    $userName = $_POST['username'];
    $userPasswd = $_POST['password'];
    if (!isset($userName) || $userName === '' || !isset($userPasswd) || $userPasswd === '') $badEntry = true;
    else {
        $result = $connection->query("SELECT user_password FROM users WHERE username = '{$userName}';");
        if ($result == false) {
            $internalError = true;
            http_response_code(500);
        }
        else {
            $passwd = $result->fetch_column();
            if ($passwd === NULL || !password_verify($userPasswd, $passwd)) $badEntry = true;
        }
    }
}
?>
<!DOCTYPE html>
<html lang=fr>
    <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="connection.css">
        <script src="connection.js"></script>
        <title>Apprend ton texte.</title>
    </head>
    <body <?php if ($attemptToConnect && !$badEntry) echo "onload='window.location=\"../index.php\"'"; ?>>
        <button><a href="../index.php">Retour à la page principale</a></button>
        <form id="connection" action="" method="POST">
        <div id="connection-div" class="flex-vertical-div">
            <?php if ($attemptToConnect && $badEntry) echo "<span>Identifiant ou mot de passe incorrect</span>"; ?>
            <div id="username-div" class="flex-vertical-div">
                <label for="username">Nom</label>
                <input name="username" type="text" id="username-input" required <?php echo isset($userName) ? "value='$userName'" : "autofocus" ?>>
            </div>
            <div id="password-div" class="flex-vertical-div">
                <label for="password">Mot de passe</label>
                <input name="password" type="password" id="password-input" required <?php if (isset($userName)) echo "autofocus" ?>>
            </div>
            <button id="connection-button" type="submit">Connexion</button>
        </div>
        <form>
    </body>
</html>