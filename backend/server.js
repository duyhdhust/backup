require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/config/db'); // Đảm bảo db được import để có thể dùng pool

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Để xử lý JSON body

// Import Routes
const userRoutes = require('./src/routes/userRoutes');
const taskRoutes = require('./src/routes/taskRoutes'); // Dòng mới
const categoryRoutes = require('./src/routes/categoryRoutes'); // Dòng mới

// Use Routes
app.use('/api/auth', userRoutes);
app.use('/api/tasks', taskRoutes); // Dòng mới
app.use('/api/categories', categoryRoutes); // Dòng mới

app.get('/', (req, res) => {
    res.send('Daily List API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT} and accessible on the network`);
});