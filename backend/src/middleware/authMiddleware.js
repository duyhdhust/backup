const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Lấy token từ header, bỏ đi chữ "Bearer"
            token = req.headers.authorization.split(' ')[1];

            // Giải mã token để lấy user id
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Lấy thông tin người dùng từ CSDL (không lấy password) và gán vào request
            // để các xử lý sau có thể sử dụng
            const userResult = await db.query('SELECT user_id, email FROM users WHERE user_id = $1', [decoded.id]);

            if (userResult.rows.length > 0) {
                req.user = userResult.rows[0];
                next(); // Chuyển tiếp đến xử lý tiếp theo
            } else {
                res.status(401).json({ message: 'Không được phép, người dùng không tồn tại' });
            }
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Không được phép, token không hợp lệ' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Không được phép, không có token' });
    }
};

module.exports = { protect };