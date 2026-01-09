import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, editProductPrice } from '../../Services/ProductService';
import { getUserId } from '../../Services/LoginService';

const ProductPriceEdit = () => {
    const [product, setProduct] = useState({
        productId: '',
        productName: '',
        skuId: '',
        purchasePrice: 0.0,
        salesPrice: 0.0,
        reorderLevel: 0.0,
        stock: 0.0,
        vendorId: "",
        status: true,
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [userId, setUserId] = useState("");
    const [newPurchasePrice, setNewPurchasePrice] = useState(0.0);
    const [newSalesPrice, setNewSalesPrice] = useState(0.0);
    
    let navigate = useNavigate();
    let param = useParams();

    const setProductData = () => {
        getProductById(param.id).then((response) => {
            const productData = response.data;
            setProduct(productData);
            setNewPurchasePrice(productData.purchasePrice || productData.purchase_price || 0.0);
            setNewSalesPrice(productData.salesPrice || productData.sales_price || 0.0);
        }).catch(error => {
            console.error("Error fetching product:", error);
            setErrors({ fetch: "Failed to load product data" });
        });
    };

    const setUserData = () => {
        getUserId().then((response) => {
            setUserId(response.data);
        }).catch(error => {
            console.error("Error fetching user ID:", error);
            setUserId("default-user");
        });
    };

    useEffect(() => {
        setProductData();
        setUserData();
    }, [param.id]);

    const returnBack = () => {
        navigate('/product-report');
    };

    const priceEdit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccess("");

        try {
            const updatedProduct = {
                ...product,
                purchasePrice: parseFloat(newPurchasePrice),
                salesPrice: parseFloat(newSalesPrice),
                productId: product.productId || product.product_id
            };

            await editProductPrice(updatedProduct);
            setSuccess("Product prices updated successfully!");
            
            setTimeout(() => {
                returnBack();
            }, 1500);

        } catch (error) {
            console.error("Error updating prices:", error);
            setErrors({ submit: "Failed to update prices. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const handleValidation = (event) => {
        event.preventDefault();
        let tempErrors = {};
        let isValid = true;

        if (!newPurchasePrice || parseFloat(newPurchasePrice) <= 0) {
            tempErrors.purchasePrice = "Purchase price must be greater than zero";
            isValid = false;
        }

        if (!newSalesPrice || parseFloat(newSalesPrice) <= 0) {
            tempErrors.salesPrice = "Sales price must be greater than zero";
            isValid = false;
        }

        if (parseFloat(newSalesPrice) <= parseFloat(newPurchasePrice)) {
            tempErrors.salesPrice = "Sales price should be greater than purchase price";
            isValid = false;
        }
        
        setErrors(tempErrors);
        if (isValid) {
            priceEdit(event);
        }
    };

    return (
        <div className="app-page">
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow-lg border-0">
                            <div className="card-header bg-gradient-primary text-white py-3">
                                <h3 className="mb-0">
                                    <i className="fas fa-tag me-2"></i>
                                    Edit Product Prices
                                </h3>
                            </div>
                            <div className="card-body">
                                {errors.fetch && (
                                    <div className="alert alert-danger">{errors.fetch}</div>
                                )}
                                
                                {success && (
                                    <div className="alert alert-success">{success}</div>
                                )}
                                
                                {errors.submit && (
                                    <div className="alert alert-danger">{errors.submit}</div>
                                )}
                                
                                <form onSubmit={handleValidation} noValidate>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-bold text-muted">Product ID</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control bg-light" 
                                                    value={product.productId || product.product_id} 
                                                    readOnly 
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-bold text-muted">Product Name</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control bg-light" 
                                                    value={product.productName || product.product_name} 
                                                    readOnly 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-bold text-muted">SKU</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control bg-light" 
                                                    value={product.skuId || product.sku_id} 
                                                    readOnly 
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-bold text-muted">Current Stock</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control bg-light" 
                                                    value={product.stock} 
                                                    readOnly 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="my-4" />

                                    <h5 className="mb-4 text-primary">
                                        <i className="fas fa-edit me-2"></i>
                                        Update Prices
                                    </h5>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">
                                                    <i className="fas fa-rupee-sign me-1"></i>
                                                    Purchase Price
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text">₹</span>
                                                    <input 
                                                        type="number" 
                                                        className={`form-control ${errors.purchasePrice ? 'is-invalid' : ''}`}
                                                        value={newPurchasePrice} 
                                                        onChange={(e) => {
                                                            setNewPurchasePrice(e.target.value);
                                                            if (errors.purchasePrice) {
                                                                setErrors({...errors, purchasePrice: null});
                                                            }
                                                        }}
                                                        step="0.01"
                                                        min="0"
                                                        disabled={loading}
                                                    />
                                                </div>
                                                {errors.purchasePrice && (
                                                    <div className="invalid-feedback d-block">
                                                        <i className="fas fa-exclamation-triangle me-1"></i>
                                                        {errors.purchasePrice}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">
                                                    <i className="fas fa-rupee-sign me-1"></i>
                                                    Sales Price
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text">₹</span>
                                                    <input 
                                                        type="number" 
                                                        className={`form-control ${errors.salesPrice ? 'is-invalid' : ''}`}
                                                        value={newSalesPrice} 
                                                        onChange={(e) => {
                                                            setNewSalesPrice(e.target.value);
                                                            if (errors.salesPrice) {
                                                                setErrors({...errors, salesPrice: null});
                                                            }
                                                        }}
                                                        step="0.01"
                                                        min="0"
                                                        disabled={loading}
                                                    />
                                                </div>
                                                {errors.salesPrice && (
                                                    <div className="invalid-feedback d-block">
                                                        <i className="fas fa-exclamation-triangle me-1"></i>
                                                        {errors.salesPrice}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {newPurchasePrice > 0 && newSalesPrice > 0 && (
                                        <div className="alert alert-info">
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-chart-line me-2 fa-lg"></i>
                                                <div>
                                                    <strong>Profit Margin:</strong>
                                                    <div className="fs-5">
                                                        ₹{(parseFloat(newSalesPrice) - parseFloat(newPurchasePrice)).toFixed(2)} 
                                                        <span className="text-muted ms-2">
                                                            ({(((parseFloat(newSalesPrice) - parseFloat(newPurchasePrice)) / parseFloat(newSalesPrice)) * 100).toFixed(1)}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-secondary" 
                                            onClick={returnBack}
                                            disabled={loading}
                                        >
                                            <i className="fas fa-arrow-left me-1"></i>
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-save me-1"></i>
                                                    Update Prices
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPriceEdit;