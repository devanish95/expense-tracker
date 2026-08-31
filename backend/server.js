const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  '/api/auth',
  require('./routes/authRoutes')
);

app.use(
  '/api/transactions',
  require('./routes/transactionRoutes')
);

const frontendPath = path.join(
  __dirname,
  '../frontend'
);

app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(
    path.join(frontendPath, 'index.html')
  );
});

app.get('/*.html', (req, res) => {
  const fileName = path.basename(req.path);
  const filePath = path.join(
    frontendPath,
    fileName
  );

  res.sendFile(filePath, (error) => {
    if (error) {
      res.status(404).send('Page not found');
    }
  });
});

app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message:
      `API endpoint ${req.originalUrl} not found`
  });
});

app.use((err, req, res, next) => {
  console.error(
    'Server error:',
    err.stack
  );

  res.status(err.status || 500).json({
    success: false,
    message:
      err.message ||
      'Internal Server Error'
  });
});

const PORT =
  process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  const connectDB = require('./config/db');

  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(
          `Expense Tracker Server is running on port ${PORT}`
        );

        console.log(
          `Local URL: http://localhost:${PORT}`
        );
      });
    })
    .catch((error) => {
      console.error(
        'Failed to connect to MongoDB:',
        error.message
      );
    });
}

module.exports = app;