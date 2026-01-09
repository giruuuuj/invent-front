import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { displayAllProducts, deleteAProductById } from '../../Services/ProductService';
import { getUserByRole } from '../../Services/LoginService';
import '../../DisplayView.css';

const ProductReport = () => {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products and vendors in parallel
        const [productsResponse, vendorsResponse] = await Promise.all([
          displayAllProducts(),
          getUserByRole('Vendor')
        ]);
        
        setProducts(Array.isArray(productsResponse?.data) ? productsResponse.data.map(product => ({
          ...product,
          stockStatusInfo: getStockStatus(product)
        })) : []);
        setVendors(Array.isArray(vendorsResponse) ? vendorsResponse : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const getStockStatus = (product) => {
    const stock = parseFloat(product.stock || 0);
    const reorderLevel = parseFloat(product.reorder_level || product.reorderLevel || 0);
    
    if (stock <= 0) {
      return {
        status: 'Out of Stock',
        className: 'text-danger',
        canIssue: false
      };
    } else if (stock <= reorderLevel) {
      return {
        status: 'Reorder Level Reached',
        className: 'text-warning',
        canIssue: true
      };
    } else {
      return {
        status: 'Permitted to Issue',
        className: 'text-success',
        canIssue: true
      };
    }
  };

  const getVendorName = (vendorId) => {
    if (!vendorId && vendorId !== 0) return 'Unknown';
    
    console.log('Looking for vendor with ID:', vendorId);
    console.log('Available vendors:', vendors);
    
    // Convert vendorId to number for comparison
    const searchId = parseInt(vendorId);
    
    // Try to find matching vendor from vendors list
    const vendor = vendors.find(v => {
      console.log('Checking vendor:', v, 'against ID:', searchId);
      return v.id === searchId || parseInt(v.id) === searchId;
    });
    
    console.log('Found vendor:', vendor);
    
    if (vendor) {
      const name = vendor.fullName || vendor.name || vendor.username || vendor.displayName || vendor.email;
      console.log('Vendor name found:', name);
      return name || `Vendor ${searchId}`;
    }
    
    // Fallback: if vendorId is a number, try to find vendor by index (0-based)
    const vendorIndex = searchId - 1; // Convert to 0-based index
    if (vendorIndex >= 0 && vendors[vendorIndex]) {
      const indexedVendor = vendors[vendorIndex];
      const name = indexedVendor.fullName || indexedVendor.name || indexedVendor.username || indexedVendor.displayName || indexedVendor.email;
      console.log('Vendor found by index:', name);
      return name || `Vendor ${searchId}`;
    }
    
    // Fallback: format vendorId to display name
    const vendorStr = vendorId.toString();
    if (vendorStr.startsWith('vendor-')) {
      const vendorNum = vendorStr.replace('vendor-', '');
      return `Vendor ${vendorNum}`;
    }
    
    console.log('Using fallback for vendor:', vendorId);
    return `Vendor ${searchId}`;
  };

  const handleEdit = (productId) => {
    navigate(`/product-price-edit/${productId}`);
  };

  const handleIssue = (productId) => {
    // Navigate to the stock edit page with issue action
    navigate(`/edit-stock/${productId}/0`); // 0 indicates issue
  };

  const handlePurchase = (productId) => {
    // Navigate to the stock edit page with purchase action
    navigate(`/edit-stock/${productId}/1`); // 1 indicates purchase
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteAProductById(productId);
        setProducts(products.filter(p => (p.productId || p.product_id) !== productId));
        alert('Product deleted successfully!');
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="app-page">
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4 position-sticky top-0 bg-white z-1" style={{paddingTop: '1rem', paddingBottom: '1rem'}}>
          <h2>Product Report</h2>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/product-entry')}
          >
            Add New Product
          </button>
        </div>

        {products.length === 0 ? (
          <div className="alert alert-info">
            No products available.
          </div>
        ) : (
          <>
            <div className="table-responsive" style={{maxHeight: '70vh', overflowY: 'auto'}}>
              <table className="table table-striped table-hover">
                <thead className="sticky-top bg-light">
                  <tr>
                    <th>Product Id</th>
                    <th>SKU</th>
                    <th>Product Name</th>
                    <th>Vendor Name</th>
                    <th>Purchase Price</th>
                    <th>Sales Price</th>
                    <th>Stock</th>
                    <th>Reorder Level</th>
                    <th>Stock Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.productId || product.product_id}>
                      <td>{product.productId || product.product_id}</td>
                      <td>{product.skuId || product.sku_id}</td>
                      <td>{product.productName || product.product_name}</td>
                      <td>{getVendorName(product.vendorId || product.vendor_id)}</td>
                      <td>{product.purchasePrice?.toFixed(2) || product.purchase_price?.toFixed(2)}</td>
                      <td>{product.salesPrice?.toFixed(2) || product.sales_price?.toFixed(2)}</td>
                      <td>{product.stock}</td>
                      <td>{product.reorderLevel || product.reorder_level}</td>
                      <td className={product.stockStatusInfo?.className || 'text-warning'}>
                        {product.stockStatusInfo?.status || 'Unknown'}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleIssue(product.productId || product.product_id)}
                            title="Issue Product"
                            disabled={!product.stockStatusInfo?.canIssue}
                          >
                            Issue
                          </button>

                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handlePurchase(product.productId || product.product_id)}
                            title="Purchase Product"
                          >
                            Purchase
                          </button>
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(product.productId || product.product_id)}
                            title="Edit Product"
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(product.productId || product.product_id)}
                            title="Delete Product"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <button 
                className="btn btn-danger"
                onClick={() => navigate(-1)}
              >
                Return
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductReport;