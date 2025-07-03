import * as Notifications from 'expo-notifications';

// Dùng lại interface Task để code được nhất quán
interface Task {
    task_id: number;
    title: string;
    due_date: string | null;
}

// Lên lịch một thông báo
export const schedulePushNotification = async (task: Task) => {
    // Không làm gì nếu không có ngày hết hạn
    if (!task.due_date) {
        console.log(`Bỏ qua lên lịch cho task ID: ${task.task_id} vì không có due_date.`);
        return;
    }

    const dueDate = new Date(task.due_date);

    // Kiểm tra xem thời gian có hợp lệ không
    if (isNaN(dueDate.getTime())) {
        console.log(`Bỏ qua lên lịch cho task ID: ${task.task_id} vì due_date không hợp lệ.`);
        return;
    }

    // Thông báo trước 15 phút
    const trigger = new Date(dueDate.getTime() - 15 * 60 * 1000);

    // Chỉ lên lịch nếu thời gian trigger ở trong tương lai
    if (trigger > new Date()) {
        try {
            // Dùng task_id làm định danh để có thể hủy hoặc cập nhật sau này
            const identifier = String(task.task_id);

            await Notifications.scheduleNotificationAsync({
                identifier,
                content: {
                    title: "Công việc sắp đến hạn! 提醒", // Reminder
                    body: task.title,
                    data: { taskId: task.task_id }, // Gửi kèm dữ liệu nếu cần
                },
                trigger,
            });
            console.log(`ĐÃ LÊN LỊCH thông báo cho task ID: ${identifier} vào lúc ${trigger.toLocaleString()}`);
        } catch (e) {
            console.error("Lỗi khi lên lịch thông báo:", e);
        }
    } else {
        console.log(`Bỏ qua lên lịch cho task ID: ${task.task_id} vì thời gian đã qua.`);
    }
};

// Hủy một thông báo đã được lên lịch
export const cancelPushNotification = async (taskId: number) => {
    try {
        const identifier = String(taskId);
        await Notifications.cancelScheduledNotificationAsync(identifier);
        console.log(`ĐÃ HỦY thông báo cho task ID: ${identifier}`);
    } catch (e) {
        console.error("Lỗi khi hủy thông báo:", e)
    }
};