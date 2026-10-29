import axios from "axios";
import config from "./config";

const api = axios.create({
    baseURL: config.API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
})

let refreshPromise = null;

export const renewAccessToken = () => {
    if (!refreshPromise) {
        refreshPromise = axios.post(config.AUTH.REISSUE, {}, { withCredentials: true})

        .then(({data}) => {
            const token = data?.result;
        

        if(
            data?.isSuccess === false || 
            typeof token !== "string" ||
            !token
        ) {
            throw new Error("토큰 재발급에 실패했습니다.");
        }
        localStorage.setItem("accessToken",token);

        window.dispatchEvent(new Event("auth:changed"));

        return token;
    })
    .finally(() => { 
        refreshPromise = null;
    });
    }

    return refreshPromise;
};

api.interceptors.request.use((request) => {
    const token = localStorage.getItem("accessToken");
    if (token) { 
        request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
})

api. interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        return Promise.reject(error);
    }
)
export default api;