import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from './AuthContext';

export interface Category {
    category_id: number;
    name: string;
    user_id: number;
}

// --- SỬA LẠI: Thêm hàm updateCategory vào interface ---
interface CategoryContextData {
    categories: Category[];
    loading: boolean;
    fetchCategories: () => Promise<void>;
    addCategory: (name: string) => Promise<void>;
    updateCategory: (id: number, name: string) => Promise<void>; // <-- DÒNG MỚI
    deleteCategory: (id: number) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextData>({} as CategoryContextData);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Các state và hàm của bạn được giữ nguyên
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    const fetchCategories = async () => {
        if (!isAuthenticated) return;
        try {
            setLoading(true);
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchCategories();
        } else {
            setCategories([]);
        }
    }, [isAuthenticated]);

    const addCategory = async (name: string) => {
        await api.post('/categories', { name });
        fetchCategories();
    };

    const deleteCategory = async (id: number) => {
        await api.delete(`/categories/${id}`);
        setCategories(prev => prev.filter(cat => cat.category_id !== id));
    };

    // --- HÀM MỚI: Sửa/Cập nhật danh mục ---
    const updateCategory = async (id: number, name: string) => {
        const response = await api.put(`/categories/${id}`, { name });
        // Cập nhật lại state để UI thay đổi ngay lập tức
        setCategories(prev =>
            prev.map(cat => (cat.category_id === id ? response.data : cat))
        );
    };
    // ------------------------------------

    // Sửa lại Provider để truyền thêm hàm updateCategory
    return (
        <CategoryContext.Provider value={{ categories, loading, fetchCategories, addCategory, updateCategory, deleteCategory }}>
            {children}
        </CategoryContext.Provider>
    );
};

export function useCategories() {
    return useContext(CategoryContext);
}