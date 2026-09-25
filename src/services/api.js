import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
	baseURL: 'http://192.168.5.119:8080/api',
    //baseURL: 'http://localhost:8080/api',
        timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

console.log('=== API BASE URL ===', api.defaults.baseURL);

// Rotas públicas que NÃO devem receber o token
const PUBLIC_ROUTES = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
];

api.interceptors.request.use(async (config) => {

    console.log('=== API REQUEST ===');
    console.log('URL:', `${config.baseURL}${config.url}`);
    console.log('METHOD:', config.method);

    const isPublic = PUBLIC_ROUTES.some((route) =>
        config.url?.includes(route)
    );

    if (isPublic) {
        // Garante que nenhum token residual seja enviado
        delete config.headers.Authorization;
        console.log('Rota pública - Authorization removido');
    } else {
        const token = await AsyncStorage.getItem('@KeePace:token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;