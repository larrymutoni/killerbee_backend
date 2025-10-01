require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./config/db');
const auth = require('./middleware/auth');
const net = require('net');

const app = express();


app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));


app.use((req, res, next) => {
  console.log('Request received:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});


app.use('/auth', require('./routes/auth'));

app.use('/models', auth, require('./routes/models'));
app.use('/ingredients', auth, require('./routes/ingredients'));
app.use('/processes', auth, require('./routes/processes'));
app.use('/communications', auth, require('./routes/communications'));


app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

async function isPortInUse(port) {
  return new Promise((resolve, reject) => {
    const tester = net.createServer()
      .once('error', err => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          reject(err);
        }
      })
      .once('listening', () => {
        tester.once('close', () => resolve(false))
          .close();
      })
      .listen(port);
  });
}

async function getAvailablePort(startPort) {
  const maxPort = startPort + 10;
  for (let port = startPort; port <= maxPort; port++) {
    try {
      const inUse = await isPortInUse(port);
      if (!inUse) {
        return port;
      }
      console.log(`Port ${port} is in use, trying next port...`);
    } catch (err) {
      console.error(`Error checking port ${port}:`, err);
    }
  }
  throw new Error(`No available ports found between ${startPort} and ${maxPort}`);
}


async function connectDB(retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('Database connected successfully');
      await sequelize.sync({ alter: true });
      console.log('Database synchronized');
      return true;
    } catch (err) {
      console.error('Database connection attempt failed:', err);
      if (i < retries - 1) {
        console.log('Retrying in 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  return false;
}


const DEFAULT_PORT = 5000;
let server;

async function startServer() {
  try {
    
    const dbConnected = await connectDB();
    if (!dbConnected) {
      throw new Error('Could not connect to database after retries');
    }

    
    const desiredPort = parseInt(process.env.PORT || DEFAULT_PORT, 10);
    const port = await getAvailablePort(desiredPort);
    
    if (port !== desiredPort) {
      console.log(`Port ${desiredPort} was in use, using port ${port} instead`);
    }

    
    server = app.listen(port, () => {
      console.log(`Backend running on port ${port}`);
    });

    
    server.on('error', (err) => {
      console.error('Server error:', err);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is in use. Server will attempt to find another port.`);
        server.close();
        startServer();
      } else {
        console.error('Fatal server error:', err);
        process.exit(1);
      }
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}


startServer();


process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});


process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});


process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});