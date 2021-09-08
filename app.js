// Import environtment variable expect when on production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
var cors = require('cors');
const authRouter = require('./routes/auth');
const activityRouter = require('./routes/activity');
const usersRouter = require('./routes/users');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
const morgan = require('morgan');
const compression = require('compression');

// Connect Database
require('./configs/database');

// Initialize Express Server with CORS
const app = express();

// Standard middlewares
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time[0] ms :user-agent',
  ),
);
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(compression());

// auth
require('./configs/passport')(app);

// Routers
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/activity', activityRouter);
app.use('/users', usersRouter);
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
