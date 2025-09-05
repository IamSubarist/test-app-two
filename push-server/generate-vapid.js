const webpush = require("web-push");

// Генерируем VAPID ключи
const vapidKeys = webpush.generateVAPIDKeys();

console.log("🔑 VAPID ключи сгенерированы:");
console.log("");
console.log("Public Key:");
console.log(vapidKeys.publicKey);
console.log("");
console.log("Private Key:");
console.log(vapidKeys.privateKey);
console.log("");
console.log("📝 Скопируйте эти ключи в server.js");
