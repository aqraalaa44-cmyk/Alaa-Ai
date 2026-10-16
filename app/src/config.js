import { Platform } from "react-native";

/**
 * إعدادات الاتصال بخادم Alaa AI
 * -------------------------------------------------------------
 * 1. للويب (Web browser): http://localhost:3000
 * 2. لمحاكي أندرويد (Android Emulator): http://10.0.2.2:3000
 * 3. للهاتف الحقيقي عبر Expo Go: ضع عنوان IP جهاز الكمبيوتر على نفس شبكة Wi-Fi
 *    (عنوان جهازك الحالي: http://192.168.1.26:3000)
 * 4. عند نشر السيرفر أونلاين: استبدل الرابط برابط الاستضافة
 */

const LOCAL_IP = "192.168.1.26"; // عنوان IP جهازك على الشبكة المحلية
const PORT = "3000";

const SERVER_URL =
  Platform.OS === "web"
    ? `http://localhost:${PORT}`
    : Platform.OS === "android"
    ? `http://${LOCAL_IP}:${PORT}` // يعمل على الهاتف الحقيقي والمحاكي
    : `http://${LOCAL_IP}:${PORT}`;

export const API_BASE_URL = SERVER_URL;
