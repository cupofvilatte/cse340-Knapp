// Import express using ESM syntax
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path'; 

import session from 'express-session';
import pgSession from 'connect-pg-simple';

// Import route handlers from their new locations
import indexRoutes from './src/routes/index.js';
import productsRoutes from './src/routes/products/index.js';
// Add this import with your other route imports
import dashboardRoutes from './src/routes/dashboard/index.js';
import testRoutes from './src/routes/test.js';

// Import global middleware
import { addGlobalData } from './src/middleware/index.js';
import { setupDatabase, testConnection } from './src/models/setup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE_ENV = process.env.NODE_ENV || 'production';
// Define the port number the server will listen on
const PORT = process.env.PORT || 3000;

// Create an instance of an Express application
const app = express();
// app.locals.NODE_ENV = NODE_ENV; 


app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'src/views'));


// Middleware to parse JSON data in request body
app.use(express.json());

// Middleware to parse URL-encoded form data (like from a standard HTML form)
app.use(express.urlencoded({ extended: true }));

/**
 * Middleware Functions 
 */

app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'Express Middleware Tutorial');
    next(); // Don't forget this or your request will hang!
});

// Global middleware to measure request processing time

app.use(addGlobalData);

app.use((req, res, next) => {
    // Record the time when the request started
    const start = Date.now();

    /**
     * The `res` object has built-in event listeners we can use to trigger
     * actions at different points in the request/response lifecycle.
     * 
     * We will use the 'finish' event to detect when the response has been
     * sent to the client, and then calculate the time taken to process
     * the entire request.
     */
    res.on('finish', () => {
        // Calculate how much time has passed since the request started
        const end = Date.now();
        const processingTime = end - start;

        // Log the results to the console
        console.log(`${req.method} ${req.url} - Processing time: ${processingTime}ms`);
    });

    // Don't forget to call next() to continue to the next middleware
    next();
});

// Configure PostgreSQL session store
const PostgresStore = pgSession(session);
 
// Configure session middleware
app.use(session({
    store: new PostgresStore({
        pool: db, // Use your PostgreSQL connection
        tableName: 'sessions', // Table name for storing sessions
        createTableIfMissing: true // Creates table if it does not exist
    }),
    secret: process.env.SESSION_SECRET || "default-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true, // Prevents client-side access to the cookie
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    }
}));

app.use(indexRoutes);
app.use('/products', productsRoutes);

// Add this with your other route registrations
app.use('/dashboard', dashboardRoutes);

app.use('/test', testRoutes);

app.get('/manual-error', (req, res, next) => {
    const err = new Error('This is a manually triggered error');
    err.status = 500;
    next(err); // Forward to the global error handler
});

// 404 Error Handler
app.use((req, res, next) => {
    // Ignore error forwarding for expected missing assets
    const quiet404s = [
        '/favicon.ico',
        '/robots.txt'
    ];

    // Also skip any paths under /.well-known/
    const isQuiet404 = quiet404s.includes(req.path) || req.path.startsWith('/.well-known/');

    if (isQuiet404) {
        return res.status(404).send('Not Found');
    }

    // For all other routes, forward to the global error handler
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    // Log the error for debugging
    console.error(err.stack);

    // Set default status and determine error type
    const status = err.status || 500;
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Internal Server Error',
        error: err.message,
        stack: err.stack,
    };

    // Render the appropriate template based on status code
    res.status(status).render(`errors/${status === 404 ? '404' : '500'}`, context);
});

// When in development mode, start a WebSocket server for live reloading
if (NODE_ENV.includes('dev')) {
    const ws = await import('ws');

    try {
        const wsPort = parseInt(PORT) + 1;
        const wsServer = new ws.WebSocketServer({ port: wsPort });

        wsServer.on('listening', () => {
            console.log(`WebSocket server is running on port ${wsPort}`);
        });

        wsServer.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}

// Start the server and listen on the specified port
app.listen(PORT, async () => {
    try {
        await testConnection();
        await setupDatabase();
    } catch (error) {
        console.error('Database setup failed', error);
        process.exit(1);
    }
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});