import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';
import axios from 'axios'; // <-- Dòng mới: Import axios để kiểm tra lỗi

// Định nghĩa kiểu dữ liệu (type) cho các hàm
interface AuthContextData {
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
    signUp: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadStoragedData() {
            try {
                const storagedToken = await AsyncStorage.getItem('userToken');
                if (storagedToken) {
                    setToken(storagedToken);
                    api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
                }
            } catch (e) {
                console.error("Failed to load user token.", e);
            } finally {
                setIsLoading(false);
            }
        }
        loadStoragedData();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token: newToken } = response.data;
            setToken(newToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            await AsyncStorage.setItem('userToken', newToken);
        } catch (error) {
            // SỬA LỖI Ở ĐÂY
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || 'Đăng nhập thất bại.');
            }
            throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
        }
    };

    const signUp = async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/register', { email, password });
            const { token: newToken } = response.data;
            setToken(newToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            await AsyncStorage.setItem('userToken', newToken);
        } catch (error) {
            // SỬA LỖI Ở ĐÂY
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || 'Đăng ký thất bại.');
            }
            throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
        }
    };

    const signOut = async () => {
        setToken(null);
        delete api.defaults.headers.common['Authorization'];
        await AsyncStorage.removeItem('userToken');
    };

    return (
        <AuthContext.Provider value={{ token, isAuthenticated: !!token, isLoading, signIn, signOut, signUp }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    return context;
}