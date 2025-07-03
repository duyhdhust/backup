require('dotenv').config({ path: '../.env' });
const db = require('../src/config/db');

// --- DỮ LIỆU CÔNG VIỆC MẪU (ĐÃ THÊM DUE_DATE) ---
const sampleTasks = [
    {
        title: 'Nộp bài tập ITSS',
        description: 'Deadline vào 11h tối nay.',
        priority: 2,
        due_date: new Date(new Date().setHours(23, 0, 0, 0)).toISOString(), // Hôm nay, 23:00
    },
    {
        title: 'Gọi điện cho gia đình',
        description: '',
        priority: 2,
        due_date: null, // Không có deadline
    },
    {
        title: 'Họp nhóm báo cáo đồ án',
        description: 'Online trên Google Meet.',
        priority: 2,
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Ngày mai
    },
    {
        title: 'Mua vé xem phim',
        description: 'Đặt 2 vé suất 8h tối thứ Sáu.',
        priority: 1,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 ngày nữa
    },
    {
        title: 'Đi siêu thị mua đồ ăn',
        description: 'Mua sữa, trứng, và bánh mì.',
        priority: 1,
        due_date: null,
    },
    {
        title: 'Dọn dẹp phòng',
        description: 'Lau nhà và giặt quần áo.',
        priority: 0,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 tuần nữa
    }
];

const seedTasks = async () => {
    try {
        const USER_ID = 2; // Thêm công việc cho người dùng có ID = 2
        console.log(`Đang thêm ${sampleTasks.length} công việc mẫu cho người dùng ID = ${USER_ID}...`);

        for (const task of sampleTasks) {
            await db.query(
                'INSERT INTO tasks (user_id, title, description, priority, due_date) VALUES ($1, $2, $3, $4, $5)',
                [USER_ID, task.title, task.description, task.priority, task.due_date]
            );
        }
        console.log('✅ Thêm dữ liệu mẫu (có ngày giờ) thành công!');

    } catch (error) {
        console.error('❌ Lỗi khi thêm dữ liệu mẫu:', error);
    } finally {
        process.exit();
    }
};

// Chạy hàm seed
seedTasks();