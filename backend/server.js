//express, mysql , cors and express validators are modules 
const express = require('express');  //for server
const mysql = require('mysql2'); //for database connectivity
const cors = require('cors'); //for cross-origin requests
const { body, param, validationResult } = require('express-validator');//for handling validations

const app = express();//creating an instance
const port = 3000;

app.use(cors()); //middleware for cross-origin
app.use(express.json()); //middle for easy data handling of incoming json data

const pool = mysql.createPool({ //creates a pool of reusable mysql connection
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'mydb',
    port: 3306,
}).promise(); //promise allows us to use async await with mysql queries

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); 
    }
    next();//to proceed if there are no errors
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
            return res.status(404).json({ message: "Product not found" });//error 400 if invalid data, 404 if product not found
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
            res.status(201).json({ message: "Product added", id: result.insertId, name, category, quantity, price, supplier });
        } catch (err) {
            next(err);
        }
    }
);


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

app.patch('/products/:id',
    param('id').isInt().withMessage('Product ID must be an integer'),
    body('name').optional().isString().notEmpty().withMessage('Name must be a non-empty string'),
    body('category').optional().isString().notEmpty().withMessage('Category must be a non-empty string'),
    body('quantity').optional().isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
    body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('supplier').optional().isString().notEmpty().withMessage('Supplier must be a non-empty string'),
    handleValidationErrors,
    async (req, res, next) => {
    const { id } = req.params;
    const fieldsToUpdate = req.body;

    const updates = Object.keys(fieldsToUpdate).map(field => `${field} = ?`).join(', ');
    const values = Object.values(fieldsToUpdate);

    const sql = `UPDATE products SET ${updates} WHERE id = ?`;
    values.push(id); 
    try {
        const [result] = await pool.query(sql, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ id, ...fieldsToUpdate });
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
