const db = require('../config/db');

// @desc    Lấy danh sách danh mục của người dùng
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
    try {
        const categories = await db.query(
            'SELECT * FROM categories WHERE user_id = $1 ORDER BY name',
            [req.user.user_id]
        );
        res.json(categories.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Tạo danh mục mới
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Tên danh mục không được để trống' });
    }

    try {
        const newCategory = await db.query(
            'INSERT INTO categories (user_id, name) VALUES ($1, $2) RETURNING *',
            [req.user.user_id, name]
        );
        res.status(201).json(newCategory.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Cập nhật danh mục
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
    const { name } = req.body;
    try {
        const updatedCategory = await db.query(
            'UPDATE categories SET name = $1 WHERE category_id = $2 AND user_id = $3 RETURNING *',
            [name, req.params.id, req.user.user_id]
        );
        if (updatedCategory.rows.length > 0) {
            res.json(updatedCategory.rows[0]);
        } else {
            res.status(404).json({ message: 'Không tìm thấy danh mục hoặc không có quyền' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Xóa danh mục
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
    const categoryId = req.params.id;
    const userId = req.user.user_id;

    try {
        // Bắt đầu một transaction
        await db.query('BEGIN');

        // Set category_id của các task liên quan thành NULL
        await db.query(
            'UPDATE tasks SET category_id = NULL WHERE category_id = $1 AND user_id = $2',
            [categoryId, userId]
        );

        // Xóa danh mục
        const result = await db.query(
            'DELETE FROM categories WHERE category_id = $1 AND user_id = $2',
            [categoryId, userId]
        );

        // Commit transaction
        await db.query('COMMIT');

        if (result.rowCount > 0) {
            res.json({ message: 'Danh mục đã được xóa' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy danh mục hoặc không có quyền' });
        }
    } catch (error) {
        // Rollback nếu có lỗi
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};