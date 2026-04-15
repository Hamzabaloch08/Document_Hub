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
  }

  return config;
});

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      console.warn(
        `[API Error] ${error?.config?.method?.toUpperCase()} ${error?.config?.url}`,
        {
          status: error?.response?.status,
          data: error?.response?.data,
        },
      );
    }
    return Promise.reject(error);
  },
);

export default api;
