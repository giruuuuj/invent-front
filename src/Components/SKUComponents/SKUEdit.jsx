import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateSKU, getSKUById } from '../../Services/SKUService';
import { getRole } from '../../Services/LoginService';
import '../../DisplayView.css';

const SKUEdit = () => {
    const navigate = useNavigate();
    const { skuno } = useParams();
    const [errors, setErrors] = useState({});
    const [role, setRole] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [skuData, setSkuData] = useState({
        skuId: "",
        skuDescription: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch role and SKU data in parallel
                const [roleResponse, skuResponse] = await Promise.all([
                    getRole(),
                    getSKUById(skuno)
                ]);
                
                setRole(roleResponse.data);
                setSkuData({
                    skuId: skuResponse.data.skuId || "",
                    skuDescription: skuResponse.data.skuDescription || "",
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Failed to load SKU data. Please try again.');
                navigate('/skureport');
            }
        };

        fetchData();
    }, [skuno, navigate]);

    const validateForm = () => {
        const tempErrors = {};
        
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
            await updateSKU(skuData);
            alert('SKU updated successfully!');
            navigate('/skureport');
        } catch (error) {
            console.error('Error updating SKU:', error);
            alert('Failed to update SKU. Please try again.');
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
        navigate('/skureport');
    };

    return (
        <div className="app-page">
            <div className="container-fluid">
                <div className="row justify-content-center min-vh-100">
                    <div className="col-md-8 col-lg-6">
                        <div className="card app-card login-card">
                            <div className="card-header bg-primary text-white">
                                <h2 className="text-center login-title">
                                    <u>SKU Update</u>
                                </h2>
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
                                            <label className="form-label">SKU ID</label>
                                            <input 
                                                type="text"
                                                className="form-control"
                                                value={skuData.skuId}
                                                readOnly
                                                disabled
                                            />
                                            <small className="text-muted">SKU ID cannot be modified</small>
                                        </div>

                                        <div className="mb-4">
                                            <label htmlFor="skuDescription" className="form-label">
                                                SKU Description <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                className={`form-control ${errors.skuDescription ? 'is-invalid' : ''}`}
                                                id="skuDescription"
                                                placeholder="Enter SKU Description"
                                                name="skuDescription" 
                                                value={skuData.skuDescription} 
                                                onChange={handleInputChange}
                                                rows="3"
                                                disabled={isLoading}
                                            />
                                            {errors.skuDescription && (
                                                <div className="invalid-feedback">{errors.skuDescription}</div>
                                            )}
                                        </div>

                                        <div className="d-grid gap-2 mt-4">
                                            <button 
                                                type="submit"
                                                className="btn login-btn"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-save me-2"></i>
                                                        Update SKU
                                                    </>
                                                )}
                                            </button>
                                            <button 
                                                type="button"
                                                className="btn btn-register"
                                                onClick={handleReturn}
                                                disabled={isLoading}
                                            >
                                                <i className="fas fa-arrow-left me-2"></i>
                                                Return to SKU List
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

export default SKUEdit;