const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

mongoose.connect(process.env.MONGO_DB, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

const app = express();

app.use(express.urlencoded({ extended: false }));

app.post('/sign-up', (req, res) => {
  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: hashedPassword,
    }).save((err) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
        res.sendStatus(201);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
