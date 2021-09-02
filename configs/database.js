const mongoose = require('mongoose');

// Import environtment variable expect when on production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Database connection
mongoose.connect(process.env.MONGO_DB, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

mongoose.connection.on(
  'error',
  console.error.bind(console, 'mongo connection error'),
);
