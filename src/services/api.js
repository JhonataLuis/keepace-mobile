import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
    baseURL: 'http://192.168.5.115:8080/api',
    timeout: 10000, // Aumentei o tempo de 5000 para 10s para evitar timeout no túnel
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('@KeePace:token');
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;