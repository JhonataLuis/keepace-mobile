import React, { createContext , useState, useContext } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {

    const [isAuthenticate, setIsAuthenticate] = useState(false);
    const [user, setUser] = useState(null);

    // Aqui depois você adicionará a lógica de login com o seu backend Java
  const login = async (email, password) => {
    try {
        if (email === "admin@admin.com" & password === "123"){
            setUser({ email, name: 'Usuário Keepace' });
            return true;
        }
        return false;
    } catch (error) {
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