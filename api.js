import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.5.115:8080/api',
    timeout: 5000,
})