import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.5.115:8080/api',
    timeout: 10000, // Aumentei o tempo de 5000 para 10s para evitar timeout no túnel
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;