const express = require('express');
const connectDB = require('./config/db');
var cors = require('cors');
const app = express();

app.use(cors());

// Connect DB
connectDB();
// Init Middleware

app.use(express.json({ extended: false }));
app.get('/', (req, res) => { res.send('API sending') });

// Define Routes
app.use('/api/users', require('./routes/api/users/users'));
app.use('/api/auth', require('./routes/api/auth/auth'));
app.use('/api/profile', require('./routes/api/profile/profile'));
app.use('/api/products', require('./routes/api/product/product'));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));