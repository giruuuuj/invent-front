import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductService } from '../../Services/ProductService';
import { getUserByRole } from '../../Services/LoginService';
import { getAllskuIds } from '../../Services/SKUService';

const ProductEntry = () => {
  let navigate = useNavigate();
  const [flag, setFlag] = useState(false);
  const [newId , setNewId] = useState('');
  const [errors, setErrors] = useState({});
  const [vendorList, setVendorList] = useState([]);
  const [skuList, setSkuList] = useState([]);

  const [product, setProduct] = useState({
    productId: '',
    productName: '',
    skuId: '',
    purchasePrice: 0.0,
    salesPrice: 0.0,
    reorderLevel: 0.0,
    stock: 0.0,
    vendorId: '',
    status: true,
  });

  // Initialize component
  useEffect(() => {
    setNewProductId();
    setVendors();
    setSkuIds();
  }, []);

  // Set new product ID
  const setNewProductId = async () => {
    ProductService.generateId().then((response) => {
      setNewId(response.data);
    });
  }

  const setVendors = async () => {
    try {
      const response = await getUserByRole('vendor');
      setVendorList(response);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendorList([]);
    }
  }

  const setSkuIds = async () => {
    getAllskuIds().then((response) => {
      setSkuList(response.data);
    });
  }

  const saveProduct = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Current product state before save:', product);
      
      const { salesPrice, ...productWithoutSalesPrice } = product;
      const productToSave = { 
        ...productWithoutSalesPrice, 
        productId: newId,
        // Ensure numeric values are properly converted
        purchasePrice: parseFloat(productWithoutSalesPrice.purchasePrice) || 0,
        stock: parseFloat(productWithoutSalesPrice.stock) || 0,
        reorderLevel: parseFloat(productWithoutSalesPrice.reorderLevel) || 0
      };
      
      console.log('Final data being sent to backend:', productToSave);
      
      await ProductService.create(productToSave);
      alert('Product saved successfully!');
      navigate('/AdminMenu');
    } catch (error) {
      console.error('Save error:', error);
      alert(error.response?.data?.message || 'Failed to save product');
      error.response?.status === 403 && navigate('/login');
    }
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    
    console.log(`Field changed: ${name} = ${value}`);
    
    if (name === 'purchasePrice') {
      const purchasePrice = parseFloat(value) || 0;
      const calculatedSalesPrice = (purchasePrice * 1.20).toFixed(2); // 20% markup for display only
      setProduct(prev => ({ 
        ...prev, 
        [name]: value,
        salesPrice: calculatedSalesPrice
      }));
    } else {
      setProduct(prev => ({ ...prev, [name]: value }));
    }
  }

  const clearAll = () => {
    setProduct({
      productName: "",
      skuId: "",
      purchasePrice: 0.0,
      salesPrice: 0.0,
      reorderLevel: 0.0,
      stock: 0.0,
      vendorId: ""
    });
  }

  const handleValidation = (event) => {
    event.preventDefault();
    let tempErrors = {};
    let isValid = true;

    if (!product.productName.trim()) {
      tempErrors.productName = 'Product Name is required';
      isValid = false;
    }
    if (!product.skuId) {
      tempErrors.skuId = 'Please select a SKU';
      isValid = false;
    }
    if (!product.vendorId) {
      tempErrors.vendorId = 'Please select a vendor';
      isValid = false;
    }

    setErrors(tempErrors);
    if (isValid) {
      saveProduct(event);
    }
    return isValid;
  };

  return (
    <div className="app-page">
      <div className="container mt-4">
        <div className="card app-card">
          <div className="card-header bg-primary text-white">
            <h2 className="mb-0">Add New Product</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleValidation}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Product ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newId}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Product Name*</label>
                  <input
                    type="text"
                    className={`form-control ${errors.productName ? 'is-invalid' : ''}`}
                    name="productName"
                    value={product.productName}
                    onChange={onChangeHandler}
                    required
                  />
                  {errors.productName && (
                    <div className="invalid-feedback">{errors.productName}</div>
                  )}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">SKU ID*</label>
                  <select
                    className={`form-select ${errors.skuId ? 'is-invalid' : ''}`}
                    name="skuId"
                    value={product.skuId}
                    onChange={onChangeHandler}
                    required
                  >
                    <option value="">Select SKU</option>
                    {skuList && Array.isArray(skuList) && skuList.map((sku, index) => (
                      <option key={sku.skuId || index} value={sku.skuId || sku}>
                        {sku.skuId || sku}
                      </option>
                    ))}
                  </select>
                  {errors.skuId && (
                    <div className="invalid-feedback">{errors.skuId}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Vendor*</label>
                  <select
                    className={`form-select ${errors.vendorId ? 'is-invalid' : ''}`}
                    name="vendorId"
                    value={product.vendorId}
                    onChange={onChangeHandler}
                    required
                  >
                    <option value="">Select Vendor</option>
                    {vendorList && vendorList !== null && Array.isArray(vendorList) && vendorList.map((vendor, index) => (
                      <option key={vendor.id || index} value={vendor.id || index}>
                        {vendor.username || vendor.fullName || `Vendor ${index + 1}`}
                      </option>
                    ))}
                  </select>
                  {errors.vendorId && (
                    <div className="invalid-feedback">{errors.vendorId}</div>
                  )}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Purchase Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    name="purchasePrice"
                    value={product.purchasePrice}
                    onChange={onChangeHandler}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Sales Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    name="salesPrice"
                    value={product.salesPrice}
                    onChange={onChangeHandler}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    name="stock"
                    value={product.stock}
                    onChange={onChangeHandler}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    name="reorderLevel"
                    value={product.reorderLevel}
                    onChange={onChangeHandler}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={clearAll}
                  disabled={flag}
                >
                  Clear
                </button>
                <div>
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-2"
                    onClick={() => navigate(-1)}
                    disabled={flag}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={flag}
                  >
                    {flag ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEntry;