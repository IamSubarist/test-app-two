import { useState, useEffect } from "react";

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Предотвращаем автоматическое отображение промпта
      e.preventDefault();
      // Сохраняем событие для последующего использования
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Показываем промпт установки
    deferredPrompt.prompt();

    // Ждем ответа пользователя
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("Пользователь принял установку PWA");
    } else {
      console.log("Пользователь отклонил установку PWA");
    }

    // Очищаем сохраненное событие
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        right: "20px",
        backgroundColor: "#646cff",
        color: "white",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <div>
        <strong>Установить приложение</strong>
        <div style={{ fontSize: "14px", opacity: 0.9 }}>
          Установите это приложение на свое устройство для быстрого доступа
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={handleInstallClick}
          style={{
            backgroundColor: "white",
            color: "#646cff",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Установить
        </button>
        <button
          onClick={handleDismiss}
          style={{
            backgroundColor: "transparent",
            color: "white",
            border: "1px solid white",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Позже
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
