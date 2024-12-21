import router from '@/router';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BE_API_BASE_URL,
    withCredentials: true,
    timeout: 5000,
});

api.interceptors.response.use(
    (response) => {
        window.dispatchEvent(new CustomEvent('login-check-result', { detail: { login: true } }));
        return response;
    },
    (error) => {
        window.dispatchEvent(new CustomEvent('login-check-result', { detail: { login: false } }));
        if (error.response && error.response.status === 401) {
            const toPath = error.response.config?.params?.toPath;
            if (toPath && toPath.length !== 1 && toPath.slice(0, 2) !== '/?') {
                window.dispatchEvent(new CustomEvent('show-login-modal', { detail: { toPath } }));
            } else {
                const routerQuery = error.response.config?.params?.routerQuery;
                router.push({ path: '/', query: { ...routerQuery, isChecked: true } });
            }
            return new Promise(() => {});
        }
        return Promise.reject(error);
    }
);

export default api;
