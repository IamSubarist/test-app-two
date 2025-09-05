// Кастомный service worker для push-уведомлений

// Обработка сообщений от основного потока
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "PUSH_NOTIFICATION") {
    const { title, body, ...options } = event.data.payload;
    self.registration.showNotification(title, {
      body,
      icon: "/pwa-192x192.png",
      badge: "/favicon.ico",
      ...options,
    });
  }
});

self.addEventListener("push", function (event) {
  console.log("Push event received:", event);

  const options = {
    body: "Это push-уведомление от вашего PWA!",
    icon: "/pwa-192x192.png",
    badge: "/favicon.ico",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Открыть приложение",
        icon: "/pwa-192x192.png",
      },
      {
        action: "close",
        title: "Закрыть",
        icon: "/favicon.ico",
      },
    ],
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || "PWA Уведомление";
  }

  event.waitUntil(
    self.registration.showNotification("PWA Push Notification", options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received:", event);

  event.notification.close();

  if (event.action === "explore") {
    // Открываем приложение
    event.waitUntil(clients.openWindow("/"));
  } else if (event.action === "close") {
    // Просто закрываем уведомление
    console.log("Notification closed");
  } else {
    // Клик по самому уведомлению
    event.waitUntil(clients.openWindow("/"));
  }
});

// Обработка закрытия уведомлений
self.addEventListener("notificationclose", function (event) {
  console.log("Notification closed:", event);
});
