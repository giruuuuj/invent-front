import React from 'react';
import {useEffect, useState} from 'react';
import {useNavigate ,useParams} from 'react-router-dom';
import {findTransactionsByType} from '../../Services/TransactionService';
import {getRole, getUserByRole} from '../../Services/LoginService';          


const TransactionReport = () => {
    const[transactions, setTransactions] = useState([]);
    const[filteredTransactions, setFilteredTransactions] = useState([]);
    const[loading, setLoading] = useState(false);
    const[error, setError] = useState(null);
    const[vendors, setVendors] = useState([]);
    let navigate = useNavigate();
    const param = useParams();
    const [flag , setFlag] = useState(false);
    const [role , setRole] = useState("");

    // Filter states
    const [vendorFilter, setVendorFilter] = useState('');
    const [rateFilter, setRateFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

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

    const getVendorName = (userId) => {
        if (!userId && userId !== 0) return 'Unknown User';
        
        console.log('Looking for vendor with userId:', userId, 'type:', typeof userId);
        console.log('Available vendors:', vendors);
        
        try {
            // Try multiple matching strategies
            let vendor = null;
            
            // 1. Try exact string match (for usernames like 'java', 'rohit')
            vendor = vendors.find(v => 
                v.username === userId || 
                v.fullName === userId || 
                v.name === userId ||
                v.email === userId
            );
            
            if (vendor) {
                console.log('Found vendor by string match:', vendor);
                const name = vendor.fullName || vendor.name || vendor.username || 
                           vendor.displayName || vendor.email;
                return name;
            }
            
            // 2. Try numeric ID match
            const searchId = typeof userId === 'string' ? parseInt(userId) : userId;
            if (!isNaN(searchId)) {
                vendor = vendors.find(v => {
                    const vid = typeof v.id === 'string' ? parseInt(v.id) : v.id;
                    return vid === searchId;
                });
                
                if (vendor) {
                    console.log('Found vendor by ID match:', vendor);
                    const name = vendor.fullName || vendor.name || vendor.username || 
                               vendor.displayName || vendor.email;
                    return name;
                }
            }
            
            // 3. Try index-based match (if userId is 1, try vendors[0])
            const vendorIndex = parseInt(userId) - 1;
            if (!isNaN(vendorIndex) && vendorIndex >= 0 && vendors[vendorIndex]) {
                const indexedVendor = vendors[vendorIndex];
                console.log('Found vendor by index:', indexedVendor);
                const name = indexedVendor.fullName || indexedVendor.name || indexedVendor.username;
                return name || `Vendor ${userId}`;
            }
            
            console.log('No vendor found for userId:', userId);
            return `Vendor ${userId}`;
        } catch (error) {
            console.error('Error getting vendor name:', error);
            return `Vendor ${userId}`;
        }
    };

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
            setLoading(true);
            setError(null);
            findTransactionsByType(transactionType)
                .then((response) => {
                    console.log('Transactions fetched:', response.data);
                    setTransactions(response.data);
                    setFlag(transactionType);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching transactions:", error);
                    setError("Failed to fetch transactions. Please try again.");
                    setTransactions([]);
                    setLoading(false);
                });
        }
    }

    const filterTransactions = () => {
        let filtered = transactions;
        
        // Filter by vendor
        if (vendorFilter) {
            filtered = filtered.filter(transaction => {
                const vendorName = getVendorName(transaction.userId);
                return vendorName && vendorName.toLowerCase().includes(vendorFilter.toLowerCase());
            });
        }
        
        // Filter by rate
        if (rateFilter) {
            filtered = filtered.filter(transaction => 
                transaction.rate && transaction.rate.toString().includes(rateFilter)
            );
        }
        
        // Filter by date
        if (dateFilter) {
            const filterDate = new Date(dateFilter).toDateString();
            filtered = filtered.filter(transaction => {
                const transactionDate = new Date(transaction.transactionDate).toDateString();
                return transactionDate === filterDate;
            });
        }
        
        setFilteredTransactions(filtered);
    };

    useEffect(() => {
        filterTransactions();
    }, [transactions, vendorFilter, rateFilter, dateFilter]);

    useEffect(() => {
        getRole().then(response => {
            setRole(response.data);
        });
        setVendorData();
        setTransactionsData();
    }, [param.pid, param.type, window.location.pathname]); // Add window.location.pathname as dependency

    const downloadExcel = () => {
        // Create CSV content (Excel-compatible)
        const headers = ['Transaction ID', 'Product ID', 'Rate', 'Quantity', 'Transaction Value', 'User ID', 'Transaction Date'];
        const csvContent = [
            headers.join(','),
            ...filteredTransactions.map(transaction => {
                const transactionDate = new Date(transaction.transactionDate);
                // Format date as Excel-friendly: YYYY-MM-DD HH:MM:SS
                const formattedDate = transactionDate.toISOString().slice(0, 19).replace('T', ' ');
                
                return [
                    transaction.transactionId,
                    transaction.productId,
                    transaction.rate,
                    transaction.quantity,
                    transaction.transactionValue,
                    `"${getVendorName(transaction.userId)}"`, // Wrap in quotes to handle commas in names
                    formattedDate
                ].join(',');
            })
        ].join('\n');

        // Add BOM for proper UTF-8 encoding in Excel
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;

        // Create blob and download
        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `transaction_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
            <div className="d-flex justify-content-between align-items-center mb-4 position-sticky top-0 bg-white z-1" style={{paddingTop: '1rem', paddingBottom: '1rem'}}>
                <h2 className="text-center mb-0">
                    {flag === 'IN' ? 'IN Transaction Report' : 
                     flag === 'OUT' ? 'OUT Transaction Report' : 
                     'Transaction Report'}
                </h2>
                <button className="btn btn-primary" onClick={returnBack}>Back to Menu</button>
            </div>
            
            {loading && (
                <div className="text-center my-3">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
            
            {error && (
                <div className="alert alert-danger my-3">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}
            
            {/* Filter Section */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Filter Transactions</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <label htmlFor="vendorFilter" className="form-label">Vendor Name</label>
                            <select
                                className="form-control"
                                id="vendorFilter"
                                value={vendorFilter}
                                onChange={(e) => setVendorFilter(e.target.value)}
                            >
                                <option value="">All Vendors</option>
                                {vendors.map(vendor => (
                                    <option key={vendor.id || vendor.username} value={vendor.fullName || vendor.name || vendor.username}>
                                        {vendor.fullName || vendor.name || vendor.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4 mb-3">
                            <label htmlFor="rateFilter" className="form-label">Rate</label>
                            <input
                                type="text"
                                className="form-control"
                                id="rateFilter"
                                placeholder="Enter Rate"
                                value={rateFilter}
                                onChange={(e) => setRateFilter(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label htmlFor="dateFilter" className="form-label">Date</label>
                            <input
                                type="date"
                                className="form-control"
                                id="dateFilter"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <button 
                                className="btn btn-secondary btn-sm me-2" 
                                onClick={() => {
                                    setVendorFilter('');
                                    setRateFilter('');
                                    setDateFilter('');
                                }}
                            >
                                Clear Filters
                            </button>
                            <button 
                                className="btn btn-success btn-sm me-2" 
                                onClick={downloadExcel}
                                disabled={filteredTransactions.length === 0}
                            >
                                Download Excel
                            </button>
                            <span className="text-muted">
                                Showing {filteredTransactions.length} of {transactions.length} transactions
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="table-responsive" style={{maxHeight: '60vh', overflowY: 'auto'}}>
                <table className="table table-striped table-hover">
                    <thead className="sticky-top bg-light">
                        <tr>
                            <th>Transaction ID</th>
                            <th>Product ID</th>
                            <th>Rate</th>
                            <th>Quantity</th>
                            <th>Transaction Value</th>
                            <th>User ID</th>
                            <th>Transaction Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map(transaction => (
                                <tr key={transaction.transactionId}>
                                    <td>{transaction.transactionId}</td>
                                    <td>{transaction.productId}</td>
                                    <td>{transaction.rate}</td>
                                    <td>{transaction.quantity}</td>
                                    <td>{transaction.transactionValue}</td>
                                    <td>{getVendorName(transaction.userId)}</td>
                                    <td>{new Date(transaction.transactionDate).toLocaleDateString('en-GB')}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">
                                    {transactions.length === 0 ? 'No transactions found' : 'No transactions match the filters'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-3">
                <button className="btn btn-primary" onClick={returnBack}>Back to Menu</button>
            </div>
        </div>
    )
}

export default TransactionReport;