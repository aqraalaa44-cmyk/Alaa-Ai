
import { Platform } from "react-native";

/**
 * إعدادات الاتصال بخادم Alaa AI
 */

const LOCAL_IP = "192.168.1.26";
const PORT = "3000";

const PUBLIC_SERVER_URL =
  "https://next-ebony-terrain-planned.trycloudflare.com";

const SERVER_URL =
  Platform.OS === "web"
    ? PUBLIC_SERVER_URL
    : `http://${LOCAL_IP}:${PORT}`;

export const API_BASE_URL = SERVER_URL;
