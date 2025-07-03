import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Interface để định nghĩa kiểu dữ liệu cho Task, giúp code nhất quán
interface TaskForNotification {
    id: number;
    title: string;
    due_date: string | null;
    is_completed?: boolean;
}

// Cấu hình cách thông báo hiển thị khi ứng dụng đang chạy
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// Hàm yêu cầu quyền
export const requestPermissions = async () => {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        alert('Bạn cần cấp quyền thông báo để nhận được lời nhắc công việc!');
        return false;
    }
    return true;
};

// Hàm lên lịch một thông báo
export const scheduleNotification = async (task: TaskForNotification) => {
    if (!task.due_date) { return; }
    const dueDate = new Date(task.due_date);
    if (isNaN(dueDate.getTime())) { return; }

    const triggerTimestamp = dueDate.getTime() - 15 * 60 * 1000; // Nhắc trước 15 phút
    const seconds = (triggerTimestamp - Date.now()) / 1000;

    if (seconds > 0) {
        try {
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Công việc sắp đến hạn!",
                    body: task.title,
                    // Dữ liệu đính kèm bây giờ là một đối tượng
                    data: { taskId: task.id },
                },
                trigger: { seconds },
            });
            console.log(`Đã lên lịch thông báo cho: "${task.title}" (ID: ${task.id})`);
        } catch (error) {
            console.error("Lỗi khi lên lịch thông báo:", error);
        }
    }
};

// --- HÀM ĐÃ SỬA THEO ĐÚNG LOG BẠN GỬI ---
export const cancelNotificationForTask = async (taskId: number) => {
    try {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

        for (const notif of scheduledNotifications) {
            // Lấy chuỗi JSON từ `dataString` (hoặc `data` trên một số nền tảng)
            const dataString = notif.content.dataString || JSON.stringify(notif.content.data);

            if (dataString) {
                try {
                    // Phân tích chuỗi JSON để lấy đối tượng data
                    const data = JSON.parse(dataString);

                    // So sánh taskId
                    if (data.taskId === taskId) {
                        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
                        console.log(`Đã hủy thành công thông báo cho Task ID: ${taskId}`);
                    }
                } catch (e) {
                    // Bỏ qua nếu không parse được
                }
            }
        }
    } catch (error) {
        console.error(`Lỗi trong quá trình hủy thông báo cho task ID ${taskId}:`, error);
    }
};

// Hàm mới để đồng bộ/tái tạo tất cả thông báo
export const recreateAllNotifications = async (tasks: TaskForNotification[]) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Đã hủy các thông báo cũ, bắt đầu tái tạo...');
    for (const task of tasks) {
        if (!task.is_completed && task.due_date) {
            await scheduleNotification(task);
        }
    }
    console.log('Hoàn tất việc tái tạo thông báo.');
};