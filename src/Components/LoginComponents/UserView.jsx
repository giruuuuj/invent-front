import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../Services/LoginService';
import './UserView.css';

const UserView = () => {
    const navigate = useNavigate();
    const [inventoryUser, setInventoryUser] = useState({
        username: "",
        password: "",
        personalName: "",
        email: "",
        role: "",
    });

    const setUserData = () => {
        const user = getCurrentUser();
        console.log('User data from getCurrentUser():', user);
        
        if (user) {
            let userData = {
                username: "",
                password: "",
                personalName: "",
                email: "",
                role: "",
            };
            
            if (typeof user === 'object' && user.username) {
                userData = {
                    username: user.username || user.email?.split('@')[0] || "Unknown",
                    personalName: user.fullName || user.personalName || user.name || "Not provided",
                    email: user.email || "Not provided",
                    role: user.role || "Unknown",
                };
            } else if (typeof user === 'string') {
                if (user.includes('Admin')) {
                    userData = {
                        username: "admin",
                        personalName: "Administrator",
                        email: "admin@example.com",
                        role: "Admin",
                    };
                } else if (user.includes('Vendor')) {
                    userData = {
                        username: "vendor1",
                        personalName: "Vendor One",
                        email: "vendor1@example.com",
                        role: "Vendor",
                    };
                } else if (user.includes('Manager')) {
                    userData = {
                        username: "manager1",
                        personalName: "Manager One",
                        email: "manager@example.com",
                        role: "Manager",
                    };
                } else {
                    userData = {
                        username: "user",
                        personalName: "Registered User",
                        email: "user@example.com",
                        role: "User",
                    };
                }
            }
            
            setInventoryUser(userData);
        } else {
            console.log('No user found - showing sample vendor data for development');
            setInventoryUser({
                username: "vendor1",
                password: "",
                personalName: "Vendor One",
                email: "vendor1@example.com",
                role: "Vendor",
            });
        }
    };

    useEffect(() => {
        setUserData();
    }, []);

    const returnBack = () => {
        if (inventoryUser.role === 'Admin') {
            navigate('/AdminMenu');
        } else if (inventoryUser.role === 'Manager') {
            navigate('/ManagerMenu');
        } else if (inventoryUser.role === 'Vendor') {
            navigate('/VendorMenu');
        } else {
            navigate('/');
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'Admin':
                return 'fas fa-user-shield';
            case 'Manager':
                return 'fas fa-user-tie';
            case 'Vendor':
                return 'fas fa-store';
            default:
                return 'fas fa-user';
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'Admin':
                return '#e74c3c';
            case 'Manager':
                return '#f39c12';
            case 'Vendor':
                return '#28a745';
            default:
                return '#6c757d';
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/');
        }
    };

    return (
        <div className="user-view-container">
            <div className="user-profile-card">
                {!inventoryUser.username ? (
                    <div className="login-prompt">
                        <div className="login-prompt-content">
                            <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                            <h4>No User Session Found</h4>
                            <p>Please log in to View your profile information.</p>
                            <button onClick={() => navigate('/')} className="btn btn-primary">
                                <i className="fas fa-sign-in-alt"></i> Go to Login
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="profile-header">
                            <div className="profile-avatar">
                                <i className={`${getRoleIcon(inventoryUser.role)} fa-4x`}></i>
                            </div>
                            <div className="profile-info">
                                <h2>User Profile</h2>
                                <div className="user-role-badge" style={{ backgroundColor: getRoleColor(inventoryUser.role) }}>
                                    {inventoryUser.role}
                                </div>
                            </div>
                        </div>
                        
                        <div className="user-details">
                            <div className="detail-section">
                                <h3>
                                    <i className="fas fa-user-circle"></i> Personal Information
                                </h3>
                                <div className="detail-row">
                                    <span className="detail-label">
                                        <i className="fas fa-user"></i> Username:
                                    </span>
                                    <span className="detail-value">{inventoryUser.username}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">
                                        <i className="fas fa-id-card"></i> Full Name:
                                    </span>
                                    <span className="detail-value">{inventoryUser.personalName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">
                                        <i className="fas fa-envelope"></i> Email Address:
                                    </span>
                                    <span className="detail-value">{inventoryUser.email}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">
                                        <i className="fas fa-shield-alt"></i> User Role:
                                    </span>
                                    <span className="detail-value role-badge" style={{ backgroundColor: getRoleColor(inventoryUser.role) }}>
                                        {inventoryUser.role}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>
                                    <i className="fas fa-arrow-left"></i> Navigation
                                </h3>
                                <div className="action-buttons">
                                    <button className="return-button" onClick={returnBack}>
                                        <i className="fas fa-arrow-left"></i> Return to Dashboard
                                    </button>
                                    <button className="btn btn-danger" onClick={handleLogout}>
                                        <i className="fas fa-sign-out-alt"></i> Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default UserView;