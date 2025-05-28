import db from './db.js';

/**
 * SQL to create the categories table if it doesn't exist.
 * 
 * This table stores product categories with both parent and child relationships.
 * The parent_id field allows us to create hierarchical categories like:
 * - Men's Clothing (parent)
 *   - Shoes (child of Men's Clothing)
 *   - Accessories (child of Men's Clothing)
 * 
 * The show_in_nav field determines which categories appear in the main navigation.
 */
const createCategoriesTable = `
    CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        parent_id INTEGER REFERENCES categories(id),
        show_in_nav BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

/**
 * Initial categories to populate the database.
 * Parent categories (show_in_nav: true) appear in navigation.
 * Child categories are accessible within their parent category pages.
 */
const initialCategories = [
    {
        name: "Men's Clothing",
        slug: "mens",
        description: "Explore our collection of men's fashion and apparel",
        parent_id: null,
        show_in_nav: true
    },
    {
        name: "Women's Clothing", 
        slug: "womens",
        description: "Discover our women's fashion line and accessories",
        parent_id: null,
        show_in_nav: true
    },
    {
        name: "Footwear",
        slug: "shoes", 
        description: "Men's shoes and footwear",
        parent_id: 1, // Child of Men's Clothing
        show_in_nav: false
    },
    {
        name: "Accessories",
        slug: "accessories",
        description: "Men's accessories and extras",
        parent_id: 1, // Child of Men's Clothing
        show_in_nav: false
    },
    {
        name: "Footwear",
        slug: "womens-shoes", 
        description: "Women's shoes and footwear",
        parent_id: 2, // Child of Women's Clothing
        show_in_nav: false
    },
    {
        name: "Accessories",
        slug: "womens-accessories",
        description: "Women's accessories and extras", 
        parent_id: 2, // Child of Women's Clothing
        show_in_nav: false
    }
];

/**
 * Inserts a category into the database if it doesn't already exist.
 * Uses ON CONFLICT to avoid duplicate entries when script runs multiple times.
 */
const insertCategory = async (category, verbose = true) => {
    const query = `
        INSERT INTO categories (name, slug, description, parent_id, show_in_nav)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id, name, slug;
    `;

    const values = [category.name, category.slug, category.description, category.parent_id, category.show_in_nav];
    const result = await db.query(query, values);

    if (result.rows.length > 0 && verbose) {
        console.log(`Created category: ${result.rows[0].name}`);
    } else if (verbose) {
        console.log(`Category already exists, skipping: ${category.name}`);
    }
};

/**
 * Sets up the database by creating tables and inserting initial data.
 * This function should be called when the server starts.
 */
const setupDatabase = async () => {
    const verbose = process.env.DISABLE_SQL_LOGGING !== 'true';

    try {
        if (verbose) console.log('Setting up database...');

        // Create the categories table
        await db.query(createCategoriesTable);
        if (verbose) console.log('Categories table ready');

        // Insert initial categories
        for (const category of initialCategories) {
            await insertCategory(category, verbose);
        }

        if (verbose) console.log('Database setup complete');
        return true;
    } catch (error) {
        console.error('Error setting up database:', error.message);
        throw error;
    }
};

/**
 * Tests the database connection by executing a simple query.
 */
const testConnection = async () => {
    try {
        const result = await db.query('SELECT NOW() as current_time');
        console.log('Database connection successful:', result.rows[0].current_time);
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    }
};

export { setupDatabase, testConnection };