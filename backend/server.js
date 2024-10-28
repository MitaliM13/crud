const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { body, param, validationResult } = require('express-validator');

const app = express();
const port = 3000;

app.use(cors()); 
app.use(express.json()); 

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'mydb',
    port: 3306,
}).promise(); 

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); 
    }
    next();
};

app.get('/', (req, res) => {
    res.status(200).send('Result from backend');
});

app.get('/products', async (req, res, next) => {
    try {
        const [rows] = await pool.query("SELECT * FROM products");
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

app.get('/products/:id', 
    param('id').isInt().withMessage('Product ID must be an integer'), 
    handleValidationErrors, 
    async (req, res, next) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});

app.get('/products/name/:name', 
    param('name').isString().notEmpty().withMessage('Product name must be a non-empty string'), 
    handleValidationErrors, 
    async (req, res, next) => {
    const { name } = req.params;
    try {
        const [rows] = await pool.query("SELECT * FROM products WHERE name = ?", [name]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});


app.post('/products', 
    body('name').isString().notEmpty().withMessage('Name must be a non-empty string'),
    body('category').isString().notEmpty().withMessage('Category must be a non-empty string'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('supplier').isString().notEmpty().withMessage('Supplier must be a non-empty string'),
    handleValidationErrors,
    async (req, res, next) => {
    const { name, category, quantity, price, supplier } = req.body;
    const sql = "INSERT INTO products (name, category, quantity, price, supplier) VALUES (?, ?, ?, ?, ?)";
    try {
        const [result] = await pool.query(sql, [name, category, quantity, price, supplier]);
        res.status(201).json({ id: result.insertId, name, category, quantity, price, supplier });
    } catch (err) {
        next(err);
    }
});

app.put('/products/:id', 
    param('id').isInt().withMessage('Product ID must be an integer'), 
    body('name').optional().isString().notEmpty().withMessage('Name must be a non-empty string'),
    body('category').optional().isString().notEmpty().withMessage('Category must be a non-empty string'),
    body('quantity').optional().isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
    body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('supplier').optional().isString().notEmpty().withMessage('Supplier must be a non-empty string'),
    handleValidationErrors,
    async (req, res, next) => {
    const { id } = req.params;
    const { name, category, quantity, price, supplier } = req.body;
    const sql = "UPDATE products SET name = ?, category = ?, quantity = ?, price = ?, supplier = ? WHERE id = ?";
    try {
        const [result] = await pool.query(sql, [name, category, quantity, price, supplier, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ id, name, category, quantity, price, supplier });
    } catch (err) {
        next(err);
    }
});

app.delete('/products/:id', 
    param('id').isInt().withMessage('Product ID must be an integer'), 
    handleValidationErrors, 
    async (req, res, next) => {
    const { id } = req.params;
    const sql = "DELETE FROM products WHERE id = ?";
    try {
        const [result] = await pool.query(sql, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(204).json(); 
    } catch (err) {
        next(err);
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack); 
    res.status(500).json({ error: 'An error occurred', message: err.message });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
