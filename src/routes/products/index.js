import { Router } from 'express';
import { 
    getNavigationCategories, 
    getCategoryBySlug, 
    getChildCategories,
    getProductsByCategory, 
    getRandomNavigationCategory 
} from '../../models/categories/index.js';

const router = Router();

/**
 * Route for /products - redirects to a random navigation category
 * Now uses database to select a random parent category instead of hardcoded data
 */
router.get('/', async (req, res, next) => {
    const randomCategory = await getRandomNavigationCategory();

    if (!randomCategory) {
        const error = new Error('No categories available');
        error.status = 404;
        return next(error);
    }

    res.redirect(`/products/${randomCategory.slug}`);
});

/**
 * Route for viewing a category and its products/subcategories
 * Updated to use database queries instead of static data
 */
router.get('/:category', async (req, res, next) => {
    const { category } = req.params;
    const { display = 'grid' } = req.query;

    // Get category from database
    const categoryData = await getCategoryBySlug(category);

    // Check if category exists
    if (!categoryData) {
        const error = new Error('Category Not Found');
        error.status = 404;
        return next(error);
    }

    // Get subcategories and products for this category
    const subcategories = await getChildCategories(categoryData.id);
    const products = await getProductsByCategory(categoryData.id);

    // Render the products template
    res.render('products', {
        title: `Exploring ${categoryData.name}`,
        display,
        categoryData,
        subcategories,
        products,
        hasProducts: products.length > 0,
        hasSubcategories: subcategories.length > 0
    });
});

export default router;