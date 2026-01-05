import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, editProductStock  } from '../../Services/ProductService';
import { transactionIdGenerator, saveTransaction } from '../../Services/TransactionService';
import { getUserId } from '../../Services/LoginService'; // Import getUserId

const ProductStockEdit = () => {
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

    const [newId, setNewId] = useState(0);
    const [errors, setErrors] = useState({});
    const [flag, setFlag] = useState("");
    const [userId, setUserId] = useState("");
    const [tdate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    
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
    
    let navigate = useNavigate();
    let param = useParams();
    let [quantity, setQuantity] = useState(0.0);
    const [transValue, setTransValue] = useState(null);
    const [warns, setWarns] = useState(null);

    const setProductData = () => {
        getProductById(param.id).then((response) => {
            setProduct(response.data);
            setFlag(param.no);
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

    const setTransactionId = () => {
        transactionIdGenerator().then((response) => {
            setNewId(response.data);
        }).catch(error => {
            console.error("Error generating transaction ID:", error);
            // Generate a local ID if API fails
            setNewId(Date.now());
        });
    };

    useEffect(() => {
        setProductData();
        setUserData();
        setTransactionId();
    }, [param.id, param.no]);

    const returnBack = () => {
        navigate('/Products-list');
    };

    const stockEdit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccess("");

        try {
            const updatedTransaction = {
                ...transaction,
                transactionId: newId,
                productId: product.productId,
                quantity: parseFloat(quantity),
                userId: userId,
                transactionDate: tdate,
            };

            if (flag === "1") {
                updatedTransaction.transactionType = "IN";
                updatedTransaction.rate = product.purchasePrice;
            } else if (flag === "2") {
                updatedTransaction.transactionType = "OUT";
                updatedTransaction.rate = product.salesPrice;
            }
            
            updatedTransaction.transactionValue = 
                parseFloat(updatedTransaction.rate) * parseFloat(updatedTransaction.quantity);
            
            setTransValue(updatedTransaction.transactionValue);
            setTransaction(updatedTransaction);

            if (flag === "2") {
                let balance = product.stock - parseFloat(quantity);
                if (balance < product.reorderLevel) {
                    setWarns("Warning: Stock below Reorder Level!");
                } else {
                    setWarns(null);
                }
            }

            // Save transaction
            await saveTransaction(updatedTransaction);
            console.log("Transaction saved");

            // Update product stock
            await editProductStock(product, quantity, flag);
            console.log("Product stock updated");

            setSuccess("Stock updated successfully!");
            setTimeout(() => {
                returnBack();
            }, 1500);

        } catch (error) {
            console.error("Error updating stock:", error);
            setErrors({ submit: "Failed to update stock. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const handleValidation = (event) => {
        event.preventDefault();
        let tempErrors = {};
        let isValid = true;

        // Fixed: Proper string validation
        if (!quantity || quantity.toString().trim() === "") {
            tempErrors.quantity = "Quantity is required";
            isValid = false;
        } else if (parseFloat(quantity) <= 0) {
            tempErrors.quantity = "Quantity must be greater than zero";
            isValid = false;
        } else if (flag === "2") {
            if (parseFloat(quantity) > parseFloat(product.stock)) {
                tempErrors.quantity = "Quantity exceeds available stock";
                isValid = false;
            }
        }
        
        setErrors(tempErrors);
        if (isValid) {
            stockEdit(event);
        }
    };

    return (
        <div className="container mt-4">    
            <h2>Product Stock Edit</h2>
            
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
                <div className="mb-3">
                    <label className="form-label">Product ID</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        value={product.productId} 
                        readOnly 
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Product Name</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        value={product.productName} 
                        readOnly 
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Current Stock</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        value={product.stock} 
                        readOnly 
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">
                        {flag === "1" ? "Quantity to Add" : 
                         flag === "2" ? "Quantity to Remove" : 
                         "Quantity"}
                    </label>
                    <input 
                        type="number" 
                        className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)} 
                        step="0.01"
                        min="0"
                        disabled={loading}
                    />
                    {errors.quantity && (
                        <div className="invalid-feedback">{errors.quantity}</div>
                    )}
                </div>
                {transValue !== null && (
                    <div className="mb-3">
                        <label className="form-label">Transaction Value</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={transValue.toFixed(2)} 
                            readOnly 
                        />
                    </div>
                )}
                {warns && (
                    <div className="mb-3 alert alert-warning">
                        {warns}
                    </div>
                )}
                <button 
                    type="submit" 
                    className="btn btn-primary me-2"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing...
                        </>
                    ) : "Submit"}
                </button>
                <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={returnBack}
                    disabled={loading}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default ProductStockEdit;