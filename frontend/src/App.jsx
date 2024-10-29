import { useEffect, useState } from 'react';
import './App.css';
import validator from 'validator';

const App = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', quantity: '', price: '', supplier: '' });
  const [editProduct, setEditProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [errors, setErrors] = useState({}); 
  const [apiError, setApiError] = useState(''); 

  useEffect(() => {
    fetchProducts();
  }, []);
 
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/products');
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const products = await response.json();
      setData(products);
      setFilteredData(products);
      setApiError(''); 
    } catch (error) {
      setApiError(error.message); 
    }
  };

  const validateProduct = (product) => {
    const validationErrors = {};
    
    if (!product.name) {
      validationErrors.name = "Product name is required.";
    }
    if (!product.category ) {
      validationErrors.category = "Category is required.";
    }
    if (!product.quantity || !validator.isNumeric(product.quantity.toString())) {
      validationErrors.quantity = "Quantity is required and must be a number.";
    }
    if (!product.price || !validator.isNumeric(product.price.toString())) {
      validationErrors.price = "Price is required and must be a number.";
    }
    if (product.supplier && !validator.isAlphanumeric(product.supplier, 'en-US', { ignore: ' ' })) {
      validationErrors.supplier = "Supplier name must be alphanumeric.";
    }

    return { isValid: Object.keys(validationErrors).length === 0, validationErrors };
  };

  const addProduct = () => {
    fetch('http://localhost:3000/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    })
      .then(handleResponse) 
      .catch(error => setApiError(error.message)); 
  };

  const updateProduct = (id) => {
    fetch(`http://localhost:3000/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    })
      .then(handleResponse) 
      .catch(error => setApiError(error.message)); 
  };

  const handleResponse = (response) => {
    if (!response.ok) {
      return response.json().then(error => { throw new Error(error.error || "Request failed") });
    }
    fetchProducts(); 
    resetForm(); 
  };

  const resetForm = () => {
    setNewProduct({ name: '', category: '', quantity: '', price: '', supplier: '' });
    setEditProduct(null); 
    setApiError(''); 
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { isValid, validationErrors } = validateProduct(newProduct);
    setErrors(validationErrors);
    
    if (isValid) {
      editProduct ? updateProduct(editProduct.id) : addProduct();
    }
  };

  const deleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE',
      })
        .then(handleResponse) 
        .catch(error => setApiError(error.message));
    }
  };

  const handleEditClick = (product) => {
    setEditProduct(product);
    setNewProduct(product);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === '') {
      setFilteredData(data); 
    } else {
      setFilteredData(
        data.filter(product =>
          Object.values(product).some(value => String(value).toLowerCase().includes(term))
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
        
        {apiError && <div className="error">{apiError}</div>} {
        }

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
            {filteredData.map(product => (
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
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={newProduct.name}
            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          {errors.name && <span className="error">{errors.name}</span>}
          
          <input
            type="text"
            placeholder="Category"
            value={newProduct.category}
            onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
          />
          {errors.category && <span className="error">{errors.category}</span>}
          
          <input
            type="number"
            placeholder="Quantity"
            value={newProduct.quantity}
            onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })}
          />
          {errors.quantity && <span className="error">{errors.quantity}</span>}
          
          <input
            type="text"
            placeholder="Price"
            value={newProduct.price}
            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          {errors.price && <span className="error">{errors.price}</span>}
          
          <input
            type="text"
            placeholder="Supplier"
            value={newProduct.supplier}
            onChange={e => setNewProduct({ ...newProduct, supplier: e.target.value })}
          />
          {errors.supplier && <span className="error">{errors.supplier}</span>}
          
          <button type="submit">
            {editProduct ? 'Update' : 'Add'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
