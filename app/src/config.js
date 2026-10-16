
import { Platform } from "react-native";

/**
 * إعدادات الاتصال بخادم Alaa AI
 *
 * الموقع المنشور على الويب يستخدم سيرفر Render عبر HTTPS.
 * أندرويد وباقي المنصات يستخدمون عنوان الكمبيوتر المحلي أثناء التطوير.
 */

const LOCAL_IP = "192.168.1.26";
const PORT = "3000";

const PUBLIC_SERVER_URL = "https://alaa-ai-server.onrender.com";

const SERVER_URL =
  Platform.OS === "web"
    ? PUBLIC_SERVER_URL
    : `http://${LOCAL_IP}:${PORT}`;

export const API_BASE_URL = SERVER_URL;
