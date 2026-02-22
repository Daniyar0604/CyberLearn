<?php
// g:\cyberlearn\labs\sqli-blind\index.php

$task = $_GET['task'] ?? '1';

/**
 * Инициализация SQLite (один раз, автоматически)
 */
$db = new SQLite3('lab.db');

$db->exec("
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
)
");

$count = $db->querySingle("SELECT COUNT(*) FROM users");
if ($count == 0) {
    $db->exec("
        INSERT INTO users (username, password) VALUES
        ('admin', 'admin123'),
        ('user', 'password'),
        ('test', 'test123')
    ");
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>SQL Injection Lab</title>
    <style>
        body {
            font-family: sans-serif;
            padding: 2rem;
            background: #f7f7f7;
        }
        .box {
            background: white;
            padding: 2rem;
            max-width: 600px;
            margin: auto;
            border-radius: 8px;
        }
        input, button {
            padding: 0.5rem;
            font-size: 1rem;
        }
        .sql {
            background: #eee;
            padding: 0.5rem;
            font-family: monospace;
        }
    </style>
</head>
<body>

<div class="box">
    <h1>🕵️ SQL Injection Lab</h1>

    <?php
    switch ($task) {

        /**
         * =========================
         * УПРАЖНЕНИЕ №1
         * БАЗОВАЯ SQL-INJECTION
         * =========================
         */
        case '1':
            echo "<h2>Поиск пользователя по ID</h2>";

            $id = $_GET['id'] ?? '';

            echo '
            <form>
                <input type="hidden" name="task" value="1">
                <input name="id" placeholder="Введите ID пользователя">
                <button>Найти</button>
            </form>
            ';

            if ($id !== '') {
                $sql = "SELECT username FROM users WHERE id = $id";
                echo "<p>SQL-запрос:</p>";
                echo "<div class='sql'>$sql</div>";

                $result = @$db->query($sql);

                if ($result) {
                    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                        echo "<p>Найден пользователь: <b>{$row['username']}</b></p>";
                    }
                } else {
                    echo "<p>Ошибка запроса</p>";
                }
            }
            break;

        default:
            echo "<p>Неизвестное задание</p>";
    }
    ?>

</div>

</body>
</html>
