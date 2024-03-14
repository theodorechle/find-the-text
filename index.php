<?php
$hostname = "localhost";
$username = "root";
$password = "";
$dbName = "database";
$connection = new mysqli($hostname, $username, $password, $dbName);
if ($connection->connect_error) {
    die("Connection failed to database : " . $connection->connect_error);

}
?>
<!DOCTYPE html>
<html lang=fr>
    <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="style.css">
        <script src="code.js"></script>
        <title>Apprend ton texte.</title>
    </head>
    <body>
        <div id='account-buttons'>
            <button><a href="create_account/create_account.php">Créer un compte</a></button>
            <button><a href="connection/connection.php">Connexion</a></button>
            <button><a href="">Compte</a></button>
        </div>
        <textarea id='title' type='text' size='50' autofocus placeholder='Titre'></textarea>
        <textarea id='text' rows='20' cols='20' name='text_to_learn' placeholder='Texte'></textarea>
        <?php
        $result = $connection->query("SELECT id, title FROM texts WHERE creator=0;");
        if ($result->num_rows > 0) {
            echo "<div id='user-texts'>";
            echo "<div class='user-text-title'><span>Textes</span></div>";
            while ($row = $result->fetch_assoc()) {
                echo "<div class='user-text'><span id=text-{$row['id']}>{$row['title']}</span></div>";
            }
            echo "</div>";
        }
        else {
            $title = "";
            $text = "";
        }
        ?>
        <div id='text-control-buttons'>
            <button id="launch-button" disabled>Jouer</button>
            <button id="modification-button" disabled>Modifier</button>
            <button id="deletion-button" disabled>Supprimer</button>
        </div>
    </body>
</html>
<?php $connection->close(); ?>