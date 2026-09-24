import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
	//baseURL: 'http://192.168.5.114:8080/api',
    baseUrl: 'http://localhost:8080/api',
        timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

console.log('=== API BASE URL ===', api.defaults.baseURL);

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('@KeePace:token');

    console.log('=== API REQUEST ===');
    console.log('URL:', `${config.baseURL}${config.url}`);
    console.log('METHOD:', config.method);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;