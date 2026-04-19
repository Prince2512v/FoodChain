import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [token, setToken]     = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore session from Cookies on page load
        const storedToken = Cookies.get('token');
        const role  = Cookies.get('role');
        const name  = Cookies.get('name');
        const email = Cookies.get('email');

        if (storedToken && role && name) {
            setUser({ token: storedToken, role, name, email });
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token: newToken, role, name } = response.data;

        // Save session tokens securely in cookies for 1 day
        Cookies.set('token', newToken, { expires: 1 });
        Cookies.set('role', role, { expires: 1 });
        Cookies.set('name', name, { expires: 1 });
        Cookies.set('email', email, { expires: 1 });

        setToken(newToken);
        setUser({ token: newToken, role, name, email });
        return { role };
    };

    const register = async (name, email, password, role) => {
        await api.post('/auth/register', { name, email, password, role });
    };

    const logout = () => {
        // Remove only authentication-related cookies.
        Cookies.remove('token');
        Cookies.remove('role');
        Cookies.remove('name');
        Cookies.remove('email');
        setUser(null);
        setToken(null);
    };

    return (
        // Expose both `user` (backward compat) and `token` (direct access)
        <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

