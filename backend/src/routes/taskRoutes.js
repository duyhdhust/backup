const express = require('express');
const router = express.Router();
const {
    getTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Middleware 'protect' sẽ được áp dụng cho tất cả các route bên dưới
// để đảm bảo chỉ người dùng đã đăng nhập mới truy cập được.
router.use(protect);

router.route('/')
    .get(getTasks)       // GET /api/tasks -> Lấy danh sách công việc
    .post(createTask);   // POST /api/tasks -> Tạo công việc mới

router.route('/:id')
    .get(getTaskById)    // GET /api/tasks/:id -> Lấy chi tiết một công việc
    .put(updateTask)     // PUT /api/tasks/:id -> Cập nhật công việc
    .delete(deleteTask); // DELETE /api/tasks/:id -> Xóa công việc

module.exports = router;