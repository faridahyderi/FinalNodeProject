require('dotenv').config();
require('express-async-errors');
// extra security packages
const express = require('express');

const path = require('path'); 
const session = require('express-session'); 
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

const app = express();

// connectDB
const connectDB = require('./db/connect');
const { auth: authenticateUser} = require('./middleware/authentication');
const { adminOnly } = require('./middleware/authentication'); // Admin middleware

// routes
const authRouter = require('./routes/auth');
const booksRouter = require('./routes/books');
const adminRouter = require('./routes/adminRoutes'); // Import admin routes
const borrowRouter = require('./routes/borrow'); // Import borrow routes

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Use sessions for authentication
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));

// extra packages
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(cors());
app.use(xss());
app.use(
  rateLimiter({
    windowMs: 60 * 1000, // limit each IP to 60 requests per windowMs
    max: 60,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Allow same origin
        scriptSrc: [
          "'self'", 
          "https://cdn.jsdelivr.net", 
          "'unsafe-inline'", // Optional: Allows inline scripts (if absolutely necessary)
        ],
        styleSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"], // Allow inline styles if needed
        objectSrc: ["'none'"], // Disallow <object>, <embed>, and <applet> tags
        upgradeInsecureRequests: [], // Upgrade HTTP requests to HTTPS (optional)
      },
    },
  })
);

// Home Route - Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// routes
app.use('/auth', authRouter);
app.use('/books', authenticateUser, booksRouter); // Ensure authentication is required for book operations
app.use('/admin', authenticateUser, adminOnly, adminRouter); // Admin routes protected by authenticateUser and adminOnly middleware
app.use('/borrow', authenticateUser, borrowRouter); // Borrow routes protected by authenticateUser middleware

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
