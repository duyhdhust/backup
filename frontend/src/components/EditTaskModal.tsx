import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Modal, Text, Alert, Pressable, Platform } from 'react-native';
import api from '@/services/api';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import { Picker } from '@react-native-picker/picker';
import { useCategories } from '@/contexts/CategoryContext';

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

interface Task {
    task_id: number;
    title: string;
    description: string | null;
    is_completed: boolean;
    due_date: string | null;
    priority: number;
    category_id?: number | null;
}

interface EditTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onTaskUpdated: (updatedTask: Task) => void;
    task: Task | null;
}

export default function EditTaskModal({ visible, onClose, onTaskUpdated, task }: EditTaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
    const [priority, setPriority] = useState(1);
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const { categories } = useCategories();

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setDate(task.due_date ? parseISO(task.due_date) : undefined);
            setPriority(task.priority);
            setCategoryId(task.category_id || null);
        }
    }, [task]);

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

    const handleUpdateTask = async () => {
        if (!task) return;
        if (!title.trim()) {
            Alert.alert('Lỗi', 'Tiêu đề công việc không được để trống.');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                ...task,
                title: title,
                description: description,
                due_date: date ? date.toISOString() : null,
                priority: priority,
                category_id: categoryId,
            };
            const response = await api.put(`/tasks/${task.task_id}`, payload);

            // --- BƯỚC GỠ LỖI ---
            console.log("--- DEBUG: BÊN TRONG EDIT MODAL ---");
            console.log("Dữ liệu trả về từ server:", JSON.stringify(response.data, null, 2));

            if (response.data) {
                onTaskUpdated(response.data);
            }

            onClose();
        } catch (error) {
            // --- BƯỚC GỠ LỖI ---
            console.error("--- DEBUG: LỖI KHI GỌI API UPDATE ---", error);
            Alert.alert('Lỗi', 'Không thể cập nhật công việc.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Sửa công việc</Text>
                    {/* ...toàn bộ JSX của bạn được giữ nguyên... */}
                    <TextInput style={styles.input} placeholder="Tiêu đề công việc..." placeholderTextColor="#999" value={title} onChangeText={setTitle} />
                    <TextInput style={[styles.input, styles.descriptionInput]} placeholder="Mô tả (không bắt buộc)..." placeholderTextColor="#999" value={description} onChangeText={setDescription} multiline />
                    <Text style={styles.label}>Danh mục</Text>
                    <View style={styles.pickerContainer}>
                        <Picker selectedValue={categoryId} onValueChange={(itemValue) => setCategoryId(itemValue)} style={{ height: 50 }}>
                            <Picker.Item label="-- Không có --" value={null} />
                            {categories.map((cat) => (<Picker.Item key={cat.category_id} label={cat.name} value={cat.category_id} />))}
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
                    {showPicker && (<DateTimePicker testID="dateTimePicker" value={date || new Date()} mode={pickerMode} is24Hour={true} display="default" onChange={onDateChange} />)}
                    <View style={styles.buttonContainer}>
                        <Button title="Hủy" onPress={onClose} color="#888" />
                        <Button title={loading ? "Đang lưu..." : "Lưu thay đổi"} onPress={handleUpdateTask} disabled={loading} />
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