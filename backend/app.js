const express = require('express');
const cors = require('cors');

//routes
const authRoutes = require('./routes/authRoutes');  
const roomRoutes = require('./routes/roomRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// api calls
app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);

app.get('/', (req, res) => {
    res.send("Hello World!");
});

module.exports = app;