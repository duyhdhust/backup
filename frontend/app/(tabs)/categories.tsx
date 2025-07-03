import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet, Alert, Pressable } from 'react-native';
import { useCategories, Category } from '@/contexts/CategoryContext'; // Import thêm Category
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import EditCategoryModal from '@/components/EditCategoryModal'; // <-- DÒNG MỚI

export default function CategoriesScreen() {
    const { categories, loading, addCategory, deleteCategory, updateCategory } = useCategories();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // --- STATE MỚI ĐỂ QUẢN LÝ MODAL SỬA ---
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            Alert.alert("Lỗi", "Tên danh mục không được để trống.");
            return;
        }
        setIsAdding(true);
        try {
            await addCategory(newCategoryName);
            setNewCategoryName('');
        } catch (error) {
            Alert.alert("Lỗi", "Không thể thêm danh mục.");
        } finally {
            setIsAdding(false);
        }
    };

    // Hàm này giờ sẽ mở modal
    const handleOpenEditModal = (category: Category) => {
        setSelectedCategory(category);
        setEditModalVisible(true);
    };

    // Hàm này sẽ được gọi từ modal để lưu thay đổi
    const handleSaveChanges = async (id: number, newName: string) => {
        await updateCategory(id, newName);
    };

    const handleDeleteCategory = (id: number, name: string) => {
        Alert.alert(
            "Xác nhận xóa",
            `Bạn có chắc muốn xóa danh mục "${name}" không? Mọi công việc thuộc danh mục này sẽ bị gỡ khỏi nó.`,
            [
                { text: "Hủy", style: "cancel" },
                { text: "Xóa", style: "destructive", onPress: () => deleteCategory(id) }
            ]
        );
    };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Quản lý Danh mục' }} />

            {/* --- MODAL SỬA ĐƯỢC THÊM VÀO ĐÂY --- */}
            <EditCategoryModal
                visible={isEditModalVisible}
                onClose={() => setEditModalVisible(false)}
                onSave={handleSaveChanges}
                category={selectedCategory}
            />

            <View style={styles.addCategoryContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập tên danh mục mới..."
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    placeholderTextColor="#888"
                />
                <Button title={isAdding ? "..." : "Thêm"} onPress={handleAddCategory} disabled={isAdding} />
            </View>

            <FlatList
                data={categories}
                keyExtractor={(item) => item.category_id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.categoryItem}>
                        <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
                        <View style={styles.buttonsContainer}>
                            {/* Nút sửa giờ sẽ mở modal */}
                            <Pressable onPress={() => handleOpenEditModal(item)} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={24} color="#007AFF" />
                            </Pressable>
                            <Pressable onPress={() => handleDeleteCategory(item.category_id, item.name)} style={styles.iconButton}>
                                <Ionicons name="trash-outline" size={24} color="#ff3b30" />
                            </Pressable>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<ThemedText style={styles.emptyText}>Chưa có danh mục nào.</ThemedText>}
                refreshing={loading}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f0f2f5' },
    addCategoryContainer: { flexDirection: 'row', marginBottom: 20, gap: 10 },
    input: { flex: 1, borderWidth: 1, borderColor: '#ccc', paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#fff', fontSize: 16, color: '#000' },
    categoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10 },
    categoryName: { fontSize: 16, flex: 1 },
    buttonsContainer: { flexDirection: 'row' },
    iconButton: { padding: 8, marginLeft: 8 },
    emptyText: { textAlign: 'center', marginTop: 20, color: 'gray', fontSize: 16 },
});