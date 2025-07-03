const db = require('../config/db');

// @desc    Lấy tất cả công việc của người dùng (có tìm kiếm và lọc)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        // Lấy các tham số từ query string (ví dụ: /tasks?search=báo cáo&priority=2)
        const { search, priority, category_id, is_completed } = req.query;

        let query = 'SELECT * FROM tasks WHERE user_id = $1';
        const queryParams = [req.user.user_id];
        let paramIndex = 2; // Bắt đầu từ tham số thứ 2 ($2)

        // Xây dựng câu truy vấn động, chỉ thêm điều kiện nếu có tham số
        if (search) {
            query += ` AND title ILIKE $${paramIndex++}`; // ILIKE để tìm kiếm không phân biệt hoa thường
            queryParams.push(`%${search}%`);
        }
        if (priority) {
            query += ` AND priority = $${paramIndex++}`;
            queryParams.push(priority);
        }
        if (category_id) {
            query += ` AND category_id = $${paramIndex++}`;
            queryParams.push(category_id);
        }
        if (is_completed !== undefined) {
            query += ` AND is_completed = $${paramIndex++}`;
            queryParams.push(is_completed);
        }

        // --- PHẦN SẮP XẾP CỦA BẠN ĐƯỢC GIỮ NGUYÊN VÀ THÊM VÀO CUỐI ---
        query += ' ORDER BY is_completed ASC, due_date ASC NULLS LAST, priority DESC, created_at DESC';

        // Thực thi câu truy vấn đã được xây dựng
        const tasksResult = await db.query(query, queryParams);

        res.json(tasksResult.rows);

    } catch (error) {
        console.error('LỖI KHI LẤY CÔNG VIỆC:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- CÁC HÀM KHÁC ĐƯỢC GIỮ NGUYÊN HOÀN TOÀN ---

// @desc    Tạo công việc mới
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    const { title, description, due_date, priority, category_id } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Tiêu đề công việc không được để trống' });
    }

    try {
        const newTask = await db.query(
            `INSERT INTO tasks (user_id, title, description, due_date, priority, category_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [req.user.user_id, title, description || null, due_date || null, priority || 1, category_id || null]
        );
        res.status(201).json(newTask.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Lấy chi tiết công việc bằng ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
    try {
        const task = await db.query(
            'SELECT * FROM tasks WHERE task_id = $1 AND user_id = $2',
            [req.params.id, req.user.user_id]
        );

        if (task.rows.length > 0) {
            res.json(task.rows[0]);
        } else {
            res.status(404).json({ message: 'Không tìm thấy công việc' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Cập nhật công việc
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    const { title, description, due_date, priority, category_id, is_completed } = req.body;
    const taskId = req.params.id;

    try {
        const updatedTask = await db.query(
            `UPDATE tasks
             SET title = $1, description = $2, due_date = $3, priority = $4, category_id = $5, is_completed = $6, updated_at = NOW()
             WHERE task_id = $7 AND user_id = $8
             RETURNING *`,
            [title, description, due_date, priority, category_id, is_completed, taskId, req.user.user_id]
        );

        if (updatedTask.rows.length > 0) {
            res.json(updatedTask.rows[0]);
        } else {
            res.status(404).json({ message: 'Không tìm thấy công việc hoặc không có quyền' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Xóa công việc
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    try {
        const result = await db.query(
            'DELETE FROM tasks WHERE task_id = $1 AND user_id = $2',
            [req.params.id, req.user.user_id]
        );

        if (result.rowCount > 0) {
            res.json({ message: 'Công việc đã được xóa' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy công việc hoặc không có quyền' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask
};