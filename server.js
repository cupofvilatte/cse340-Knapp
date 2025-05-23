// Import express using ESM syntax
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path'; 

// Import route handlers from their new locations
import indexRoutes from './src/routes/index.js';
import productsRoutes from './src/routes/products/index.js';

// Import global middleware
import { addGlobalData } from './src/middleware/index.js';

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

app.use(indexRoutes);
app.use('/products', productsRoutes);


app.get('/manual-error', (req, res, next) => {
    const err = new Error('This is a manually triggered error');
    err.status = 500;
    next(err); // Forward to the global error handler
});

app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err); // Forward to the global error handler
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

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});