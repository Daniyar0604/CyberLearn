SET NAMES utf8mb4;

USE cyberlearn;

CREATE TABLE users (
   id INT AUTO_INCREMENT PRIMARY KEY,
   username VARCHAR(50) NOT NULL,
   email VARCHAR(100) NOT NULL,
   password VARCHAR(255) NOT NULL,
   role ENUM('user', 'admin') NOT NULL DEFAULT 'user',

   -- Аватар: путь к файлу на сервере

   avatar VARCHAR(255) DEFAULT 'default-avatar.png',

   -- Био: с лимитом символов

   bio VARCHAR(250) DEFAULT 'Изучаю кибербезопасность и этичный хакинг',

   -- Уровень (ссылается по названию на таблицу levels)

   level VARCHAR(50) NOT NULL DEFAULT 'Beginner',
   experience INT NOT NULL DEFAULT 0,
   study_hours INT NOT NULL DEFAULT 0,

   -- Счетчик полученных достижений

   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   UNIQUE KEY unique_username (username),
   UNIQUE KEY unique_email (email)
);


INSERT INTO users (username, email, password, role, level)
VALUES (
      'admin_user',
      'admin@cyberlearn.ru',
      'hashed_password_here',
      'admin',
      'Advanced'
   ),
   (
      'security_student',
      'student@example.com',
      'hashed_password_here',
      'user',
      'Beginner'
   ),
   (
      'pentester_pro',
      'pro@cyberlearn.ru',
      'hashed_password_here',
      'user',
      'Intermediate'
   );

SELECT * FROM users;

UPDATE users
SET role = 'admin'
WHERE id = 3;

CREATE TABLE vulnerabilities (
   id INT AUTO_INCREMENT PRIMARY KEY,
   code VARCHAR(50) UNIQUE NOT NULL,
   -- sqli, xss, csrf, rce
   title VARCHAR(100) NOT NULL,
   -- SQL Injection
   description TEXT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO vulnerabilities (code, title, description)
VALUES (
      'sql',
      'SQL Injection',
      'Внедрение SQL-кода для манипуляции базой данных'
   ),
   (
      'xss',
      'Cross-Site Scripting (XSS)',
      'Внедрение вредоносных скриптов на веб-страницы'
   ),
   (
      'csrf',
      'Cross-Site Request Forgery (CSRF)',
      'Выполнение нежелательных действия на сайте, на котором он уже авторизован.'
   ),
   (
      'rce',
      'Remote Code Execution (RCE)',
      'Удаленное выполнение произвольного кода'
   );

SELECT * FROM vulnerabilities;

CREATE TABLE exercises (
   id INT AUTO_INCREMENT PRIMARY KEY,
   vulnerability_id INT NOT NULL,
   -- к какой уязвимости относится
   slug VARCHAR(80) NOT NULL,
   -- стабильный код задания (auth-bypass, union, blind)
   title VARCHAR(255) NOT NULL,
   -- название
   description TEXT,
   -- короткое описание
   theory TEXT,
   -- теория/подсказки
   difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
   order_index INT NOT NULL DEFAULT 1,
   estimated_minutes INT DEFAULT 10,
   -- необязательно, но удобно в UI
   is_published TINYINT(1) NOT NULL DEFAULT 1,
   -- можно скрывать задания
   lab_key VARCHAR(80) NOT NULL,
   -- ключ лабы (какой docker-образ запускать)
   lab_entry_path VARCHAR(255) DEFAULT '/',
   -- куда вести внутри лабы (например /login)
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   UNIQUE KEY uniq_vuln_slug (vulnerability_id, slug),
   FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities(id) ON DELETE CASCADE
);

INSERT INTO exercises (
  vulnerability_id,
  slug,
  title,
  description,
  theory,
  difficulty,
  order_index,
  estimated_minutes,
  lab_key,
  lab_entry_path
)
VALUES
(
  (SELECT id FROM vulnerabilities WHERE code = 'sql' LIMIT 1),
  'auth-bypass',
  'Обход аутентификации',
  'Получите доступ к системе без знания логина и пароля, используя SQL-инъекцию.',
  'SQL Injection возникает, когда пользовательский ввод напрямую подставляется в SQL-запрос...',
  'beginner',
  1,
  10,
  'sqli-auth-bypass',
  '/login'
),
(
  (SELECT id FROM vulnerabilities WHERE code = 'sql' LIMIT 1),
  'union-select',
  'UNION SELECT',
  'Используйте оператор UNION для извлечения данных из других таблиц базы данных.',
  'Оператор UNION позволяет объединять результаты нескольких SELECT...',
  'intermediate',
  2,
  20,
  'sqli-union',
  '/'
),
(
  (SELECT id FROM vulnerabilities WHERE code = 'sql' LIMIT 1),
  'blind-sqli',
  'Blind SQL Injection',
  'Извлеките данные из базы без прямого отображения результата на странице.',
  'Blind SQL Injection применяется, когда приложение не выводит результаты...',
  'advanced',
  3,
  25,
  'sqli-blind',
  '/'
);

INSERT INTO exercises (
      vulnerability_id,
      slug,
      title,
      description,
      theory,
      difficulty,
      order_index,
      estimated_minutes,
      lab_key,
      lab_entry_path
   )
VALUES (
      (
         SELECT id
         FROM vulnerabilities
         WHERE code = 'xss'
         LIMIT 1
      ), 'reflected-xss', 'Reflected XSS', 'Выполните JavaScript-код через параметр запроса.', 'Reflected XSS возникает, когда пользовательский ввод сразу возвращается в HTML-ответ без экранирования. Атака обычно выполняется через URL и срабатывает при переходе по вредоносной ссылке.', 'beginner', 1, 10, 'xss-reflected', '/'
   ), (
      (
         SELECT id
         FROM vulnerabilities
         WHERE code = 'xss'
         LIMIT 1
      ), 'stored-xss', 'Stored XSS', 'Сохраните вредоносный скрипт, который будет выполняться у всех пользователей.', 'Stored XSS опаснее reflected, так как вредоносный код сохраняется в базе данных (например, в комментариях) и автоматически выполняется у всех посетителей страницы.', 'intermediate', 2, 20, 'xss-stored', '/comments'
   ), (
      (
         SELECT id
         FROM vulnerabilities
         WHERE code = 'xss'
         LIMIT 1
      ), 'dom-xss', 'DOM-based XSS', 'Найдите XSS-уязвимость в JavaScript-коде страницы.', 'DOM-based XSS возникает, когда JavaScript на стороне клиента небезопасно обрабатывает данные из URL или DOM. Сервер при этом может быть полностью безопасен.', 'advanced', 3, 25, 'xss-dom', '/'
   );

INSERT INTO exercises (
      vulnerability_id,
      slug,
      title,
      description,
      theory,
      difficulty,
      order_index,
      estimated_minutes,
      lab_key,
      lab_entry_path
   )
VALUES (
      (
         SELECT id
         FROM vulnerabilities
         WHERE code = 'csrf'
         LIMIT 1
      ), 'csrf-basic', 'Базовая CSRF-атака', 'Выполните действие от имени пользователя без его ведома.', 'CSRF-атака позволяет заставить браузер пользователя отправить запрос с его cookie. Если сервер не проверяет CSRF-токен, злоумышленник может выполнять действия от имени жертвы.', 'beginner', 1, 10, 'csrf-basic', '/profile'
   ), (
      (
         SELECT id
         FROM vulnerabilities
         WHERE code = 'csrf'
         LIMIT 1
      ), 'csrf-state-change', 'CSRF с изменением состояния', 'Измените критическое состояние аккаунта через CSRF.', 'Особенно опасны CSRF-атаки на эндпоинты, которые изменяют состояние системы: пароль, email, права доступа. Защита достигается с помощью CSRF-токенов и SameSite cookie.', 'intermediate', 2, 20, 'csrf-state', '/settings'
   ), (
      (
         SELECT id
         FROM vulnerabilities
         WHERE code = 'csrf'
         LIMIT 1
      ), 'csrf-token-bypass', 'Обход CSRF-защиты', 'Найдите способ обойти слабую CSRF-защиту.', 'Иногда CSRF-токены реализованы неправильно: они не проверяются, предсказуемы или не привязаны к сессии. Это позволяет злоумышленнику обойти защиту.', 'advanced', 3, 25, 'csrf-bypass', '/'
   );

INSERT INTO exercises (
      vulnerability_id,
      slug,
      title,
      description,
      theory,
      difficulty,
      order_index,
      estimated_minutes,
      lab_key,
      lab_entry_path
   )
VALUES (
      (
         SELECT id
         FROM vulnerabilities
         WHERE code = 'rce'
         LIMIT 1
      ), 'command-injection', 'Command Injection', 'Выполните системную команду на сервере.', 'Command Injection возникает, когда пользовательский ввод передаётся в системную команду без проверки. Это может привести к полному захвату сервера.', 'beginner', 1, 15, 'rce-command', '/'
   ), (
      (
         SELECT id
         FROM vulnerabilities
         WHERE code = 'rce'
         LIMIT 1
      ), 'file-upload-rce', 'RCE через загрузку файлов', 'Загрузите файл и выполните код на сервере.', 'Неправильная проверка загружаемых файлов может позволить загрузить исполняемый скрипт (например, PHP) и получить удалённое выполнение кода.', 'intermediate', 2, 25, 'rce-upload', '/upload'
   ), (
      (
         SELECT id
         FROM vulnerabilities
         WHERE code = 'rce'
         LIMIT 1
      ), 'deserialization-rce', 'RCE через десериализацию', 'Получите выполнение кода через небезопасную десериализацию.', 'Небезопасная десериализация позволяет атакующему передать специально сформированные данные, которые приводят к выполнению произвольного кода на сервере.', 'advanced', 3, 30, 'rce-deserialization', '/'
   );


INSERT INTO exercises (
  vulnerability_id,
  slug,
  title,
  description,
  theory,
  difficulty,
  order_index,
  estimated_minutes,
  lab_key,
  lab_entry_path
)
VALUES
(
  (SELECT id FROM vulnerabilities WHERE code = 'sql' LIMIT 1),
  'sqli-placeholder-4',
  'SQL Injection (практика)',
  'Практическое упражнение на SQL-инъекцию.',
  'В этом упражнении присутствует SQL-инъекция.',
  'beginner',
  4,
  10,
  'sqli-auth-bypass',
  '/index.php'
),
(
  (SELECT id FROM vulnerabilities WHERE code = 'sql' LIMIT 1),
  'sqli-placeholder-5',
  'SQL Injection (практика)',
  'Практическое упражнение на SQL-инъекцию.',
  'В этом упражнении присутствует SQL-инъекция.',
  'beginner',
  5,
  10,
  'sqli-auth-bypass',
  '/index.php'
);

INSERT INTO exercises (
  vulnerability_id,
  slug,
  title,
  description,
  theory,
  difficulty,
  order_index,
  estimated_minutes,
  lab_key,
  lab_entry_path
)
VALUES
(
  (
    SELECT id
    FROM vulnerabilities
    WHERE code = 'xss'
    LIMIT 1
  ),
  'reflected-xss',
  'Reflected XSS',
  'Найдите и эксплуатируйте отражённую XSS уязвимость.',
  'Reflected XSS возникает, когда пользовательский ввод немедленно отражается в HTML-ответе без экранирования, что позволяет выполнить произвольный JavaScript-код в браузере жертвы.',
  'beginner',
  1,
  10,
  'xss-reflected',
  '/xss/reflected'
),
(
  (
    SELECT id
    FROM vulnerabilities
    WHERE code = 'xss'
    LIMIT 1
  ),
  'stored-xss',
  'Stored XSS',
  'Эксплуатируйте сохранённую XSS уязвимость.',
  'Stored XSS возникает, когда вредоносный JavaScript сохраняется на сервере (например, в комментариях) и выполняется при каждом просмотре страницы другими пользователями.',
  'beginner',
  2,
  15,
  'xss-stored',
  '/xss/stored'
),
(
  (
    SELECT id
    FROM vulnerabilities
    WHERE code = 'xss'
    LIMIT 1
  ),
  'xss-filter-bypass',
  'XSS Filter Bypass',
  'Обойдите фильтр, запрещающий использование тега <script>.',
  'Даже если тег <script> заблокирован, XSS всё равно возможен с помощью HTML-атрибутов, таких как onerror, onclick и других обработчиков событий.',
  'intermediate',
  3,
  15,
  'xss-filter-bypass',
  '/xss/filter-bypass'
),
(
  (
    SELECT id
    FROM vulnerabilities
    WHERE code = 'xss'
    LIMIT 1
  ),
  'dom-xss',
  'DOM-based XSS',
  'Найдите XSS уязвимость в клиентском JavaScript.',
  'DOM-based XSS возникает, когда JavaScript-код на стороне клиента небезопасно обрабатывает данные из URL (например, location.hash) и вставляет их в DOM без проверки.',
  'intermediate',
  4,
  15,
  'xss-dom',
  '/xss/dom'
),
(
  (
    SELECT id
    FROM vulnerabilities
    WHERE code = 'xss'
    LIMIT 1
  ),
  'xss-challenge',
  'XSS Challenge',
  'Эксплуатируйте XSS уязвимость в усложнённых условиях.',
  'В этом задании применены фильтры и ограничения. Необходимо использовать нестандартные XSS-пейлоады для обхода защиты и выполнения JavaScript-кода.',
  'advanced',
  5,
  20,
  'xss-challenge',
  '/xss/challenge'
);

INSERT INTO exercises (
  vulnerability_id,
  slug,
  title,
  description,
  theory,
  difficulty,
  order_index,
  estimated_minutes,
  lab_key,
  lab_entry_path
)
VALUES
(
  (
    SELECT id
    FROM vulnerabilities
    WHERE code = 'csrf'
    LIMIT 1
  ),
  'csrf-get-request',
  'CSRF через GET-запрос',
  'Выполните опасное действие, передаваемое через GET-запрос.',
  'Иногда разработчики ошибочно используют GET-запросы для изменения состояния приложения (например, удаление аккаунта или смена настроек). Такие действия легко эксплуатируются через CSRF, так как GET-запрос можно выполнить с помощью изображения или ссылки.',
  'beginner',
  4,
  10,
  'csrf-get',
  '/settings'
),
(
  (
    SELECT id
    FROM vulnerabilities
    WHERE code = 'csrf'
    LIMIT 1
  ),
  'csrf-json-api',
  'CSRF через API (JSON)',
  'Эксплуатируйте CSRF-уязвимость в JSON API.',
  'Существует миф, что CSRF невозможен при использовании JSON. Однако если сервер принимает запросы с cookie без проверки CSRF-токена и CORS настроен неправильно, атака возможна даже на API-эндпоинты.',
  'intermediate',
  5,
  20,
  'csrf-api',
  '/api/profile'
);



CREATE TABLE active_sessions (
   id INT AUTO_INCREMENT PRIMARY KEY,
   user_id INT NOT NULL,
   exercise_id INT NOT NULL,
   container_id VARCHAR(64) NOT NULL,
   port INT NOT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
   FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
   UNIQUE KEY unique_user_lab (user_id, exercise_id)
);

CREATE TABLE user_exercises (
   user_id INT NOT NULL,
   exercise_id INT NOT NULL,
   completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

   PRIMARY KEY (user_id, exercise_id),

   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
   FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

select * from users;
select * from exercises;

CREATE TABLE IF NOT EXISTS user_exercises (
   user_id INT NOT NULL,
   exercise_id INT NOT NULL,
   completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

   PRIMARY KEY (user_id, exercise_id),

   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
   FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

select * from user_exercises;

DELETE FROM user_exercises WHERE user_id = 6;