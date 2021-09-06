const mongoose = require('mongoose');



// Database connection
mongoose.connect(process.env.MONGO_DB, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

mongoose.connection.on(
  'error',
  console.error.bind(console, 'mongo connection error'),
);
