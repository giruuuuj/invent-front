import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../DisplayView.css';
import {logoutUser} from '../../Services/LoginService';
import "../../Desgin/compound.css"; 


const VendorMenu = () => {
    let navigate=useNavigate();
     const handleLogout = () => {
       logoutUser()
         .then(() => {
           localStorage.clear();
           sessionStorage.clear();
           navigate('/');
         })
     };

    return (
        <div className="app-page">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card app-card vendor-menu-card">
                            <div className="card-header bg-warning text-dark">
                                <h2 className="text-center">Vendor Dashboard</h2>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-3 mb-3">
                                        <div className="card menu-item-card">
                                            <div className="card-body text-center">
                                                <i className="fas fa-list-alt fa-3x mb-3 text-primary"></i>
                                                <h5>Browse SKUs</h5>
                                                <p className="text-muted">View available products</p>
                                                <button 
                                                    className="btn btn-primary btn-block"
                                                    onClick={() => navigate('/skureport')}
                                                    //navigateTOSKUReport
                                                >
                                                    View Products
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="col-md-3 mb-3">
                                        <div className="card menu-item-card">
                                            <div className="card-body text-center">
                                                <i className="fas fa-box-open fa-3x mb-3 text-success"></i>
                                                <h5>Edit Pricing</h5>
                                                <p className="text-muted">Manage your product prices</p>
                                                <button 
                                                    className="btn btn-success btn-block"
                                                    onClick={() => navigate('/update-product/:id')}
                                                    //navigateToMyProducts
                                                >
                                                    My Products
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="col-md-3 mb-3">
                                        <div className="card menu-item-card">
                                            <div className="card-body text-center">
                                                <i className="fas fa-shopping-cart fa-3x mb-3 text-warning"></i>
                                                <h5>My Orders</h5>
                                                <p className="text-muted">Track your orders</p>
                                                <button 
                                                    className="btn btn-warning btn-block"
                                                    onClick={() => navigate('/orders')}
                                                    //navigateToOrders
                                                >
                                                    View Orders
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="col-md-3 mb-3">
                                        <div className="card menu-item-card">
                                            <div className="card-body text-center">
                                                <i className="fas fa-user-circle fa-3x mb-3 text-info"></i>
                                                <h5>Add Product</h5>
                                                <p className="text-muted">Add new products</p>
                                                <button 
                                                    className="btn btn-info btn-block"
                                                    onClick={() => navigate('/product-entry')}
                                                    //navigateToProfile
                                                >
                                                    Edit Profile
                                                </button>
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

export default VendorMenu;