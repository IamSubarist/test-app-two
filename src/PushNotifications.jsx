import { useState, useEffect } from "react";

const PushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState("default");
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Проверяем поддержку push-уведомлений
    if ("Notification" in window && "serviceWorker" in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return;

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const subscribeToPush = async () => {
    if (permission !== "granted") {
      const perm = await requestPermission();
      if (perm !== "granted") return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          "BEl62iUYgUivxIkv69yViEuiBIa40HI8g8V3VzA2U3Lgfe3DTjKl3A5aOFxXRm8FcmILs7IiHR7C1vVs7_oPv4"
        ),
      });
      setSubscription(sub);
      console.log("Подписка на push-уведомления создана:", sub);
    } catch (error) {
      console.error("Ошибка подписки:", error);
    }
  };

  const sendTestNotification = () => {
    if (permission === "granted") {
      new Notification("Тестовое уведомление", {
        body: "Это тестовое push-уведомление от вашего PWA!",
        icon: "/pwa-192x192.png",
        badge: "/favicon.ico",
        tag: "test-notification",
      });
    }
  };

  const sendScheduledNotification = () => {
    if (permission === "granted") {
      setTimeout(() => {
        new Notification("Запланированное уведомление", {
          body: "Это уведомление было отправлено через 3 секунды!",
          icon: "/pwa-192x192.png",
          tag: "scheduled-notification",
        });
      }, 3000);
    }
  };

  const simulateRealPush = () => {
    if (permission === "granted") {
      new Notification("Симуляция реального Push", {
        body: "Это симуляция push-уведомления!",
        icon: "/pwa-192x192.png",
        tag: "real-push-simulation",
      });
    }
  };

  if (!isSupported) {
    return (
      <div
        style={{
          padding: "20px",
          backgroundColor: "#f0f0f0",
          borderRadius: "8px",
          margin: "20px 0",
        }}
      >
        <h3>Push-уведомления не поддерживаются</h3>
        <p>Ваш браузер не поддерживает push-уведомления.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        margin: "20px 0",
      }}
    >
      <h3>🔔 Push-уведомления</h3>
      <p>
        Статус разрешений: <strong>{permission}</strong>
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "15px",
        }}
      >
        {permission === "default" && (
          <button
            onClick={requestPermission}
            style={{
              backgroundColor: "#646cff",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Запросить разрешение
          </button>
        )}

        {permission === "granted" && !subscription && (
          <button
            onClick={subscribeToPush}
            style={{
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Подписаться на push
          </button>
        )}

        {permission === "granted" && (
          <>
            <button
              onClick={sendTestNotification}
              style={{
                backgroundColor: "#17a2b8",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Тестовое уведомление
            </button>

            <button
              onClick={sendScheduledNotification}
              style={{
                backgroundColor: "#ffc107",
                color: "black",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Уведомление через 3 сек
            </button>

            <button
              onClick={simulateRealPush}
              style={{
                backgroundColor: "#6f42c1",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Дополнительное уведомление
            </button>
          </>
        )}
      </div>

      {subscription && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            backgroundColor: "#d4edda",
            borderRadius: "5px",
          }}
        >
          <p>
            <strong>✅ Подписка активна!</strong>
          </p>
          <p style={{ fontSize: "12px", wordBreak: "break-all" }}>
            Endpoint: {subscription.endpoint.substring(0, 50)}...
          </p>
        </div>
      )}

      <div
        style={{
          marginTop: "15px",
          padding: "10px",
          backgroundColor: "#e7f3ff",
          borderRadius: "5px",
          fontSize: "14px",
        }}
      >
        <p>
          <strong>🧪 Как тестировать push-уведомления:</strong>
        </p>
        <ol style={{ margin: "5px 0", paddingLeft: "20px" }}>
          <li>Нажмите "Запросить разрешение"</li>
          <li>Разрешите уведомления в браузере</li>
          <li>Нажмите "Подписаться на push"</li>
          <li>Попробуйте разные кнопки уведомлений</li>
        </ol>
        <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
          💡 <strong>Примечание:</strong> Это простые браузерные уведомления для
          демонстрации PWA функций!
        </p>
      </div>
    </div>
  );
};

// Функция для конвертации VAPID ключа
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default PushNotifications;
