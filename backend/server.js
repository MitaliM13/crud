const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'My123@sql',
    database: 'mydb',
    port: 3306,
    // connectionLimit: 10 
}).promise();

app.get('/', (req, res) => {
    res.send('Result from backend');
});

// Get all products
app.get('/products', async (req, res, next) => {
    try {
        const sql = "SELECT * FROM products";
        const [rows] = await pool.query(sql); 
        res.json(rows);
    } catch (err) {
        next(err); 
    }
});

// Add a new product
app.post('/products', async (req, res, next) => {
    const { name, category, quantity, price, supplier } = req.body;
    const sql = "INSERT INTO products (name, category, quantity, price, supplier) VALUES (?, ?, ?, ?, ?)";
    try {
        const [result] = await pool.query(sql, [name, category, quantity, price, supplier]);
        res.status(201).json({ id: result.insertId, name, category, quantity, price, supplier });
    } catch (err) {
        next(err);
    }
});

// Update a product by ID
app.put('/products/:id', async (req, res, next) => {
    const { id } = req.params;
    const { name, category, quantity, price, supplier } = req.body;
    const sql = "UPDATE products SET name = ?, category = ?, quantity = ?, price = ?, supplier = ? WHERE id = ?";
    try {
        const [result] = await pool.query(sql, [name, category, quantity, price, supplier, id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Product not found' });
        } else {
            res.json({ id, name, category, quantity, price, supplier });
        }
    } catch (err) {
        next(err);
    }
});

// Delete a product by ID
app.delete('/products/:id', async (req, res, next) => {
    const { id } = req.params;
    const sql = "DELETE FROM products WHERE id = ?";
    try {
        const [result] = await pool.query(sql, [id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Product not found' });
        } else {
            res.json({ message: `Product with ID ${id} deleted successfully` });
        }
    } catch (err) {
        next(err);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({
        error: 'An error occurred',
        message: err.message,
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
