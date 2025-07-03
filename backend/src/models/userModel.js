// src/models/userModel.js

const db = require('../config/db');

exports.findUserByEmail = async (email) => {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
};

exports.createUser = async (email, passwordHash) => {
    const { rows } = await db.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING user_id, email',
        [email, passwordHash]
    );
    return rows[0];
};