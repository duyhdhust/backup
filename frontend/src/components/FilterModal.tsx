import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Text, Pressable, Button } from 'react-native';
import { useCategories, Category } from '@/contexts/CategoryContext';
import { Picker } from '@react-native-picker/picker';

// Định nghĩa các lựa chọn cho bộ lọc
export interface FilterOptions {
    priority: string | null;
    category_id: number | null;
    is_completed: string | null;
}

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApplyFilters: (filters: FilterOptions) => void;
    initialFilters: FilterOptions;
}

export default function FilterModal({ visible, onClose, onApplyFilters, initialFilters }: FilterModalProps) {
    const [filters, setFilters] = useState<FilterOptions>(initialFilters);
    const { categories } = useCategories();

    useEffect(() => {
        setFilters(initialFilters);
    }, [initialFilters]);

    const handleApply = () => {
        onApplyFilters(filters);
        onClose();
    };

    const handleClear = () => {
        const clearedFilters = { priority: null, category_id: null, is_completed: null };
        setFilters(clearedFilters);
        onApplyFilters(clearedFilters);
        onClose();
    }

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable style={styles.centeredView} onPress={onClose}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Bộ lọc công việc</Text>

                    {/* Lọc theo Trạng thái */}
                    <Text style={styles.label}>Trạng thái</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={filters.is_completed}
                            onValueChange={(itemValue) => setFilters(f => ({ ...f, is_completed: itemValue }))}
                        >
                            <Picker.Item label="Tất cả" value={null} />
                            <Picker.Item label="Chưa hoàn thành" value={"false"} />
                            <Picker.Item label="Đã hoàn thành" value={"true"} />
                        </Picker>
                    </View>

                    {/* Lọc theo Danh mục */}
                    <Text style={styles.label}>Danh mục</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={filters.category_id}
                            onValueChange={(itemValue) => setFilters(f => ({ ...f, category_id: itemValue }))}
                        >
                            <Picker.Item label="Tất cả" value={null} />
                            {categories.map((cat) => (
                                <Picker.Item key={cat.category_id} label={cat.name} value={cat.category_id} />
                            ))}
                        </Picker>
                    </View>

                    {/* Lọc theo Mức độ ưu tiên */}
                    <Text style={styles.label}>Mức độ ưu tiên</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={filters.priority}
                            onValueChange={(itemValue) => setFilters(f => ({ ...f, priority: itemValue }))}
                        >
                            <Picker.Item label="Tất cả" value={null} />
                            <Picker.Item label="Cao" value={"2"} />
                            <Picker.Item label="Trung bình" value={"1"} />
                            <Picker.Item label="Thấp" value={"0"} />
                        </Picker>
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button title="Xóa bộ lọc" onPress={handleClear} color="#888" />
                        <Button title="Áp dụng" onPress={handleApply} />
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalTitle: { marginBottom: 20, textAlign: 'center', fontSize: 20, fontWeight: 'bold' },
    label: { fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 8 },
    pickerContainer: { borderColor: 'gray', borderWidth: 1, borderRadius: 5, marginBottom: 15, justifyContent: 'center' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
});