// Import express using ESM syntax
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path'; 

const NODE_ENV = process.env.NODE_ENV || 'production';
// Define the port number the server will listen on
const PORT = process.env.PORT || 3000;

// Create an instance of an Express application
const app = express();
 
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

app.get('/page1', (req, res) => {
    const title = 'Page 1';
    const content = '<h1>Welcome to the Page 2</h1><p>This is the main content of page 1.</p>';
    res.render('index', { title, content });
});

app.get('/page2', (req, res) => {
    const title = 'Page 2';
    const content = '<h1>Welcome to Page 2</h1><p>This is the main content of page 2.</p>';
    res.render('index', { title, content });
});

app.get('/about', (req, res) => {
    const title = 'About Page';
    const content = '<h1>Welcome to the About Page</h1><p>Vilate is studying Software Engineering at BYU-I. She has two younger sisters and two younger brothers. Her favorite color is pink.</p><img src="/images/Vilate.jpg">';
    res.render('index', { title, content });
})

app.get('/contact', (req, res) => {
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

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});