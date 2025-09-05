// Утилиты для работы с push-уведомлениями

// Отправка push-уведомления через service worker
export const sendPushNotification = async (title, body, options = {}) => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.error("Push-уведомления не поддерживаются");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Отправляем сообщение в service worker
    registration.active.postMessage({
      type: "PUSH_NOTIFICATION",
      payload: {
        title,
        body,
        ...options,
      },
    });

    return true;
  } catch (error) {
    console.error("Ошибка отправки push-уведомления:", error);
    return false;
  }
};

// Получение VAPID ключа с сервера
export const getVAPIDKey = async () => {
  try {
    const response = await fetch("http://localhost:3001/api/vapid-public-key");
    const data = await response.json();
    return data.publicKey;
  } catch (error) {
    console.error("Ошибка получения VAPID ключа:", error);
    return null;
  }
};

// Подписка на push-уведомления через наш сервер
export const subscribeToPushServer = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.error("Push-уведомления не поддерживаются");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const vapidKey = await getVAPIDKey();

    if (!vapidKey) {
      throw new Error("Не удалось получить VAPID ключ");
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    // Отправляем подписку на сервер
    const response = await fetch("http://localhost:3001/api/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    if (response.ok) {
      console.log("Подписка сохранена на сервере");
      return subscription;
    } else {
      throw new Error("Ошибка сохранения подписки на сервере");
    }
  } catch (error) {
    console.error("Ошибка подписки:", error);
    return null;
  }
};

// Конвертация VAPID ключа
export const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};
