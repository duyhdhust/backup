import React from 'react';
import { View, StyleSheet, Modal, Text, Pressable, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Task {
    task_id: number; title: string; description: string | null; is_completed: boolean; due_date: string | null; priority: number; category_name?: string;
}
interface TaskDetailModalProps {
    visible: boolean; onClose: () => void; onEdit: () => void; task: Task | null;
}

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Không có';
    try {
        const date = parseISO(dateString);
        if (isToday(date)) return `Hôm nay, ${format(date, 'HH:mm')}`;
        if (isTomorrow(date)) return `Ngày mai, ${format(date, 'HH:mm')}`;
        return format(date, 'EEEE, dd/MM/yyyy - HH:mm', { locale: vi });
    } catch (error) { return 'Ngày không hợp lệ'; }
}
const getPriorityText = (priority: number) => {
    switch (priority) {
        case 2: return 'Cao';
        case 1: return 'Trung bình';
        case 0: return 'Thấp';
        default: return 'Không xác định';
    }
}
const getPriorityColor = (priority: number) => {
    switch (priority) {
        case 2: return '#ff3b30';
        case 1: return '#ff9500';
        case 0: return '#34c759';
        default: return '#8e8e93';
    }
}

export default function TaskDetailModal({ visible, onClose, onEdit, task }: TaskDetailModalProps) {
    if (!task) return null;

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <Pressable style={styles.centeredView} onPress={onClose}>
                <View style={styles.modalView}>
                    <ScrollView>
                        <ThemedText style={styles.modalTitle}>{task.title}</ThemedText>
                        <View style={styles.detailRow}>
                            <Ionicons name="document-text-outline" size={20} color="#888" style={styles.icon} />
                            <ThemedText style={styles.detailText}>{task.description || 'Không có mô tả.'}</ThemedText>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="folder-outline" size={20} color="#888" style={styles.icon} />
                            <ThemedText style={styles.detailText}>{task.category_name || 'Không có danh mục'}</ThemedText>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar-outline" size={20} color="#888" style={styles.icon} />
                            <ThemedText style={styles.detailText}>{formatDate(task.due_date)}</ThemedText>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="flag-outline" size={20} color="#888" style={styles.icon} />
                            <ThemedText style={[styles.detailText, { color: getPriorityColor(task.priority), fontWeight: 'bold' }]}>
                                {getPriorityText(task.priority)}
                            </ThemedText>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name={task.is_completed ? 'checkmark-circle' : 'close-circle-outline'} size={20} color={task.is_completed ? 'green' : '#888'} style={styles.icon} />
                            <ThemedText style={[styles.detailText, { color: task.is_completed ? 'green' : 'inherit' }]}>
                                {task.is_completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                            </ThemedText>
                        </View>
                    </ScrollView>
                    <Pressable style={styles.editButton} onPress={onEdit}>
                        <Ionicons name="pencil" size={20} color="white" />
                        <Text style={styles.editButtonText}>Sửa</Text>
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalView: { maxHeight: '80%', width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 15, color: '#000' },
    detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
    icon: { marginRight: 15, marginTop: 2, width: 20, textAlign: 'center' },
    detailText: { flex: 1, fontSize: 16, lineHeight: 22, color: '#333' },
    editButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 10, marginTop: 25 },
    editButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});