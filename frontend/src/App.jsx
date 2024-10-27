/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import './App.css';

const App = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', quantity: '', price: '', supplier: '' });
  const [editProduct, setEditProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    fetch('http://localhost:3000/products')
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setFilteredData(data); // Initialize filtered data to the full data set
      })
      .catch((error) => console.log(error));
  };

  const addProduct = () => {
    fetch('http://localhost:3000/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    })
      .then(() => {
        fetchProducts();
        setNewProduct({ name: '', category: '', quantity: '', price: '', supplier: '' });
      })
      .catch((error) => console.log(error));
  };

  const updateProduct = (id) => {
    fetch(`http://localhost:3000/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    })
      .then(() => {
        fetchProducts();
        setEditProduct(null);
        setNewProduct({ name: '', category: '', quantity: '', price: '', supplier: '' });
      })
      .catch((error) => console.log(error));
  };

  const deleteProduct = (id) => {
    fetch(`http://localhost:3000/products/${id}`, {
      method: 'DELETE',
    })
      .then(() => fetchProducts())
      .catch((error) => console.log(error));
  };

  const handleEditClick = (product) => {
    setEditProduct(product);
    setNewProduct(product);
  };

  // Handle search functionality
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === '') {
      setFilteredData(data); // If no search term, reset to full data
    } else {
      setFilteredData(
        data.filter((product) =>
          Object.values(product)
            .some(value => String(value).toLowerCase().includes(term))
        )
      );
    }
  };

  return (
    <div className="App">
      <div className='table'>
        <h1>Product List</h1>
        
        <input 
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
        />

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Supplier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.quantity}</td>
                <td>{product.price ? `$${product.price}` : 'N/A'}</td>
                <td>{product.supplier || 'N/A'}</td>
                <td>
                  <button onClick={() => handleEditClick(product)}>Edit</button>
                  <button onClick={() => deleteProduct(product.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='form'>
        <h2>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
        <input
          type="text"
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Category"
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newProduct.quantity}
          onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
        />
        <input
          type="text"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
        />
        <input
          type="text"
          placeholder="Supplier"
          value={newProduct.supplier}
          onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
        />
        <button onClick={() => (editProduct ? updateProduct(editProduct.id) : addProduct())}>
          {editProduct ? 'Update' : 'Add'}
        </button>
      </div>
    </div>
  );
};

export default App;
