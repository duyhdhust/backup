import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Modal, Text, Pressable, Platform } from 'react-native';
import api from '@/services/api';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Picker } from '@react-native-picker/picker';
import { useCategories } from '@/contexts/CategoryContext';
// --- DÒNG MỚI: Import service thông báo ---
import { schedulePushNotification } from '@/services/notificationService';

// Component PriorityButton của bạn (giữ nguyên)
const PriorityButton = ({ label, level, selectedPriority, onSelect }: { label: string; level: number; selectedPriority: number; onSelect: (level: number) => void; }) => (
    <Pressable
        style={[
            styles.priorityButton,
            level === 0 && { backgroundColor: '#e0f3e6' },
            level === 1 && { backgroundColor: '#fff4e0' },
            level === 2 && { backgroundColor: '#ffe0e0' },
            selectedPriority === level && styles.prioritySelected
        ]}
        onPress={() => onSelect(level)}
    >
        <Text style={[
            styles.priorityButtonText,
            level === 0 && { color: '#34c759' },
            level === 1 && { color: '#ff9500' },
            level === 2 && { color: '#ff3b30' },
        ]}>{label}</Text>
    </Pressable>
);

// Interface AddTaskModalProps của bạn (giữ nguyên)
interface AddTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onTaskAdded: () => void;
}

export default function AddTaskModal({ visible, onClose, onTaskAdded }: AddTaskModalProps) {
    // Các state của bạn được giữ nguyên
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
    const [priority, setPriority] = useState(1);
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const { categories } = useCategories();

    // Các hàm xử lý ngày giờ của bạn được giữ nguyên
    const handleShowDatePicker = () => {
        setPickerMode('date');
        setShowPicker(true);
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (event.type === 'set') {
            const currentDate = selectedDate || date || new Date();
            if (pickerMode === 'date') {
                setDate(currentDate);
                setPickerMode('time');
                setShowPicker(true);
            } else {
                setDate(currentDate);
                setShowPicker(false);
            }
        } else {
            setShowPicker(false);
        }
    };

    // Hàm handleAddTask của bạn được sửa lại để gọi schedulePushNotification
    const handleAddTask = async () => {
        if (!title.trim()) {
            alert('Tiêu đề công việc không được để trống.');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                title: title,
                description: description,
                due_date: date ? date.toISOString() : null,
                priority: priority,
                category_id: categoryId,
            };
            const response = await api.post('/tasks', payload);

            // --- DÒNG MỚI: Lên lịch thông báo cho công việc vừa tạo ---
            await schedulePushNotification(response.data);

            onTaskAdded();
            handleClose();
        } catch (error) {
            console.error('Lỗi khi thêm công việc:', error);
            alert('Không thể thêm công việc, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Hàm handleClose của bạn được sửa lại để reset tất cả state
    const handleClose = () => {
        setTitle('');
        setDescription('');
        setDate(undefined);
        setPriority(1);
        setCategoryId(null);
        onClose();
    };

    // Phần return JSX của bạn được giữ nguyên
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Thêm công việc mới</Text>

                    <TextInput style={styles.input} placeholder="Tiêu đề công việc..." placeholderTextColor="#999" value={title} onChangeText={setTitle} />
                    <TextInput style={[styles.input, styles.descriptionInput]} placeholder="Mô tả (không bắt buộc)..." placeholderTextColor="#999" value={description} onChangeText={setDescription} multiline />

                    <Text style={styles.label}>Danh mục</Text>
                    <View style={styles.pickerContainer}>
                        <Picker selectedValue={categoryId} onValueChange={(itemValue) => setCategoryId(itemValue)} style={{ height: 50 }}>
                            <Picker.Item label="-- Không có --" value={null} />
                            {categories.map((cat) => (
                                <Picker.Item key={cat.category_id} label={cat.name} value={cat.category_id} />
                            ))}
                        </Picker>
                    </View>

                    <Text style={styles.label}>Mức độ ưu tiên</Text>
                    <View style={styles.priorityContainer}>
                        <PriorityButton label="Thấp" level={0} selectedPriority={priority} onSelect={setPriority} />
                        <PriorityButton label="Trung bình" level={1} selectedPriority={priority} onSelect={setPriority} />
                        <PriorityButton label="Cao" level={2} selectedPriority={priority} onSelect={setPriority} />
                    </View>

                    <Pressable style={styles.dateButton} onPress={handleShowDatePicker}>
                        <Text style={styles.dateButtonText}>{date ? format(date, 'EEEE, dd/MM/yyyy HH:mm') : 'Chọn ngày hết hạn'}</Text>
                    </Pressable>
                    {date && <Button title="Xóa ngày" onPress={() => setDate(undefined)} color="#888" />}

                    {showPicker && (
                        <DateTimePicker testID="dateTimePicker" value={date || new Date()} mode={pickerMode} is24Hour={true} display="default" onChange={onDateChange} />
                    )}

                    <View style={styles.buttonContainer}>
                        <Button title="Hủy" onPress={handleClose} color="#888" />
                        <Button title={loading ? "Đang thêm..." : "Thêm"} onPress={handleAddTask} disabled={loading} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// Styles của bạn được giữ nguyên
const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'stretch', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' },
    modalTitle: { marginBottom: 20, textAlign: 'center', fontSize: 20, fontWeight: 'bold' },
    label: { fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 8 },
    input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, borderRadius: 5, width: '100%', color: '#000' },
    descriptionInput: { height: 80, textAlignVertical: 'top' },
    dateButton: { padding: 10, borderWidth: 1, borderColor: 'gray', borderRadius: 5, alignItems: 'center', marginBottom: 10, marginTop: 15 },
    dateButtonText: { color: '#007AFF' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
    priorityContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    priorityButton: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderColor: 'transparent', alignItems: 'center', marginHorizontal: 4 },
    prioritySelected: { borderColor: '#007AFF' },
    priorityButtonText: { fontWeight: 'bold' },
    pickerContainer: { borderColor: 'gray', borderWidth: 1, borderRadius: 5, marginBottom: 15, justifyContent: 'center' },
});