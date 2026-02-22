const Docker = require('dockerode');
const db = require('../config/db'); // Твой модуль подключения к БД

// Dockerode автоматически найдет сокет или pipe (на Windows)
const docker = new Docker();

/**
 * Запуск лабораторной работы
 */
exports.startLab = async (req, res) => {
   try {
      const { exerciseId } = req.body;
      const userId = req.user.id; // Предполагаем, что user_id берется из токена авторизации

      if (!exerciseId) {
         return res.status(400).json({ message: 'Exercise ID is required' });
      }

      // 1. Проверяем, есть ли уже активная сессия в БД
      const [sessions] = await db.query(
         'SELECT * FROM active_sessions WHERE user_id = ? AND exercise_id = ?',
         [userId, exerciseId]
      );

      if (sessions.length > 0) {
         const session = sessions[0];

         // Проверяем, жив ли контейнер в реальности
         try {
            const container = docker.getContainer(session.container_id);
            const data = await container.inspect();

            if (data.State.Running) {
   console.log(`♻️ Возвращаю существующий контейнер ${session.container_id}`);

   // 👉 Берём lab_entry_path заново
   const [[exercise]] = await db.query(
      'SELECT lab_entry_path FROM exercises WHERE id = ?',
      [exerciseId]
   );

   const path = exercise?.lab_entry_path || '/';

   return res.json({
      status: 'success',
      url: `http://localhost:${session.port}${path}`,
      container_id: session.container_id
   });
}
 else {
               // Контейнер в базе есть, но он остановлен/умер — удаляем запись и создаем новый
               await db.query('DELETE FROM active_sessions WHERE id = ?', [session.id]);
               // Опционально: удаляем сам контейнер, чтобы не мусорить
               await container.remove({ force: true }).catch(() => { });
            }
         } catch (err) {
            // Если контейнер не найден в докере (404), удаляем запись из БД
            await db.query('DELETE FROM active_sessions WHERE id = ?', [session.id]);
         }
      }

      // 2. Получаем информацию об образе из таблицы exercises
      const [exercises] = await db.query(
         'SELECT lab_key, lab_entry_path FROM exercises WHERE id = ?',
         [exerciseId]
      );

      if (exercises.length === 0) {
         return res.status(404).json({ message: 'Exercise not found' });
      }

      const { lab_key, lab_entry_path } = exercises[0];

      console.log(`🚀 Запускаю новый контейнер для образа: ${lab_key}`);

      // 3. Создаем и запускаем контейнер
      // Аналог: docker run -d -P --memory=128m ...
      const container = await docker.createContainer({
         Image: lab_key,
         AttachStdin: false,
         AttachStdout: false,
         AttachStderr: false,
         Tty: false,
         HostConfig: {
            PortBindings: {
               '80/tcp': [{ HostPort: '0' }] // '0' означает случайный свободный порт
            },
            Memory: 128 * 1024 * 1024, // 128 MB RAM limit
            NanoCpus: 500000000 // 0.5 CPU limit
         }
      });

      await container.start();

      // 4. Узнаем, какой порт нам выдал Docker
      const data = await container.inspect();
      const ports = data.NetworkSettings.Ports['80/tcp'];

      if (!ports || !ports[0]) {
         throw new Error('Container started but port 80 is not exposed');
      }

      const hostPort = ports[0].HostPort;

      // 5. Сохраняем сессию в БД
      try {
         await db.query(
            'INSERT INTO active_sessions (user_id, exercise_id, container_id, port) VALUES (?, ?, ?, ?)',
            [userId, exerciseId, container.id, hostPort]
         );
      } catch (dbError) {
         // Если запись в БД не удалась (например, неверный user_id), удаляем контейнер, чтобы не мусорить
         console.error('❌ Ошибка записи сессии в БД. Удаляю контейнер...', dbError.message);
         await container.stop().catch(() => { });
         await container.remove().catch(() => { });
         throw dbError; // Пробрасываем ошибку дальше, чтобы фронтенд получил 500
      }

      // Формируем итоговый URL (добавляем путь, если он есть, например /login)
      const fullUrl = `http://localhost:${hostPort}${lab_entry_path || '/'}`;

      return res.json({
         status: 'success',
         url: fullUrl,
         container_id: container.id
      });

   } catch (error) {
      console.error('Lab Start Error:', error);
      return res.status(500).json({ status: 'error', message: error.message });
   }
};

/**
 * Остановка лабораторной
 */
exports.stopLab = async (req, res) => {
   try {
      const { container_id } = req.body;
      const userId = req.user.id;

      // Проверяем, принадлежит ли контейнер этому юзеру (безопасность)
      const [result] = await db.query('DELETE FROM active_sessions WHERE container_id = ? AND user_id = ?', [container_id, userId]);

      if (result.affectedRows > 0) {
         const container = docker.getContainer(container_id);
         await container.stop().catch(() => { }); // Игнорируем ошибку, если уже остановлен
         await container.remove().catch(() => { });
      }

      return res.json({ status: 'success' });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
};