import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { getUserDetails } from '../../Services/LoginService';
import '../../DisplayView.css';

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
        getUserDetails().then((response) => {
            setInventoryUser(response.data);
        }).catch(error => {
            alert("Error Occurred while fetching user data: " + error);
        });
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
            navigate('/'); // Default fallback navigation
        }
    };

    return (
        <div className="user-view-container">
            <div className="user-profile-card">
                <h2>User Profile</h2>
                
                <div className="user-details">
                    <div className="detail-row">
                        <span className="detail-label">Username:</span>
                        <span className="detail-value">{inventoryUser.username}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Personal Name:</span>
                        <span className="detail-value">{inventoryUser.personalName}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{inventoryUser.email}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Role:</span>
                        <span className="detail-value role-badge">{inventoryUser.role}</span>
                    </div>
                </div>

                <div className="action-buttons">
                    <button 
                        className="return-button" 
                        onClick={returnBack}
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserView;