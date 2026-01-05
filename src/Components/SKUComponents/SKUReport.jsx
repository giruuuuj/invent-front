import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllskuIds, deleteSKUById } from '../../Services/SKUService';
import { getRole } from '../../Services/LoginService';
import '../../DisplayView.css';

const SKUReport = () => {
    let navigate = useNavigate();
    
    const [role, setRole] = useState("");
    const [skuList, setSkuList] = useState([]);
    const [filteredSkuList, setFilteredSkuList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch role and SKU data in parallel
                const [roleResponse, skuResponse] = await Promise.all([
                    getRole(),
                    getAllskuIds()
                ]);
                
                setRole(roleResponse.data);
                setSkuList(skuResponse.data);
                setFilteredSkuList(skuResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Failed to load SKU data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Filter SKUs based on search term
        const filtered = skuList.filter(sku => 
            sku.skuId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sku.skuDescription.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSkuList(filtered);
    }, [searchTerm, skuList]);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const returnBack = () => {
        const navigationMap = {
            'Admin': '/adminmenu',
            'Manager': '/ManagerMenu',
            'Vendor': '/VendorMenu'
        };
        navigate(navigationMap[role] || '/adminmenu');
    };
    
    const deleteSKU = (id) => {
        if (window.confirm('Are you sure you want to delete this SKU?')) {
            deleteSKUById(id).then(res => {
                let remainSkus = skuList.filter((sku) => (sku.skuId !== id));
                setSkuList(remainSkus);
                alert('SKU deleted successfully!');
            }).catch(error => {
                console.error('Error deleting SKU:', error);
                alert('Failed to delete SKU. Please try again.');
            });
        }
    };

    return (
        <div className="app-page">
            <div className="container-fluid">
                <div className="row justify-content-center">
                    <div className="col-md-12">
                        <div className="card app-card login-card">
                            <div className="card-header bg-primary text-white">
                                <h2 className="text-center login-title">
                                    <u>SKU Management</u>
                                </h2>
                                <p className="text-center mb-0">
                                    {role === 'Admin' ? 'Admin SKU Dashboard' : 'Manager SKU List'}
                                </p>
                            </div>
                            <div className="card-body p-4">
                                {isLoading ? (
                                    <div className="text-center">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Search Bar */}
                                        <div className="row mb-4">
                                            <div className="col-md-6">
                                                <div className="input-group">
                                                    <span className="input-group-text">
                                                        <i className="fas fa-search"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Search by SKU ID or Description..."
                                                        value={searchTerm}
                                                        onChange={handleSearch}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6 text-end">
                                                {role === 'Admin' && (
                                                    <Link to="/skuentry">
                                                        <button className="btn login-btn me-2">
                                                            <i className="fas fa-plus-circle me-2"></i>
                                                            Add New SKU
                                                        </button>
                                                    </Link>
                                                )}
                                                <button 
                                                    className="btn btn-register"
                                                    onClick={returnBack}
                                                >
                                                    <i className="fas fa-arrow-left me-2"></i>
                                                    Return to {role === 'Admin' ? 'Admin' : 'Manager'} Menu
                                                </button>
                                            </div>
                                        </div>

                                        {/* SKU Count */}
                                        <div className="row mb-3">
                                            <div className="col-md-12">
                                                <div className="alert alert-info">
                                                    <i className="fas fa-info-circle me-2"></i>
                                                    Total SKUs: <strong>{filteredSkuList.length}</strong>
                                                    {searchTerm && (
                                                        <span className="ms-2">
                                                            (Filtered from {skuList.length} total SKUs)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* SKU Table */}
                                        <div className="table-responsive">
                                            {filteredSkuList.length > 0 ? (
                                                <table className="product-table">
                                                    <thead>
                                                        <tr>
                                                            <th>No.</th>
                                                            <th>SKU ID</th>
                                                            <th>Description</th>
                                                            {role === 'Admin' && <th>Actions</th>}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredSkuList.map((sku, index) => (
                                                            <tr key={sku.skuId}>
                                                                <td>{index + 1}</td>
                                                                <td>
                                                                    <strong>{sku.skuId}</strong>
                                                                </td>
                                                                <td>{sku.skuDescription}</td>
                                                                {role === 'Admin' && (
                                                                    <td>
                                                                        <div className="btn-group">
                                                                            <Link to={`/update-sku/${sku.skuId}`}>
                                                                                <button className="btn btn-sm btn-warning">
                                                                                    <i className="fas fa-edit"></i> Update
                                                                                </button>
                                                                            </Link>
                                                                            <button 
                                                                                onClick={() => deleteSKU(sku.skuId)} 
                                                                                className="btn btn-sm btn-danger"
                                                                            >
                                                                                <i className="fas fa-trash"></i> Delete
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="text-center py-5">
                                                    <i className="fas fa-boxes fa-3x text-muted mb-3"></i>
                                                    <h5 className="text-muted">
                                                        {searchTerm ? 'No SKUs found matching your search' : 'No SKUs available'}
                                                    </h5>
                                                    {role === 'Admin' && !searchTerm && (
                                                        <Link to="/skuentry">
                                                            <button className="btn login-btn mt-3">
                                                                <i className="fas fa-plus-circle me-2"></i>
                                                                Add Your First SKU
                                                            </button>
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SKUReport;