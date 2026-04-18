import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
});

// Auto-inject auth token + mobile flag on every request
api.interceptors.request.use(async (config) => {
  config.headers.ismobileapp = "true";

  const token = await AsyncStorage.getItem("tokenGenerate");
  if (token) {
    config.headers.mobiletoken = token;
    if (__DEV__) {
      console.log("[Auth] Token injected:", {
        tokenLength: token.length,
        endpoint: config.url,
      });
    }
  } else {
    if (__DEV__) {
      console.warn("[Auth] No token found in AsyncStorage for endpoint:", config.url);
    }
  }

  return config;
});

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      const token = error?.config?.headers?.mobiletoken ? "✓ Present" : "✗ Missing";
      console.error(
        `[API Error] ${error?.config?.method?.toUpperCase()} ${error?.config?.url}`,
        {
          status: error?.response?.status,
          token,
          data: error?.response?.data,
        },
      );
    }
    return Promise.reject(error);
  },
);

export default api;
