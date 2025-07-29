import axios from "axios";

const isDev = import.meta.env.VITE_DEBUG === "true";

const api = axios.create({
    baseURL: isDev ? "http://localhost:8000/api/v1/" : import.meta.env.VITE_BACKEND_ADDRESS,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

let dispatch = null;

export const setApiDispatch = (storeDispatch) => {
    dispatch = storeDispatch;
};

const authAPI = {
    login: (credentials) => api.post("auth/login/", credentials),
    refreshToken: () => api.post("auth/token/refresh/"),
    logout: () => api.post("auth/logout/"),
    isAuthenticated: () => api.get("auth/authenticated/"),
    register: (credentials) => api.post("auth/register/", credentials),
};

const userAPI = {
    fetchUserDetails: () => api.get("auth/profile/"),
    updateProfilePicture: (formData) =>
        api.put("auth/profile/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),
    changePassword: (passwordData) => api.post("auth/change-password/", passwordData),
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshResponse = await authAPI.refreshToken();
                if (refreshResponse.data?.refreshed) {
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error("Refresh token failed:", refreshError);
                if (dispatch) {
                    dispatch({ type: "user/logoutReducer" });
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export { authAPI, userAPI };
export default api;
