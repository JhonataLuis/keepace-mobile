import React, { createContext , useState, useContext } from 'react';

import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';



const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {

    const [isAuthenticate, setIsAuthenticate] = useState(false);
    const [user, setUser] = useState(null);

    // lógica de login com o seu backend Java
  const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });

        if(response.data && response.data.token) {

            // backend devolve um objeto com { token e user }
            const { token, ...userData } = response.data;

            // salva o token para não precisar logar toda vez que abrir o app
            await AsyncStorage.setItem('@KeePace:token', token);

            // configura o token em todas as próximas requisições
            api.defaults.headers.Authorization = `Bearer ${token}`;

            setUser(userData);
            setIsAuthenticate(true);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Erro na chamada da API:", error.response?.status, error.message);
        console.error('Erro no login:', error.response?.data || error.message);
        return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticate(false);
  };

  return(
    <AuthContext.Provider value={{ isAuthenticate, user, login, logout }}>
        { children }
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);