import { Platform } from "react-native";

const LOCAL_IP = "192.168.1.26";
const PORT = "3000";

const PUBLIC_SERVER_URL =
  "https://alaa-ai-server9.onrender.com";

export const API_BASE_URL =
  Platform.OS === "web"
    ? PUBLIC_SERVER_URL
    : `http://${LOCAL_IP}:${PORT}`;
