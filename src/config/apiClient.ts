import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  config.headers.ismobileapp = true;

  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.mobiletoken = token;
  }
  return config;
});

export default api;