const express = require('express');
const connectDB = require('./config/db');

// Server
const app = express();

// Connect DB
connectDB();

// Init body Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send(`Witaj na hero stronie!`));

// ROUTES
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ideas', require('./routes/ideas'));

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
