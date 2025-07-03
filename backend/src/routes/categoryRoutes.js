const express = require('express');
const router = express.Router();
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

// Chỉ người dùng đã đăng nhập mới có thể quản lý danh mục.
router.use(protect);

router.route('/')
    .get(getCategories)     // GET /api/categories -> Lấy danh sách danh mục
    .post(createCategory);  // POST /api/categories -> Tạo danh mục mới

router.route('/:id')
    .put(updateCategory)    // PUT /api/categories/:id -> Cập nhật danh mục
    .delete(deleteCategory);// DELETE /api/categories/:id -> Xóa danh mục

module.exports = router;