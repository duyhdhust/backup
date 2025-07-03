import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Modal, Text, Alert } from 'react-native';
import { Category } from '@/contexts/CategoryContext'; // Import interface Category

interface EditCategoryModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (id: number, newName: string) => Promise<void>;
    category: Category | null;
}

export default function EditCategoryModal({ visible, onClose, onSave, category }: EditCategoryModalProps) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (category) {
            setName(category.name);
        }
    }, [category]);

    const handleSave = async () => {
        if (!category || !name.trim()) {
            Alert.alert("Lỗi", "Tên không được để trống.");
            return;
        }
        setLoading(true);
        try {
            await onSave(category.category_id, name.trim());
            onClose();
        } catch (error) {
            Alert.alert("Lỗi", "Không thể lưu thay đổi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Sửa tên danh mục</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Nhập tên mới..."
                    />
                    <View style={styles.buttonContainer}>
                        <Button title="Hủy" onPress={onClose} color="#888" />
                        <Button title={loading ? "Đang lưu..." : "Lưu"} onPress={handleSave} disabled={loading} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'stretch', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalTitle: { marginBottom: 20, textAlign: 'center', fontSize: 20, fontWeight: 'bold' },
    input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10, borderRadius: 5 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around' },
});