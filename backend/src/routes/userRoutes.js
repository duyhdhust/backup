const express = require('express');
const router = express.Router();
// Sửa lại dòng dưới đây để import cả hai hàm
const { registerUser, loginUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
router.post('/register', registerUser);

// @route   POST /api/auth/login
router.post('/login', loginUser);

// // @route   GET /api/auth/profile  (Dòng này có thể được thêm sau)
// router.get('/profile', protect, getUserProfile);

module.exports = router;