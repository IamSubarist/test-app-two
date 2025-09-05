const express = require("express");
const webpush = require("web-push");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// VAPID ключи (в продакшене должны быть в переменных окружения)
const vapidKeys = {
  publicKey:
    "BOGsSDEniTgsv9jScchp90rTWeARYnmaeMnK0v6ZzG3gye-b80jZln3Vw-pL-Be4qZkYeetFYZ19gIYFVV0Jtq8",
  privateKey: "X5Pwj1DhYQIE2I4ALe_O_x3yd5cmiFYCQuRJz24NWpA",
};

// Настройка web-push
webpush.setVapidDetails(
  "mailto:your-email@example.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Хранилище подписок (в продакшене используйте базу данных)
let subscriptions = [];

// API для получения VAPID публичного ключа
app.get("/api/vapid-public-key", (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// API для сохранения подписки
app.post("/api/subscribe", (req, res) => {
  const subscription = req.body;

  // Проверяем, есть ли уже такая подписка
  const existingIndex = subscriptions.findIndex(
    (sub) => sub.endpoint === subscription.endpoint
  );

  if (existingIndex >= 0) {
    subscriptions[existingIndex] = subscription;
  } else {
    subscriptions.push(subscription);
  }

  console.log("Новая подписка сохранена:", subscription.endpoint);
  res.json({ success: true, message: "Подписка сохранена" });
});

// API для отправки push-уведомления всем подписчикам
app.post("/api/send-push", async (req, res) => {
  const { title, body, icon, url } = req.body;

  if (subscriptions.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Нет активных подписок",
    });
  }

  const payload = JSON.stringify({
    title: title || "PWA Push Notification",
    body: body || "Это push-уведомление от вашего сервера!",
    icon: icon || "/pwa-192x192.png",
    url: url || "/",
    timestamp: Date.now(),
  });

  const promises = subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification(subscription, payload);
      console.log("Push отправлен на:", subscription.endpoint);
      return { success: true, endpoint: subscription.endpoint };
    } catch (error) {
      console.error("Ошибка отправки push:", error);
      return {
        success: false,
        endpoint: subscription.endpoint,
        error: error.message,
      };
    }
  });

  const results = await Promise.all(promises);
  const successCount = results.filter((r) => r.success).length;

  res.json({
    success: true,
    message: `Push отправлен ${successCount} из ${subscriptions.length} подписчиков`,
    results: results,
  });
});

// API для отправки push конкретному подписчику
app.post("/api/send-push-to", async (req, res) => {
  const { subscription, title, body, icon, url } = req.body;

  if (!subscription) {
    return res.status(400).json({
      success: false,
      message: "Подписка не указана",
    });
  }

  const payload = JSON.stringify({
    title: title || "PWA Push Notification",
    body: body || "Это push-уведомление от вашего сервера!",
    icon: icon || "/pwa-192x192.png",
    url: url || "/",
    timestamp: Date.now(),
  });

  try {
    await webpush.sendNotification(subscription, payload);
    console.log("Push отправлен на:", subscription.endpoint);
    res.json({ success: true, message: "Push отправлен успешно" });
  } catch (error) {
    console.error("Ошибка отправки push:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка отправки push",
      error: error.message,
    });
  }
});

// API для получения списка подписок
app.get("/api/subscriptions", (req, res) => {
  res.json({
    count: subscriptions.length,
    subscriptions: subscriptions.map((sub) => ({
      endpoint: sub.endpoint.substring(0, 50) + "...",
      keys: Object.keys(sub.keys || {}),
    })),
  });
});

// Веб-интерфейс для отправки push
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Push-сервер запущен на http://localhost:${PORT}`);
  console.log(`📱 Веб-интерфейс: http://localhost:${PORT}`);
  console.log(`🔑 VAPID Public Key: ${vapidKeys.publicKey}`);
});
