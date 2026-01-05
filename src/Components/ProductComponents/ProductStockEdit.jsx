import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getProductById, editProductStock } from '../../Services/ProductService';
import { getUserId } from '../../Services/LoginService';
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
    const [tdate, setTdate] = useState(new Date());
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
    let params = useParams();
    let location = useLocation();  
    const [quantity, setQuantity] = useState(0.0);
    const [transValue, setTransValue] = useState(null);

    const setProductData = () => {
        if (location.state?.product) {
            setProduct(location.state.product);
            setFlag(params.no);
        } else {
            getProductById(params.id).then((response) => {
                setProduct(response.data);
                setFlag(params.no);
            });
        }
    }

    const setUserData = () => {
        getUserId().then((response) => {
            setUserId(response.data);
        });
    }

    const setTransactionId = () => {
        // FIX: Change this function call to use transactionIdGenerator
        transactionIdGenerator().then((response) => {
            setNewId(response.data);
        });
    }

    useEffect(() => {
        setProductData();
        setUserData();
        setTransactionId();
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
        <div>
            <div className="card col-md-6 offset-md-3">
                <div className="card-body" align="center">
                    <div className="col-md-12 text-center" style={{ textAlign: "center" }}>
                        {parseInt(flag) === 1 ? <h1 className="text-center">Stock Purchase Entry</h1> :
                            <h1 className="text-center">Stock Issue Entry</h1>}
                    </div>
                    <table className="table table-bordered">
                        <tbody>
                            <tr>
                                <td>Product Id:</td>
                                <td>{product.productId}</td>
                            </tr>
                            <tr>
                                <td>SKU Id:</td>
                                <td>{product.skuId}</td>
                            </tr>
                            <tr>
                                <td>Product Name:</td>
                                <td>{product.productName}</td>
                            </tr>
                            <tr>
                                <td>
                                    {parseInt(flag) === 1 ? "Purchase Price:" : "Sales Price:"}
                                </td>
                                <td>{parseInt(flag) === 1 ? product.purchasePrice : product.salesPrice}</td>
                            </tr>
                            <tr>
                                <td>Reorder Level:</td>
                                <td>{product.reorderLevel}</td>
                            </tr>
                            <tr>
                                <td>Stock:</td>
                                <td>{product.stock}</td>
                            </tr>
                            <tr>
                                <td>Vendor:</td>
                                <td>{product.vendorId}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="card col-md-6 offset-md-3">
                <div className="card-body" align="center">
                    <form onSubmit={handleValidation}>
                        <div className="row">
                            <div className="form-group mb-3">
                                <label>Transaction Id:</label>
                                <input 
                                    name="transactionId" 
                                    className="form-control" 
                                    value={newId} 
                                    readOnly 
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label>Select Transaction Date:</label>
                                <input 
                                    type="date" 
                                    placeholder="yyyy-mm-dd" 
                                    className="form-control"
                                    value={tdate} 
                                    onChange={(event) => setTdate(event.target.value)} 
                                />
                            </div>
                            <div className="form-group mb-3">
                                <b>
                                    {parseInt(flag) === 1 ? 
                                        <label>Enter Purchased Stock Quantity:</label> :
                                        <label>Enter Issued Stock Quantity:</label>}
                                </b>
                                <input 
                                    type="number"
                                    placeholder="Quantity" 
                                    name="quantity" 
                                    className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                                    value={quantity} 
                                    onChange={(event) => {
                                        setQuantity(event.target.value);
                                        // Clear error when user starts typing
                                        if (errors.quantity) {
                                            setErrors({...errors, quantity: null});
                                        }
                                    }}
                                    step="0.01"
                                    min="0"
                                />
                                {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
                            </div>
                            <div className="mb-3">
                                <button type="submit" className="btn btn-success">Save</button>
                                &nbsp;&nbsp;
                                <button type="button" className="btn btn-secondary" onClick={clearAll}>Reset</button>
                                &nbsp;&nbsp;
                                <button type="button" className="btn btn-success" onClick={returnBack}>Return</button>
                            </div>
                        </div>
                    </form>
                    {transValue !== null && (
                        <div style={{ textAlign: "center" }}>
                            <b>Transaction Value: ₹{transValue.toFixed(2)}</b>
                        </div>
                    )}
                    {warns && (
                        <div style={{ textAlign: "center", color: "red" }}>
                            <b>{warns}</b>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductStockEdit;