import React from 'react';
import {useEffect, useState} from 'react';
import {useNavigate ,useParams} from 'react-router-dom';
import {findTransactionsByType} from '../../Services/TransactionService';
import {getRole} from '../../Services/LoginService';          


const TransactionReport = () => {
    const[transactions, setTransactions] = useState([]);
    let navigate = useNavigate();
    const param = useParams();
    const [flag , setFlag] = useState(false);
    const [role , setRole] = useState("");

    const setTransactionsData = () => {
        // Get transaction type from URL parameter or default based on current path
        let transactionType = param.type || param.pid;
        
        // If navigating from /in-transaction or /out-transaction, set appropriate type
        if (window.location.pathname.includes('/in-transaction')) {
            transactionType = 'IN';
        } else if (window.location.pathname.includes('/out-transaction')) {
            transactionType = 'OUT';
        } else if (window.location.pathname.includes('/trans-repo/IN')) {
            transactionType = 'IN';
        } else if (window.location.pathname.includes('/trans-repo/OUT')) {
            transactionType = 'OUT';
        }
        
        if (transactionType) {
            findTransactionsByType(transactionType)
                .then((response) => {
                    setTransactions(response.data);
                    setFlag(transactionType);
                })
                .catch(error => {
                    console.error("Error fetching transactions:", error);
                });
        }
    }

    useEffect(() => {
        getRole().then(response => {
            setRole(response.data);
        });
        setTransactionsData();
    }, [param.pid, param.type, window.location.pathname]); // Add window.location.pathname as dependency

    const returnBack = () => {
        // Check role and navigate to appropriate menu
        if(role === "Admin"){
            navigate('/AdminMenu');
        } else if(role === "Manager") {
            navigate('/ManagerMenu');
        } else if(role === "Vendor") {
            navigate('/VendorMenu');
        } else {
            // Fallback: try to get role again and navigate
            getRole().then(response => {
                const userRole = response.data;
                if(userRole === "Admin"){
                    navigate('/AdminMenu');
                } else if(userRole === "Manager") {
                    navigate('/ManagerMenu');
                } else if(userRole === "Vendor") {
                    navigate('/VendorMenu');
                } else {
                    // Final fallback - go to login
                    navigate('/');
                }
            }).catch(error => {
                console.error('Error getting role:', error);
                navigate('/');
            });
        }
    }

    return (
        <div>
            <h2 className="text-center">
                {flag === 'IN' ? 'IN Transaction Report' : 
                 flag === 'OUT' ? 'OUT Transaction Report' : 
                 'Transaction Report'}
            </h2>                     
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Transaction Id</th>
                        <th>Transaction Type</th>
                        <th>Product Id</th>
                        <th>Rate</th>
                        <th>Quantity</th>
                        <th>Transaction Value</th>
                        <th>User Id</th>
                        <th>Transaction Date</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.length > 0 ? (
                        transactions.map(transaction => (
                            <tr key={transaction.transactionId}>
                                <td>{transaction.transactionId}</td>
                                <td>{transaction.transactionType}</td>
                                <td>{transaction.productId}</td>
                                <td>{transaction.rate}</td>                                                                                             
                                <td>{transaction.quantity}</td>
                                <td>{transaction.transactionValue}</td>
                                <td>{transaction.userId}</td>
                                <td>{transaction.transactionDate}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center">No transactions found</td>
                        </tr>
                    )}
                </tbody>
            </table>                            
            <button className="btn btn-primary" onClick={returnBack}>Back to Menu</button>
        </div>
    );
}

export default TransactionReport;