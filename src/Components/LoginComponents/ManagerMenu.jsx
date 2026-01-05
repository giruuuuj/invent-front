import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../DisplayView.css';
import "../../Desgin/compound.css"; 


import { logoutUser } from '../../Services/LoginService';


const ManagerMenu = () => {
    let navigate = useNavigate();
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
                        <div className="card app-card manager-menu-card">
                            <div className="card-header bg-success text-white">
                                <h2 className="text-center">Manager Dashboard</h2>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-3 mb-3">
                                        <div className="card menu-item-card">
                                            <div className="card-body text-center">
                                                <i className="fas fa-plus-circle fa-3x mb-3 text-primary"></i>
                                                <h5>Add SKU</h5>
                                                <p className="text-muted">Create new stock keeping units</p>
                                                <button
                                                    className="btn btn-primary btn-block"
                                                    onClick={() => navigate('/skuentry')}
                                                // navigateTOSKUEntry
                                                >
                                                    Add New SKU
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-3 mb-3">
                                        <div className="card menu-item-card">
                                            <div className="card-body text-center">
                                                <i className="fas fa-list-alt fa-3x mb-3 text-success"></i>
                                                <h5>SKU Management</h5>
                                                <p className="text-muted">View and manage SKUs</p>
                                                <button
                                                    className="btn btn-success btn-block"
                                                    onClick={() => navigate('/skureport')}
                                                // navigateTOSKUReport
                                                >
                                                    Manage SKUs
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-3 mb-3">
                                        <div className="card menu-item-card">
                                            <div className="card-body text-center">
                                                <i className="fas fa-boxes fa-3x mb-3 text-warning"></i>
                                                <h5>Inventory</h5>
                                                <p className="text-muted">Manage inventory levels</p>
                                                <button
                                                    className="btn btn-warning btn-block"
                                                    onClick={() => navigate('/productentry')}
                                                // navigateToInventory
                                                >
                                                    View Inventory
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-3 mb-3">
                                        <div className="card menu-item-card">
                                            <div className="card-body text-center">
                                                <i className="fas fa-clipboard-list fa-3x mb-3 text-info"></i>
                                                <h5>Order Management</h5>
                                                <p className="text-muted">Process and track orders</p>
                                                <button
                                                    className="btn btn-info btn-block"
                                                    onClick={() => navigate('/product-list')}
                                                >
                                                    Manage Orders
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

export default ManagerMenu;