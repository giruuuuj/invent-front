import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../DisplayView.css';
import { logoutUser } from '../../Services/LoginService';
import "../../Desgin/compound.css";

const VendorMenu = () => {
    let navigate = useNavigate();

    useEffect(() => {
        // Directly navigate to UserView when component mounts
        navigate('/userview');
    }, [navigate]);

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
                        <div className="card app-card">
                            <div className="card-header bg-warning text-dark">
                                <h2 className="text-center">Loading Vendor Dashboard...</h2>
                            </div>
                            <div className="card-body text-center">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                                <p className="mt-3">Redirecting to User View...</p>
                                
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