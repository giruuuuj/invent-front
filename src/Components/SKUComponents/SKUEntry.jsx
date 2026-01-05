import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSKU } from '../../Services/SKUService';
import { getRole } from '../../Services/LoginService';
import '../../DisplayView.css';

const SKUEntry = () => {
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [role, setRole] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [skuData, setSkuData] = useState({
        skuId: "",
        skuDescription: "",
    });

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const response = await getRole();
                setRole(response.data);
            } catch (error) {
                console.error('Error fetching role:', error);
            }
        };
        fetchRole();
    }, []);

    const validateForm = () => {
        const tempErrors = {};
        
        if (!skuData.skuId.trim()) {
            tempErrors.skuId = "SKU ID is required";
        } else if (skuData.skuId.length < 3) {
            tempErrors.skuId = "SKU ID must be at least 3 characters";
        }
        
        if (!skuData.skuDescription.trim()) {
            tempErrors.skuDescription = "SKU Description is required";
        } else if (skuData.skuDescription.length < 5) {
            tempErrors.skuDescription = "Description must be at least 5 characters";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await saveSKU(skuData);
            alert('New SKU Added Successfully!');
            
            // Navigate based on role
            const navigationMap = {
                'Admin': '/adminmenu',
                'Manager': '/ManagerMenu',
                'Vendor': '/VendorMenu'
            };
            navigate(navigationMap[role] || '/adminmenu');
        } catch (error) {
            console.error('Error saving SKU:', error);
            alert('Failed to add SKU. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setSkuData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleReturn = () => {
        const navigationMap = {
            'Admin': '/adminmenu',
            'Manager': '/ManagerMenu',
            'Vendor': '/VendorMenu'
        };
        navigate(navigationMap[role] || '/adminmenu');
    };

    return (
        <div className="app-page sku-entry-page">
            <div className="container-fluid">
                <div className="row justify-content-center min-vh-100">
                    <div className="col-md-8 col-lg-6">
                        <div className="card app-card">
                            <div className="card-header">
                                <h2>SKU Entry</h2>
                            </div>
                            <div className="card-body p-4">
                                {isLoading ? (
                                    <div className="text-center">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="skuId" className="form-label">
                                                SKU ID <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.skuId ? 'is-invalid' : ''}`}
                                                id="skuId"
                                                name="skuId"
                                                value={skuData.skuId}
                                                onChange={handleInputChange}
                                                placeholder="Enter SKU ID (e.g., SKU001)"
                                                required
                                            />
                                            {errors.skuId && (
                                                <div className="invalid-feedback">{errors.skuId}</div>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="skuDescription" className="form-label">
                                                SKU Description <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                className={`form-control ${errors.skuDescription ? 'is-invalid' : ''}`}
                                                id="skuDescription"
                                                name="skuDescription"
                                                value={skuData.skuDescription}
                                                onChange={handleInputChange}
                                                rows="3"
                                                placeholder="Enter SKU description"
                                                required
                                            />
                                            {errors.skuDescription && (
                                                <div className="invalid-feedback">{errors.skuDescription}</div>
                                            )}
                                        </div>

                                        <div className="d-grid gap-3 mt-4">
                                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                                {isLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Adding...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-save me-2"></i>
                                                        Save SKU
                                                    </>
                                                )}
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-return"
                                                onClick={handleReturn}
                                            >
                                                <i className="fas fa-arrow-left me-2"></i>
                                                Return to {role === 'Admin' ? 'Admin' : 'Manager'} Menu
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SKUEntry;