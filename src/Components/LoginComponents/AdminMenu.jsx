import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../DisplayView.css';
import { logoutUser } from '../../Services/LoginService';

const AdminMenu = () => {
  let navigate = useNavigate();
  const [skuMenuOpen, setSkuMenuOpen] = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [transactionMenuOpen, setTransactionMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser()
      .then(() => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/');
      });
  };

  const toggleSkuMenu = () => {
    setSkuMenuOpen(!skuMenuOpen);
    if (productMenuOpen) setProductMenuOpen(false);
    if (transactionMenuOpen) setTransactionMenuOpen(false);
  };

  const toggleProductMenu = () => {
    setProductMenuOpen(!productMenuOpen);
    if (skuMenuOpen) setSkuMenuOpen(false);
    if (transactionMenuOpen) setTransactionMenuOpen(false);
  };

  const toggleTransactionMenu = () => {
    setTransactionMenuOpen(!transactionMenuOpen);
    if (skuMenuOpen) setSkuMenuOpen(false);
    if (productMenuOpen) setProductMenuOpen(false);
  };

  return (
    <div className="app-page admin-menu-page">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="card app-card admin-menu-card">
              <div className="card-header bg-primary text-white">
                <h2 className="text-center">Admin Dashboard</h2>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* SKU Card with Dropdown */}
                  <div className="col-md-4 mb-3">
                    <div className="card menu-item-card">
                      <div className="card-body text-center">
                        <i className="fas fa-boxes fa-3x mb-3 text-primary"></i>
                        <h5>SKU Management</h5>
                        <p className="text-muted">Manage Stock Keeping Units</p>
                        
                        <button 
                          className="btn btn-primary btn-block mb-2"
                          onClick={toggleSkuMenu}
                        >
                          {skuMenuOpen ? 'Hide Options' : 'Show Options'}
                        </button>
                        
                        {skuMenuOpen && (
                          <div className="sku-dropdown-menu mt-2">
                            <div className="d-grid gap-2">
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => navigate('/skuentry')}
                              >
                                <i className="fas fa-plus-circle me-2"></i>
                                SKU Addition
                              </button>
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => navigate('/skureport')}
                              >
                                <i className="fas fa-list-alt me-2"></i>
                                SKU List
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Product Card with Dropdown */}
                  <div className="col-md-4 mb-3">
                    <div className="card menu-item-card">
                      <div className="card-body text-center">
                        <i className="fas fa-cube fa-3x mb-3 text-success"></i>
                        <h5>Product Management</h5>
                        <p className="text-muted">Manage Products</p>
                        
                        <button 
                          className="btn btn-success btn-block mb-2"
                          onClick={toggleProductMenu}
                        >
                          {productMenuOpen ? 'Hide Options' : 'Show Options'}
                        </button>
                        
                        {productMenuOpen && (
                          <div className="product-dropdown-menu mt-2">
                            <div className="d-grid gap-2">
                              <button 
                                className="btn btn-outline-success"
                                onClick={() => navigate('/product-entry')}
                              >
                                <i className="fas fa-plus-circle me-2"></i>
                                Product Addition
                              </button>
                              <button 
                                className="btn btn-outline-success"
                                onClick={() => navigate('/product-list')}
                              >
                                <i className="fas fa-list-alt me-2"></i>
                                Product List
                              </button>
                              <button 
                                className="btn btn-outline-success"
                                onClick={() => navigate('/product-analysis')}
                              >
                                <i className="fas fa-chart-line me-2"></i>
                                Product Analysis
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Transaction Management */}
                  <div className="col-md-4 mb-3">
                    <div className="card menu-item-card">
                      <div className="card-body text-center">
                        <i className="fas fa-exchange-alt fa-3x mb-3 text-info"></i>
                        <h5>Transaction Management</h5>
                        <p className="text-muted">Manage stock transactions</p>
                        
                        <button 
                          className="btn btn-info btn-block mb-2"
                          onClick={toggleTransactionMenu}
                        >
                          {transactionMenuOpen ? 'Hide Options' : 'Show Options'}
                        </button>
                        
                        {transactionMenuOpen && (
                          <div className="transaction-dropdown-menu mt-2">
                            <div className="d-grid gap-2">
                              <button 
                                className="btn btn-outline-info"
                                onClick={() => navigate('/in-transaction')}
                              >
                                <i className="fas fa-arrow-down me-2"></i>
                                IN Transaction
                              </button>
                              <button 
                                className="btn btn-outline-info"
                                onClick={() => navigate('/out-transaction')}
                              >
                                <i className="fas fa-arrow-up me-2"></i>
                                OUT Transaction
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row mt-4">
                  <div className="col-md-12 text-center">
                    <button 
                      className="btn btn-danger btn-lg"
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMenu;