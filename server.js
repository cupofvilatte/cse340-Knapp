// Import express using ESM syntax
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path'; 

const NODE_ENV = process.env.NODE_ENV || 'production';
// Define the port number the server will listen on
const PORT = process.env.PORT || 3000;

// Create an instance of an Express application
const app = express();
app.locals.NODE_ENV = NODE_ENV; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.locals.year = new Date().getFullYear();

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'src/views'));

// Define a route handler for the root URL ('/')
app.get('/', (req, res) => {
    const title = 'Home Page';
    const content = '<h1>Welcome to the Home Page</h1><p>This is the main content of the home page.</p>';
    res.render('index', { title, content });
});

// route handler to about page
app.get('/about', (req, res) => {
    const title = 'About Page';
    const content = '<h1>Welcome to the About Page</h1><p>Vilate is studying Software Engineering at BYU-I. She has two younger sisters and two younger brothers. Her favorite color is pink.</p><img src="/images/Vilate.jpg">';
    res.render('index', { title, content });
})

// route handler to products page
app.get('/products', (req, res) => {
    const title = 'Contact Page';
    const content = `<form action="/submit" method="POST">
    <input type="text" name="name" placeholder="Name"><br>
    <input type="phone" name="phone" placeholder="Phone number"><br>
    <input type="email" name="email" placeholder="Email"><br>
    <textarea name="message" placeholder="Message"></textarea><br>
    <input type="submit" value="Submit">
    </form>`;
    res.render('index', { title, content });
})

app.get('/test-error', (req, res, next) => {
    try {
        // Intentionally trigger an error
        const nonExistentVariable = undefinedVariable;
        res.send('This will never be reached');
    } catch (err) {
        // Forward the error to the global error handler
        next(err);
    }
});

const mode = process.env.MODE;

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
        mode,
        PORT
    };
 
    // Render the appropriate template based on status code
    res.status(status).render(`errors/${status === 404 ? '404' : '500'}`, context);
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});