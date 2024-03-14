<?php
$dbHostname = "localhost";
$dbUsername = "root";
$dbPassword = "";
$dbName = "database";

$messages = new stdClass();
$messages->differentPasswd = false;
$messages->nameEmpty = false;
$messages->passwdEmpty = false;
$messages->exists = false;
$messages->created = false;
$messages->internalError = false;

$connection = new mysqli($dbHostname, $dbUsername, $dbPassword, $dbName);
if ($connection->connect_error) $messages->internalError = true;
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = json_decode(file_get_contents("php://input"), true);
    if (!isset($json['username']) || $json['username'] === '') $messages->nameEmpty = true;
    elseif (!isset($json['password']) || $json['password'] === '') $messages->passwdEmpty = true;
    elseif ($json['password'] != $json['password-check']) $messages->differentPasswd = true;
    else {
        $result = $connection->query("SELECT user_exists('{$json['username']}');");
        if ($result == false) {
            $messages->internalError = true;
            http_response_code(500);
        }
        else {
            $messages->exists = $result->fetch_column();
            if (!$messages->exists) {
                $hashedPasswd = password_hash($json['password'], PASSWORD_ARGON2ID);
                $result = $connection->query("CALL create_user('{$json['username']}', '$hashedPasswd', 0);");
                if ($result == false) {
                    $messages->internalError = true;
                    http_response_code(500);
                }
                else $messages->created = true;
            }
        }
    }
    echo json_encode($messages);
    exit;
}
?>
<!DOCTYPE html>
<html lang=fr>
    <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="create_account.css">
        <script src="create_account.js"></script>
        <title>Apprend ton texte.</title>
    </head>
    <body>
        <button><a href="../index.php">Retour à la page principale</a></button>
        <div id="creation-div" class="flex-vertical-div">
            <span id="internal-error" hidden>Erreur du serveur</span>
            <span id="bad-name" hidden>Ce nom est déjà utilisé</span>
            <span id="bad-passwords" hidden>Mots de passes différents</span>
            <div id="username-div" class="flex-vertical-div">
                <span id="empty-name" hidden>Vous devez compléter ce champ</span>
                <label for="username">Nom</label>
                <input name="username" type="text" id="username-input">
            </div>
            <div id="password-div" class="flex-vertical-div">
                <span id="empty-passwd" hidden>Vous devez compléter ce champ</span>
                <label for="password">Mot de passe</label>
                <input name="password" type="password" id="password-input">
            </div>
            <div id="password-check-div" class="flex-vertical-div">
                <label for="password-check">Confirmation du mot de passe</label>
                <input name="password-check" type="password" id="password-check-input">
            </div>
            <button id="creation-button" onclick="sendInfos()">Connexion</button>
        </div>
    </body>
</html>