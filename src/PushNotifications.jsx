import { useState, useEffect } from "react";
import { sendPushNotification, subscribeToPushServer } from "./pushUtils";

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
      const sub = await subscribeToPushServer();
      if (sub) {
        setSubscription(sub);
        console.log(
          "Подписка на push-уведомления создана и сохранена на сервере:",
          sub
        );
      }
    } catch (error) {
      console.error("Ошибка подписки:", error);
    }
  };

  const sendTestNotification = async () => {
    if (permission === "granted") {
      await sendPushNotification(
        "Тестовое уведомление",
        "Это тестовое push-уведомление от вашего PWA!",
        { tag: "test-notification" }
      );
    }
  };

  const sendScheduledNotification = () => {
    if (permission === "granted") {
      setTimeout(async () => {
        await sendPushNotification(
          "Запланированное уведомление",
          "Это уведомление было отправлено через 3 секунды!",
          { tag: "scheduled-notification" }
        );
      }, 3000);
    }
  };

  const simulateRealPush = async () => {
    if (permission === "granted" && subscription) {
      try {
        // Отправляем push-уведомление через наш локальный сервер
        const response = await fetch("http://localhost:3001/api/send-push-to", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subscription: subscription,
            title: "Реальный Push от сервера!",
            body: "Это push-уведомление отправлено с вашего собственного сервера! 🚀",
            icon: "/pwa-192x192.png",
            url: "/",
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Push-уведомление отправлено через сервер:", result);
        } else {
          throw new Error("Ошибка отправки на сервер");
        }
      } catch (error) {
        console.log("Ошибка отправки на сервер:", error);
        // Fallback на локальную симуляцию
        await sendPushNotification(
          "Симуляция реального Push",
          "Это симуляция push-уведомления от сервера!",
          { tag: "real-push-simulation" }
        );
      }
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
              onClick={() =>
                sendPushNotification(
                  "SW Push",
                  "Уведомление через Service Worker!"
                )
              }
              style={{
                backgroundColor: "#6f42c1",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              SW Push
            </button>

            <button
              onClick={simulateRealPush}
              style={{
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Симуляция реального Push
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
          <li>
            Запустите push-сервер: <code>cd push-server && npm start</code>
          </li>
          <li>Нажмите "Подписаться на push"</li>
          <li>
            Откройте{" "}
            <a
              href="http://localhost:3001"
              target="_blank"
              style={{ color: "#646cff" }}
            >
              http://localhost:3001
            </a>{" "}
            для отправки push
          </li>
          <li>Или нажмите "Симуляция реального Push"</li>
          <li>Уведомление появится даже когда приложение закрыто!</li>
        </ol>
        <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
          💡 <strong>Важно:</strong> Service Worker работает в фоне и может
          получать push-события даже когда PWA закрыто!
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
