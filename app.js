const express = require('express');
var cors = require('cors');
const authRouter = require('./routes/auth');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
const morgan = require('morgan');

// Connect Database
require('./configs/database');

// Initialize Express Server with CORS
const app = express();
app.use(morgan('dev'));
app.use(cors());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: false }));

// Routers
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
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
