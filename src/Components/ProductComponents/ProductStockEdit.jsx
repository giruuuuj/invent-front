import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getUserId, getUserByRole } from '../../Services/LoginService';
import { transactionIdGenerator, saveTransaction, editProductStock, getProductById } from '../../Services/TransactionService';

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

    const [newId, setNewId] = useState(100001);
    const [userId, setUserId] = useState('');
    const [flag, setFlag] = useState("");
    const [errors, setErrors] = useState({});
    const [warns, setWarns] = useState(null);
    const [tdate, setTdate] = useState(new Date().toISOString().split('T')[0]);
    const [transaction, setTransaction] = useState({
        transactionId: 100001,
        transactionType: "",
        productId: "",
        rate: 0.0,
        quantity: 0.0,
        transactionValue: 0.0,
        userId: "",
        transactionDate: new Date(),
    });

    const [transValue, setTransValue] = useState(null);
    const [lastTransactionId, setLastTransactionId] = useState(100000);
    const [quantity, setQuantity] = useState(0.0);
    const [vendors, setVendors] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(true);

    let navigate = useNavigate();
    let params = useParams();
    let location = useLocation();

    const setProductData = async () => {
        try {
            if (location.state?.product) {
                setProduct(location.state.product);
                setFlag(params.no);
            } else if (params.pid) {
                const response = await getProductById(params.pid);
                setProduct(response.data);
                setFlag(params.no);
            } else {
                setSaveMessage({ type: 'error', text: 'No product ID provided' });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            setSaveMessage({ type: 'error', text: 'Failed to load product data' });
        } finally {
            setIsLoading(false);
        }
    }

    const setUserData = async () => {
        try {
            const response = await getUserId();
            setUserId(response.data);
        } catch (error) {
            console.error('Error getting user ID:', error);
            // Set fallback user ID
            setUserId('USER' + Date.now());
        }
    }

    const setTransactionId = async () => {
        try {
            const response = await transactionIdGenerator();
            const generatedId = response.data;
            if (typeof generatedId === 'number') {
                const nextId = generatedId >= 100001 ? generatedId : lastTransactionId + 1;
                setNewId(nextId);
                setLastTransactionId(nextId);
            } else {
                setNewId(generatedId);
            }
        } catch (error) {
            console.error('Error generating transaction ID:', error);
            // Generate sequential ID starting from 100001
            const nextId = lastTransactionId + 1;
            setNewId(nextId);
            setLastTransactionId(nextId);
        }
    }

    const setVendorData = async () => {
        try {
            const response = await getUserByRole('Vendor');
            console.log('Vendor data fetched:', response);
            setVendors(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Error fetching vendors:', error);
            setVendors([]);
        }
    }

    const getVendorName = (vendorId) => {
        if (!vendorId && vendorId !== 0) return 'Unknown Vendor';
        
        try {
            const searchId = typeof vendorId === 'string' ? parseInt(vendorId) : vendorId;
            
            // Try to find vendor in vendors list
            const vendor = vendors.find(v => {
                const vid = typeof v.id === 'string' ? parseInt(v.id) : v.id;
                return vid === searchId;
            });
            
            if (vendor) {
                return vendor.fullName || vendor.name || vendor.username || 
                       vendor.displayName || vendor.email || `Vendor ${searchId}`;
            }
            
            return `Vendor ${searchId}`;
        } catch (error) {
            console.error('Error getting vendor name:', error);
            return `Vendor ${vendorId}`;
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            setIsLoading(true);
            await Promise.all([
                setProductData(),
                setUserData(),
                setTransactionId(),
                setVendorData()
            ]);
            setIsLoading(false);
        };
        
        initializeData();
    }, [params.pid, params.no, location.state]);

    const returnBack = () => {
        navigate('/orders');
    }

    const clearAll = () => {
        setQuantity(0.0);
        setTransValue(null);
        setWarns(null);
        setErrors({});
        setSaveMessage({ type: '', text: '' });
    }

    const stockEdit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveMessage({ type: '', text: '' });

        try {
            // Get product ID - handle both naming conventions
            const productId = product.productId || product.product_id;
            const productName = product.productName || product.product_name;
            const skuId = product.skuId || product.sku_id;
            const vendorId = product.vendorId || product.vendor_id;
            
            // Calculate rate based on transaction type
            const rate = flag === "1" 
                ? parseFloat(product.purchasePrice || product.purchase_price || 0)
                : parseFloat(product.salesPrice || product.sales_price || 0);
            
            const transactionValue = rate * parseFloat(quantity);
            
            // Prepare transaction data for backend - ensure all fields are properly set
            const transactionData = {
                transactionId: parseInt(newId),
                transactionType: flag === "1" ? "IN" : "OUT",
                productId: String(productId),
                rate: parseFloat(rate.toFixed(2)),
                quantity: parseFloat(quantity),
                transactionValue: parseFloat(transactionValue.toFixed(2)),
                userId: String(vendorId || userId || 'default-user-id'), // Use vendor ID first
                transactionDate: tdate + 'T00:00:00'
            };

            console.log("📤 Sending Transaction Data:", transactionData);
            
            // Save transaction
            const transactionResponse = await saveTransaction(transactionData);
            console.log("✅ Transaction saved:", transactionResponse.data);
            
            // Prepare stock update data
            const stockUpdateData = {
                product: product,
                qty: parseFloat(quantity),
                flag: flag === "1" ? true : false
            };

            console.log("📤 Updating stock for product:", productId, "with data:", stockUpdateData);
            
            // Update product stock
            const stockResponse = await editProductStock(productId, stockUpdateData);
            console.log("✅ Stock updated:", stockResponse.data);

            // Update transaction value display
            setTransValue(transactionValue);
            setTransaction(transactionData);

            // Show success message
            setSaveMessage({ 
                type: 'success', 
                text: `Stock ${flag === "1" ? "purchase" : "issue"} saved successfully! 
                       Transaction ID: ${newId}, Value: ₹${transactionValue.toFixed(2)}` 
            });

            // Check reorder level warning for stock OUT
            if (flag === "2") {
                const newStock = parseFloat(product.stock) - parseFloat(quantity);
                if (newStock <= parseFloat(product.reorderLevel || product.reorder_level)) {
                    setWarns(`Warning: Stock reached reorder level! New stock: ${newStock}`);
                }
            }

            // Clear form and generate new ID after 2 seconds
            setTimeout(() => {
                clearAll();
                const nextId = parseInt(newId) + 1;
                setNewId(nextId);
            }, 2000);

        } catch (error) {
            console.error("❌ Error saving data:", error);
            
            let errorMessage = 'Failed to save transaction. Please try again.';
            
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Response data:", error.response.data);
                
                if (error.response.data) {
                    if (typeof error.response.data === 'string') {
                        errorMessage = error.response.data;
                    } else if (error.response.data.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.response.data.error) {
                        errorMessage = error.response.data.error;
                    }
                }
            } else if (error.request) {
                console.error("No response received. Is backend running?");
                errorMessage = 'Cannot connect to server. Please check if backend is running.';
            } else {
                console.error("Error message:", error.message);
            }
            
            setSaveMessage({ 
                type: 'error', 
                text: errorMessage 
            });
        } finally {
            setIsSaving(false);
        }
    }

    const handleValidation = (e) => {
        e.preventDefault();
        let tempErrors = {};
        let isValid = true;

        // Validate quantity
        if (!quantity || quantity.toString().trim() === "") {
            tempErrors.quantity = "Transaction Quantity is required";
            isValid = false;
        } else if (isNaN(parseFloat(quantity))) {
            tempErrors.quantity = "Quantity must be a valid number";
            isValid = false;
        } else if (parseFloat(quantity) <= 0) {
            tempErrors.quantity = "Transaction Quantity must be greater than zero";
            isValid = false;
        }

        // Validate for stock issue (OUT)
        if (flag === "2") {
            const currentStock = parseFloat(product.stock) || 0;
            const issueQuantity = parseFloat(quantity) || 0;
            
            if (issueQuantity > currentStock) {
                tempErrors.quantity = `Issued Quantity (${issueQuantity}) cannot be greater than available stock (${currentStock})`;
                isValid = false;
            }
        }

        // Validate date
        if (!tdate) {
            tempErrors.date = "Transaction date is required";
            isValid = false;
        } else {
            const selectedDate = new Date(tdate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate > today) {
                tempErrors.date = "Transaction date cannot be in the future";
                isValid = false;
            }
        }

        setErrors(tempErrors);
        
        if (isValid) {
            stockEdit(e);
        }
    }

    if (isLoading) {
        return (
            <div className="app-page">
                <div className="container mt-5">
                    <div className="row justify-content-center">
                        <div className="col-md-10">
                            <div className="card shadow-lg">
                                <div className="card-body text-center py-5">
                                    <div className="spinner-border text-primary mb-3" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <h4 className="text-primary">Loading product data...</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                                                                ₹{(flag === "1" 
                                                                    ? (product.purchasePrice || product.purchase_price || 0)
                                                                    : (product.salesPrice || product.sales_price || 0)
                                                                ).toFixed(2)}
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
                                                                    {parseFloat(product.stock || 0).toFixed(2)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        <tr className="border-bottom">
                                                            <td className="text-muted fw-bold">Reorder Level:</td>
                                                            <td>
                                                                <span className="badge bg-secondary text-white">
                                                                    {parseFloat(product.reorderLevel || product.reorder_level || 0).toFixed(2)}
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
                                                        className={`form-control form-control-lg ${errors.date ? 'is-invalid' : ''}`}
                                                        value={tdate} 
                                                        onChange={(event) => {
                                                            setTdate(event.target.value);
                                                            if (errors.date) {
                                                                setErrors({...errors, date: null});
                                                            }
                                                        }}
                                                        max={new Date().toISOString().split('T')[0]}
                                                    />
                                                    {errors.date && (
                                                        <div className="invalid-feedback d-block">
                                                            <i className="fas fa-exclamation-triangle me-1"></i>
                                                            {errors.date}
                                                        </div>
                                                    )}
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
                                                            min="0.01"
                                                            disabled={isSaving}
                                                        />
                                                    </div>
                                                    {errors.quantity && (
                                                        <div className="invalid-feedback d-block">
                                                            <i className="fas fa-exclamation-triangle me-1"></i>
                                                            {errors.quantity}
                                                        </div>
                                                    )}
                                                    <small className="text-muted">
                                                        Enter quantity in units. Current stock: {parseFloat(product.stock || 0).toFixed(2)}
                                                    </small>
                                                </div>
                                                
                                                {saveMessage.text && (
                                                    <div className={`alert alert-${saveMessage.type} mb-3`}>
                                                        <i className={`fas fa-${saveMessage.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
                                                        {saveMessage.text}
                                                    </div>
                                                )}

                                                <div className="d-grid gap-2">
                                                    <button 
                                                        type="submit" 
                                                        className="btn btn-success btn-lg"
                                                        disabled={isSaving || isLoading}
                                                    >
                                                        {isSaving ? (
                                                            <>
                                                                <i className="fas fa-spinner fa-spin me-2"></i>
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-save me-2"></i>
                                                                Save Transaction
                                                            </>
                                                        )}
                                                    </button>
                                                    <div className="btn-group" role="group">
                                                        <button 
                                                            type="button" 
                                                            className="btn btn-outline-secondary" 
                                                            onClick={clearAll}
                                                            disabled={isSaving}
                                                        >
                                                            <i className="fas fa-redo me-1"></i>
                                                            Reset
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            className="btn btn-outline-primary" 
                                                            onClick={returnBack}
                                                            disabled={isSaving}
                                                        >
                                                            <i className="fas fa-arrow-left me-1"></i>
                                                            Return to Orders
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