import { Router } from 'express';

const router = Router();

/**
 * This file groups together simple, related routes that don't require 
 * complex logic or data processing. These are often static pages or 
 * simple renders without database interaction.
 */


// Home page route
router.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

// About page route  
router.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

export default router;