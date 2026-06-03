import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.0.106:8080";

console.log(">>> BASE_URL da API:", BASE_URL);

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Interceptor de REQUEST — injeta o token JWT em toda requisição
api.interceptors.request.use(
  async (config) => {
    const isLoginRequest = config.url?.includes("/api/auth/login");
    if (!isLoginRequest) {
      const token = await AsyncStorage.getItem("@token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de RESPONSE — trata token expirado (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("@token");
      await AsyncStorage.removeItem("@user");
    }
    return Promise.reject(error);
  },
);
