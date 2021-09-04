const express = require('express');
const bcrypt = require('bcryptjs');

const authRouter = require('./routes/auth');

// Connect Database
require('./configs/database');

// Initialize Express Server
const app = express();

// Parse urlencoded request body
app.use(express.urlencoded({ extended: false }));

// Routers
app.use('/', authRouter);

// error handler
app.use(function (err, req, res, next) {
  // render the error page
  res.status(err.status || 500).json({ message: err.message });
});

// Get port from environtment variable or use 3000 on development
const port = process.env.PORT || 3000;

// Start listening on the port
app.listen(port, () => console.log(`Listening on port ${port}`));
