import axios from "axios";
import { useCallback } from "react";
import { userToken } from "./helpers";

const client = (token?: string) => {
    const axiosInstance = axios.create({
        baseURL: import.meta.env.DEV ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL,
    })

    const authToken = token ?? userToken()

    if (authToken) {
        axiosInstance.interceptors.request.use(config => {
            config.headers.Authorization = `Bearer ${authToken}`;
            return config;
        })
    }

    return axiosInstance;
}

export const useClient = () => {
    const token = userToken()
    return useCallback(
        () => client(token ?? ""), [token])
}

export default client;

