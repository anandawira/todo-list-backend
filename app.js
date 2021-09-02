const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const { isEmail } = require('validator');

// Import environtment variable expect when on production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Database connection
mongoose.connect(process.env.MONGO_DB, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

// Initialize Express Server
const app = express();

// Parse urlencoded request body
app.use(express.urlencoded({ extended: false }));

app.post('/sign-up', (req, res) => {
  // Check if email is valid
  if (!isEmail(req.body.email)) {
    return res.status(400).send('Invalid Email');
  }

  // Hash user's password using bcrypt
  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
    // Check if hashing failed
    if (err) {
      return res.status(500).send('Password hashing failed');
    }

    // Create new User object from request body and hashed password
    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: hashedPassword,
    }).save((err) => {
      // Check if database query failed and put error message to response
      if (err) {
        return res.status(400).send(err.message);
      }

      // Send response 'Created' on success
      return res.sendStatus(201);
    });
  });
});

// Get port from environtment variable or use 3000 on development
const port = process.env.PORT || 3000;

// Start listening on the port
app.listen(port, () => console.log(`Listening on port ${port}`));
