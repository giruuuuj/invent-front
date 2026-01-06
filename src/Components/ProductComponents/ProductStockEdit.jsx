import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getProductById, editProductStock } from '../../Services/ProductService';
import { getUserId, getUserByRole } from '../../Services/LoginService';
// FIX: Change transactionIdGenerate to transactionIdGenerator
import { transactionIdGenerator, saveTransaction } from '../../Services/TransactionService';

const ProductStockEdit = () => {    
    const [product, setProduct] = useState({
        productId: '',
        productName: '',
        skuId: '',
        purchasePrice: 0.0,
        salesPrice: 0.0,
        stock: 0.0,
        reorderLevel: 0.0,
        vendorId: '',
        status: true
    });

    const [newId, setNewId] = useState(0);
    const [userId, setUserId] = useState('');
    const [flag, setFlag] = useState("");
    const [errors, setErrors] = useState({});
    const [warns, setWarns] = useState(null);
    const [tdate, setTdate] = useState(new Date().toISOString().split('T')[0]);
    const [transaction, setTransaction] = useState({
        transactionId: 0,
        transactionType: "",
        productId: "",
        rate: 0.0,
        quantity: 0.0,
        transactionValue: 0.0,
        userId: "",
        transactionDate: new Date(),
    });

    const [transValue, setTransValue] = useState(null);
    let navigate = useNavigate();
    let params = useParams();
    let location = useLocation();  
    const [quantity, setQuantity] = useState(0.0);
    const [vendors, setVendors] = useState([]);

    const setProductData = () => {
        if (location.state?.product) {
            setProduct(location.state.product);
            setFlag(params.no);
        } else {
            getProductById(params.pid).then((response) => {
                setProduct(response.data);
                setFlag(params.no);
            });
        }
    }

    const setUserData = () => {
        getUserId().then((response) => {
            setUserId(response.data);
        }).catch(error => {
            console.error('Error getting user ID:', error);
            // Set fallback user ID
            setUserId('USER' + Date.now());
        });
    }

    const setTransactionId = () => {
        // FIX: Add fallback for transaction ID when API fails
        transactionIdGenerator().then((response) => {
            setNewId(response.data);
        }).catch(error => {
            console.error('Error generating transaction ID:', error);
            // Generate fallback ID
            const fallbackId = 'TXN' + Date.now();
            setNewId(fallbackId);
        });
    }

    const setVendorData = () => {
        getUserByRole('Vendor').then((response) => {
            setVendors(Array.isArray(response) ? response : []);
        }).catch(error => {
            console.error('Error fetching vendors:', error);
            setVendors([]);
        });
    }

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

    useEffect(() => {
        setProductData();
        setUserData();
        setTransactionId();
        setVendorData();
    }, []);

    const returnBack = () => {
        navigate('/orders');
    }

    const clearAll = () => {
        setQuantity(0.0);
    }

    const stockEdit = (e) => {
        e.preventDefault();
        const updatedTransaction = {
            ...transaction,
            transactionId: newId,
            productId: product.productId || product.product_id,
            quantity: parseFloat(quantity),
            userId: userId,
            transactionDate: tdate,
        };

        if (flag === "1") {
            updatedTransaction.transactionType = "IN";
            updatedTransaction.rate = product.purchasePrice || product.purchase_price;
        } else if (flag === "2") {
            updatedTransaction.transactionType = "OUT";
            updatedTransaction.rate = product.salesPrice || product.sales_price;
        }
        
        updatedTransaction.transactionValue = parseFloat(updatedTransaction.rate) * parseFloat(quantity);
        
        setTransValue(updatedTransaction.transactionValue);
        setTransaction(updatedTransaction);

        if (flag === "2") {
            let balance = product.stock - parseFloat(quantity);
            if (balance <= product.reorderLevel) {
                setWarns("Warning: Stock reached the reorder level!...");
            } else {
                setWarns(null);
            }
        }
        
        saveTransaction(updatedTransaction).then((response) => {
            console.log("Transaction saved:", response);
            // returnBack(); // Optional: navigate back after saving
        }).catch(error => {
            console.error("Error saving transaction:", error);
        });

        editProductStock(product, quantity, flag).then((response) => {
            console.log("Stock updated:", response);
            // Optionally clear form or show success message
            // clearAll();
        }).catch(error => {
            console.error("Error updating stock:", error);
        });
    }

    const handleValidation = (e) => {
        e.preventDefault();
        let tempErrors = {};
        let isValid = true;

        if (!quantity || quantity.toString().trim() === "") {
            tempErrors.quantity = "Transaction Quantity is required";
            isValid = false;
        } else if (parseFloat(quantity) <= 0) {
            tempErrors.quantity = "Transaction Quantity cannot be zero or negative";
            isValid = false;
        }

        if (flag === "2") {
            if (parseFloat(quantity) > parseFloat(product.stock)) {
                tempErrors.quantity = "Issued Quantity cannot be greater than available stock";
                isValid = false;
            }
        }
        setErrors(tempErrors);
        if (isValid) {
            stockEdit(e);
        }
    }

    return (
        <div className="app-page">
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-md-10">
                        <div className="card shadow-lg border-0">
                            <div className="card-header bg-gradient-primary text-white py-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h3 className="mb-0">
                                        <i className="fas fa-boxes me-2"></i>
                                        {parseInt(flag) === 1 ? (
                                            <span>Stock Purchase Entry</span>
                                        ) : (
                                            <span>Stock Issue Entry</span>
                                        )}
                                    </h3>
                                    <span className="badge bg-light text-dark">
                                        <i className="fas fa-tag me-1"></i>
                                        {product.productId || product.product_id}
                                    </span>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <div className="row g-0">
                                    <div className="col-md-6">
                                        <div className="p-4 border-end">
                                            <h5 className="mb-4 text-primary">
                                                <i className="fas fa-info-circle me-2"></i>
                                                Product Details
                                            </h5>
                                            <div className="table-responsive">
                                                <table className="table table-borderless table-sm">
                                                    <tbody>
                                                        <tr className="border-bottom">
                                                            <td className="text-muted fw-bold" width="40%">Product ID:</td>
                                                            <td className="fw-semibold">{product.productId || product.product_id}</td>
                                                        </tr>
                                                        <tr className="border-bottom">
                                                            <td className="text-muted fw-bold">SKU ID:</td>
                                                            <td className="fw-semibold">{product.skuId || product.sku_id}</td>
                                                        </tr>
                                                        <tr className="border-bottom">
                                                            <td className="text-muted fw-bold">Product Name:</td>
                                                            <td className="fw-semibold text-primary">{product.productName || product.product_name}</td>
                                                        </tr>
                                                        <tr className="border-bottom">
                                                            <td className="text-muted fw-bold">
                                                                {parseInt(flag) === 1 ? "Purchase Price:" : "Sales Price:"}
                                                            </td>
                                                            <td className="fw-bold text-success">
                                                                ₹{parseInt(flag) === 1 ? 
                                                                    (product.purchasePrice || product.purchase_price)?.toFixed(2) : 
                                                                    (product.salesPrice || product.sales_price)?.toFixed(2)
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr className="border-bottom">
                                                            <td className="text-muted fw-bold">Current Stock:</td>
                                                            <td>
                                                                <span className={`badge rounded-pill fs-6 ${
                                                                    parseFloat(product.stock) <= 0 ? 'bg-danger' : 
                                                                    parseFloat(product.stock) <= parseFloat(product.reorderLevel || product.reorder_level) ? 'bg-warning' : 'bg-success'
                                                                } text-white`}>
                                                                    <i className="fas fa-cubes me-1"></i>
                                                                    {product.stock}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        <tr className="border-bottom">
                                                            <td className="text-muted fw-bold">Reorder Level:</td>
                                                            <td>
                                                                <span className="badge bg-secondary text-white">
                                                                    {product.reorderLevel || product.reorder_level}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="text-muted fw-bold">Vendor:</td>
                                                            <td className="fw-semibold">
                                                                <span className="badge bg-info text-white">
                                                                    <i className="fas fa-user-tie me-1"></i>
                                                                    {getVendorName(product.vendorId || product.vendor_id)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-4 bg-light">
                                            <h5 className="mb-4 text-primary">
                                                <i className="fas fa-edit me-2"></i>
                                                Transaction Details
                                            </h5>
                                            <form onSubmit={handleValidation}>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold text-muted">
                                                        <i className="fas fa-hashtag me-1"></i>
                                                        Transaction ID
                                                    </label>
                                                    <input 
                                                        name="transactionId" 
                                                        className="form-control form-control-lg bg-light" 
                                                        value={newId} 
                                                        readOnly 
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold text-muted">
                                                        <i className="fas fa-calendar me-1"></i>
                                                        Transaction Date
                                                    </label>
                                                    <input 
                                                        type="date" 
                                                        className="form-control form-control-lg"
                                                        value={tdate} 
                                                        onChange={(event) => setTdate(event.target.value)} 
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="form-label fw-bold text-muted">
                                                        <i className="fas fa-sort-amount-up me-1"></i>
                                                        {parseInt(flag) === 1 ? (
                                                            <span>Purchase Quantity</span>
                                                        ) : (
                                                            <span>Issue Quantity</span>
                                                        )}
                                                    </label>
                                                    <div className="input-group input-group-lg">
                                                        <span className="input-group-text">
                                                            <i className="fas fa-boxes"></i>
                                                        </span>
                                                        <input 
                                                            type="number"
                                                            placeholder="Enter quantity" 
                                                            name="quantity" 
                                                            className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                                                            value={quantity} 
                                                            onChange={(event) => {
                                                                setQuantity(event.target.value);
                                                                if (errors.quantity) {
                                                                    setErrors({...errors, quantity: null});
                                                                }
                                                            }}
                                                            step="0.01"
                                                            min="0"
                                                        />
                                                    </div>
                                                    {errors.quantity && (
                                                        <div className="invalid-feedback d-block">
                                                            <i className="fas fa-exclamation-triangle me-1"></i>
                                                            {errors.quantity}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="d-grid gap-2">
                                                    <button type="submit" className="btn btn-success btn-lg">
                                                        <i className="fas fa-save me-2"></i>
                                                        Save Transaction
                                                    </button>
                                                    <div className="btn-group" role="group">
                                                        <button type="button" className="btn btn-outline-secondary" onClick={clearAll}>
                                                            <i className="fas fa-redo me-1"></i>
                                                            Reset
                                                        </button>
                                                        <button type="button" className="btn btn-outline-primary" onClick={returnBack}>
                                                            <i className="fas fa-arrow-left me-1"></i>
                                                            Return
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                            {transValue !== null && (
                                                <div className="alert alert-success mt-3 mb-0">
                                                    <div className="d-flex align-items-center">
                                                        <i className="fas fa-calculator me-2 fa-lg"></i>
                                                        <div>
                                                            <strong>Transaction Value:</strong>
                                                            <div className="fs-5">₹{transValue.toFixed(2)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {warns && (
                                                <div className="alert alert-warning mt-3 mb-0">
                                                    <div className="d-flex align-items-center">
                                                        <i className="fas fa-exclamation-triangle me-2 fa-lg"></i>
                                                        <div>
                                                            <strong>Warning:</strong>
                                                            <div>{warns}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductStockEdit;