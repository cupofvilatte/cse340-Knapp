import { getNavigationCategories } from '../models/categories/index.js';

// Middleware to add global data to res.locals
export const addGlobalData = async (req, res, next) => {
    // Get the current year for copyright notice
    res.locals.currentYear = new Date().getFullYear();

    // Add NODE_ENV for all views
    res.locals.NODE_ENV = process.env.NODE_ENV || 'development';

    // Make navigation data available without explicitly passing it in each route
    try {
        const navigationCategories = await getNavigationCategories();
        res.locals.navigationCategories = navigationCategories;
    } catch (error) {
        console.error('Error loading navigation data:', error.message);
        // Continue without navigation data rather than failing the request
        res.locals.navigationCategories = [];
    }

    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };

    // Adding to res.locals makes this available to all views automatically
    res.locals.timestamp = now.toLocaleDateString('en-US', options);

    next();
};