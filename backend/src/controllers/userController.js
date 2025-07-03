// Thay thế toàn bộ nội dung file bằng code này
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Hàm tạo token (không đổi)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    // console.log('ĐÃ NHẬN ĐƯỢC YÊU CẦU ĐĂNG KÝ:', req.body); // Dòng này có thể giữ hoặc xóa
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    try {
        const userExistsResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExistsResult.rows.length > 0) {
            return res.status(400).json({ message: 'Email này đã tồn tại' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUserResult = await db.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING user_id, email',
            [email, password_hash]
        );

        const user = newUserResult.rows[0];

        if (user) {
            res.status(201).json({
                _id: user.user_id,
                email: user.email,
                token: generateToken(user.user_id),
            });
        } else {
            res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    console.log('--- BẮT ĐẦU QUÁ TRÌNH ĐĂNG NHẬP ---');
    const { email, password } = req.body;
    console.log(`Đang thử đăng nhập cho email: ${email}`);

    try {
        // Bước 1: Tìm người dùng trong database
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            console.log('LỖI: Không tìm thấy người dùng với email này.');
            return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
        }

        const user = result.rows[0];
        console.log('Đã tìm thấy người dùng:', user.email);
        console.log('Mật khẩu đã băm trong DB:', user.password_hash);

        // Bước 2: So sánh mật khẩu người dùng nhập với mật khẩu đã băm
        console.log('Đang so sánh mật khẩu...');
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            console.log('THÀNH CÔNG: Mật khẩu trùng khớp!');
            res.json({
                _id: user.user_id,
                email: user.email,
                token: generateToken(user.user_id),
            });
        } else {
            console.log('LỖI: Mật khẩu không trùng khớp.');
            res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
        }
    } catch (error) {
        console.error('LỖI SERVER KHI ĐĂNG NHẬP:', error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

module.exports = {
    registerUser,
    loginUser,
};