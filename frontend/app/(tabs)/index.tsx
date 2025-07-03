import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator, Alert, Pressable, TextInput } from 'react-native';
import { useFocusEffect } from 'expo-router';
import api from '@/services/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import AddTaskModal from '@/components/AddTaskModal';
import EditTaskModal from '@/components/EditTaskModal';
import TaskDetailModal from '@/components/TaskDetailModal';
import FilterModal, { FilterOptions } from '@/components/FilterModal';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useCategories, Category } from '@/contexts/CategoryContext';
import { useDebounce } from '@/hooks/useDebounce';

import {
  requestPermissions,
  scheduleNotification,
  cancelNotificationForTask,
  recreateAllNotifications,
} from '@/services/notificationService';

interface Task {
  task_id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  due_date: string | null;
  priority: number;
  category_id?: number | null;
  category_name?: string;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return null;
  try {
    const date = parseISO(dateString);
    if (isToday(date)) return `Hôm nay, ${format(date, 'HH:mm')}`;
    if (isTomorrow(date)) return `Ngày mai, ${format(date, 'HH:mm')}`;
    return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
  } catch (error) {
    return null;
  }
};

const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 2: return '#ff3b30';
    case 1: return '#ff9500';
    case 0: return '#34c759';
    default: return '#8e8e93';
  }
};

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const { categories } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filters, setFilters] = useState<FilterOptions>({ priority: null, category_id: null, is_completed: "false" });
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const initialSyncDone = useRef(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = { search: debouncedSearchTerm, ...filters };
      const response = await api.get('/tasks', { params });
      const tasksWithCategoryNames = response.data.map((task: Task) => {
        const category = categories.find((c) => c.category_id === task.category_id);
        return { ...task, category_name: category?.name };
      });

      if (!initialSyncDone.current && tasksWithCategoryNames.length > 0) {
        initialSyncDone.current = true;
        console.log("Phát hiện tải dữ liệu lần đầu, bắt đầu đồng bộ thông báo...");
        await recreateAllNotifications(
          tasksWithCategoryNames.map((t: Task) => ({
            id: t.task_id,
            title: t.title,
            due_date: t.due_date,
            is_completed: t.is_completed,
          }))
        );
      }
      setTasks(tasksWithCategoryNames);
    } catch (error) {
      console.error("Lỗi khi tải công việc:", error);
    } finally {
      setLoading(false);
    }
  }, [categories, debouncedSearchTerm, filters]);

  useEffect(() => {
    if (categories) {
      fetchTasks();
    }
  }, [categories, debouncedSearchTerm, filters]);

  const onApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleTaskAdded = (newTask: Task) => {
    const category = categories.find(c => c.category_id === newTask.category_id);
    const taskWithCategoryName = { ...newTask, category_name: category?.name };
    setTasks(prevTasks => [taskWithCategoryName, ...prevTasks]);
    scheduleNotification({
      id: newTask.task_id,
      title: newTask.title,
      due_date: newTask.due_date,
    });
  };

  const handleTaskUpdated = async (updatedTask: Task) => {
    const category = categories.find(c => c.category_id === updatedTask.category_id);
    const taskWithCategoryName = { ...updatedTask, category_name: category?.name };
    setTasks(prevTasks => prevTasks.map(task =>
      task.task_id === updatedTask.task_id ? taskWithCategoryName : task
    ));
    await cancelNotificationForTask(updatedTask.task_id);
    await scheduleNotification({
      id: updatedTask.task_id,
      title: updatedTask.title,
      due_date: updatedTask.due_date,
    });
  };

  const handleOpenDetailModal = (task: Task) => {
    setSelectedTask(task);
    setDetailModalVisible(true);
  };

  const handleOpenEditFromDetail = () => {
    setDetailModalVisible(false);
    setTimeout(() => setEditModalVisible(true), 150);
  };

  const handleDeleteTask = (taskId: number) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa công việc này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/tasks/${taskId}`);
            await cancelNotificationForTask(taskId);
            setTasks((prevTasks) => prevTasks.filter((task) => task.task_id !== taskId));
          } catch (error) {
            console.error("Lỗi khi xóa task:", error);
            Alert.alert("Lỗi", "Không thể xóa công việc.");
          }
        },
      },
    ]);
  };

  const handleToggleComplete = async (taskToToggle: Task) => {
    const newCompletedState = !taskToToggle.is_completed;
    setTasks(prevTasks => prevTasks.map(t => t.task_id === taskToToggle.task_id ? { ...t, is_completed: newCompletedState } : t));
    try {
      await api.put(`/tasks/${taskToToggle.task_id}`, { ...taskToToggle, is_completed: newCompletedState });
      if (newCompletedState) {
        await cancelNotificationForTask(taskToToggle.task_id);
      } else {
        await scheduleNotification({ id: taskToToggle.task_id, title: taskToToggle.title, due_date: taskToToggle.due_date });
      }
    } catch (error) {
      console.error("Lỗi khi toggle complete:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái công việc.");
      setTasks(prevTasks => prevTasks.map(t => t.task_id === taskToToggle.task_id ? { ...t, is_completed: taskToToggle.is_completed } : t));
    }
  };

  const renderItem = ({ item }: { item: Task }) => {
    const formattedDate = formatDate(item.due_date);
    const priorityColor = getPriorityColor(item.priority);
    return (
      <Pressable onPress={() => handleOpenDetailModal(item)} style={styles.taskItem}>
        <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
        <Pressable onPress={() => handleToggleComplete(item)} style={styles.checkboxContainer}>
          <Ionicons name={item.is_completed ? 'checkbox' : 'square-outline'} size={24} color={item.is_completed ? 'green' : '#888'} />
        </Pressable>
        <View style={styles.taskDetails}>
          <ThemedText style={[styles.taskTitle, item.is_completed && styles.completedTask]}>{item.title}</ThemedText>
          {!!item.description && !item.is_completed && <ThemedText style={styles.taskDescription} numberOfLines={1}>{item.description}</ThemedText>}
          <View style={styles.metaContainer}>
            {formattedDate && !item.is_completed && <View style={styles.metaItem}><Ionicons name="calendar-outline" size={14} color={priorityColor} /><ThemedText style={[styles.metaText, { color: priorityColor }]}> {formattedDate}</ThemedText></View>}
            {item.category_name && !item.is_completed && <View style={[styles.metaItem, styles.categoryBadge]}><Ionicons name="folder-outline" size={14} color="#007AFF" /><ThemedText style={[styles.metaText, { color: '#007AFF' }]}> {item.category_name}</ThemedText></View>}
          </View>
        </View>
        <Pressable onPress={() => handleDeleteTask(item.task_id)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={22} color="#ff3b30" />
        </Pressable>
      </Pressable>
    );
  };

  if (loading && tasks.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <AddTaskModal visible={isAddModalVisible} onClose={() => setAddModalVisible(false)} onTaskAdded={handleTaskAdded} />
      <EditTaskModal visible={isEditModalVisible} onClose={() => setEditModalVisible(false)} onTaskUpdated={handleTaskUpdated} task={selectedTask} />
      <TaskDetailModal visible={isDetailModalVisible} onClose={() => setDetailModalVisible(false)} onEdit={handleOpenEditFromDetail} task={selectedTask} />
      <FilterModal visible={isFilterModalVisible} onClose={() => setFilterModalVisible(false)} onApplyFilters={onApplyFilters} initialFilters={filters} />
      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#8e8e93" style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholder="Tìm kiếm..." value={searchTerm} onChangeText={setSearchTerm} placeholderTextColor="#8e8e93" />
          {searchTerm.length > 0 && <Pressable onPress={() => setSearchTerm('')} style={styles.clearButton}><Ionicons name="close-circle" size={20} color="#8e8e93" /></Pressable>}
        </View>
        <Pressable style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="filter" size={24} color="#007AFF" />
        </Pressable>
      </View>
      <FlatList data={tasks} renderItem={renderItem} keyExtractor={(item) => item.task_id.toString()} contentContainerStyle={styles.list} onRefresh={fetchTasks} refreshing={loading} ListEmptyComponent={() => (<View style={styles.centered}><ThemedText>Không tìm thấy công việc nào.</ThemedText></View>)} />
      <Pressable style={styles.fab} onPress={() => setAddModalVisible(true)}>
        <Ionicons name="add" size={30} color="white" />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 80 },
  taskItem: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 12, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  priorityIndicator: { width: 5, height: '100%' },
  checkboxContainer: { padding: 16 },
  taskDetails: { flex: 1, paddingVertical: 12, paddingRight: 5 },
  taskTitle: { fontSize: 17, fontWeight: '500' },
  completedTask: { textDecorationLine: 'line-through', color: 'gray' },
  taskDescription: { fontSize: 14, color: '#666', marginTop: 2 },
  metaContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 10, paddingVertical: 2 },
  metaText: { fontSize: 13, fontWeight: '500', marginLeft: 4 },
  categoryBadge: { backgroundColor: '#eef5ff', borderRadius: 4, paddingHorizontal: 6, },
  deleteButton: { padding: 16 },
  fab: { position: 'absolute', width: 56, height: 56, alignItems: 'center', justifyContent: 'center', right: 20, bottom: 20, backgroundColor: '#007AFF', borderRadius: 28, elevation: 8 },
  controlsContainer: { flexDirection: 'row', paddingHorizontal: 10, paddingTop: 10, gap: 10, alignItems: 'center' },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: '#EFEFEF' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 45, fontSize: 16, color: '#000' },
  clearButton: { padding: 5 },
  filterButton: { height: 45, width: 45, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#EFEFEF' }
});