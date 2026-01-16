import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductWiseTotalSale } from '../../Services/TransactionService';
import '../../DisplayView.css';
import { Pie } from 'react-chartjs-2';

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const ProductPieAnalysis = () => {
    let navigate = useNavigate();
    const [productSale, setProductSale] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to generate random colors for pie chart
    const generateColors = (count) => {
        const colors = [];
        const baseColors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
            '#9966FF', '#FF9F40', '#8AC926', '#1982C4',
            '#6A4C93', '#F15BB5', '#00BBF9', '#00F5D4'
        ];
        
        for (let i = 0; i < count; i++) {
            colors.push(baseColors[i % baseColors.length]);
        }
        return colors;
    };

    const setProductSaleData = () => {
        setLoading(true);
        getProductWiseTotalSale().then((response) => {
            setProductSale(response.data || []);
            setError(null);
        }).catch(error => {
            console.error("Error occurred while fetching data:", error);
            setError("Failed to load product sales data");
            setProductSale([]);
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        setProductSaleData();
    }, []);

    // Prepare chart data
    const chartData = {
        labels: productSale.map((p) => p.productName || 'Unnamed Product'),
        datasets: [
            {
                data: productSale.map((p) => p.totalSaleValue || 0),
                backgroundColor: generateColors(productSale.length),
                borderColor: '#fff',
                borderWidth: 2,
                hoverOffset: 15
            }
        ]
    };

    // Chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    font: {
                        size: 12
                    },
                    padding: 20,
                    usePointStyle: true,
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                    }
                }
            }
        }
    };

    const returnBack = () => {
        navigate('/AdminMenu');
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                    <button className="btn btn-secondary ms-3" onClick={returnBack}>
                        Back to Menu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="card shadow">
                <div className="card-header bg-primary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">Product Sales Analysis</h3>
                        <button 
                            className="btn btn-light btn-sm"
                            onClick={returnBack}
                        >
                            <i className="bi bi-arrow-left"></i> Back to Menu
                        </button>
                    </div>
                </div>
                
                <div className="card-body">
                    {productSale.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-muted">No sales data available</p>
                            <button className="btn btn-primary mt-2" onClick={returnBack}>
                                Back to Menu
                            </button>
                        </div>
                    ) : (
                        <div className="row">
                            <div className="col-md-8">
                                <div style={{ height: '500px' }}>
                                    <Pie data={chartData} options={chartOptions} />
                                </div>
                            </div>
                            
                            <div className="col-md-4">
                                <div className="table-responsive">
                                    <table className="table table-hover table-striped">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>Product Name</th>
                                                <th className="text-end">Total Sales ($)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productSale.map((product, index) => (
                                                <tr key={index}>
                                                    <td>{product.productName || 'N/A'}</td>
                                                    <td className="text-end">
                                                        ${(product.totalSaleValue || 0).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="table-info">
                                                <td><strong>Total</strong></td>
                                                <td className="text-end">
                                                    <strong>
                                                        ${productSale
                                                            .reduce((sum, product) => sum + (product.totalSaleValue || 0), 0)
                                                            .toFixed(2)}
                                                    </strong>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-4">
                            <h5>Summary</h5>
                            <div className="row">
                                <div className="col-md-3">
                                    <div className="card bg-light">
                                        <div className="card-body text-center">
                                            <h6 className="card-subtitle mb-2 text-muted">Total Products</h6>
                                            <h4 className="card-title text-primary">{productSale.length}</h4>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card bg-light">
                                        <div className="card-body text-center">
                                            <h6 className="card-subtitle mb-2 text-muted">Highest Sale</h6>
                                            <h4 className="card-title text-success">
                                                ${Math.max(...productSale.map(p => p.totalSaleValue || 0)).toFixed(2)}
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card bg-light">
                                        <div className="card-body text-center">
                                            <h6 className="card-subtitle mb-2 text-muted">Lowest Sale</h6>
                                            <h4 className="card-title text-danger">
                                                ${Math.min(...productSale.map(p => p.totalSaleValue || 0)).toFixed(2)}
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card bg-light">
                                        <div className="card-body text-center">
                                            <h6 className="card-subtitle mb-2 text-muted">Average Sale</h6>
                                            <h4 className="card-title text-warning">
                                                ${(productSale.reduce((sum, p) => sum + (p.totalSaleValue || 0), 0) / productSale.length || 1).toFixed(2)}
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="card-footer text-muted text-center">
                    <small>Data as of {new Date().toLocaleDateString()}</small>
                </div>
            </div>
        </div>
    );
};

export default ProductPieAnalysis;