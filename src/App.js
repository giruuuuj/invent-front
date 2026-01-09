import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from './Components/LoginComponents/LoginPage';
import RegisterUser from './Components/LoginComponents/RegisterUser';
import AdminMenu from './Components/LoginComponents/AdminMenu';
import ManagerMenu from './Components/LoginComponents/ManagerMenu';
import VendorMenu from './Components/LoginComponents/VendorMenu';

import UserManagement from './Components/LoginComponents/UserManagement';
import SKUEntry from './Components/SKUComponents/SKUEntry'; 
import SKUReport from './Components/SKUComponents/SKUReport';
import SKUEdit from './Components/SKUComponents/SKUEdit';
import ProductEntry from './Components/ProductComponents/ProductEntry';
import ProductReport from './Components/ProductComponents/ProductReport';
import ProductPriceEdit from './Components/ProductComponents/ProductPriceEdit';
import ProductStockEdit from './Components/ProductComponents/ProductStockEdit';
import TransactionReport from './Components/ProductComponents/TransactionReport';

import Dummy from './Components/ProductComponents/Dummy';
import ThemeToggle from './Components/Common/ThemeToggle';

// Check this path
import './App.css';


function App() {
    return (
        <div className='App'>
            <BrowserRouter>
                <div className="app-global-toggle">
                    <ThemeToggle />
                </div>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterUser />} />
                    <Route path="/AdminMenu" element={<AdminMenu />} />
                    <Route path="/ManagerMenu" element={<ManagerMenu />} />
                    <Route path="/VendorMenu" element={<VendorMenu />} />
                    <Route path="/sku-add" element={<SKUEntry />} />
                    <Route path="/skuentry" element={<SKUEntry />} />
                    <Route path="/skureport" element={<SKUReport />} />
                    <Route path="/sku-list" element={<SKUReport />} />
                    <Route path="/update-sku/:skuno" element={<SKUEdit />} />
                    <Route path="/product-entry" element={<ProductEntry />} />
                    <Route path="/product-price-edit/:id" element={<ProductPriceEdit />} />
                    <Route path="/edit-stock/:pid/:no" element={<ProductStockEdit />} />
                    <Route path="/edit-price/:pid" element={<ProductPriceEdit />} />

                    <Route path="/product-report" element={<ProductReport />} />
                    <Route path="/product-list" element={<ProductReport />} />
                    
                    
                
                    <Route path="/in-transaction" element={<TransactionReport />} />
                    <Route path="/out-transaction" element={<TransactionReport />} />
                    <Route path="/transaction-report/:type" element={<TransactionReport />} />
                    <Route path="/trans-repo/IN" element={<TransactionReport />} />
                    <Route path="/trans-repo/OUT" element={<TransactionReport />} />
                
                    <Route path="/usermanagement" element={<UserManagement />} />
                    <Route path="/adminmenu" element={<AdminMenu />} />
                    <Route path='/dummy' element={<Dummy />} />


                </Routes>
            </BrowserRouter>
        </div>
    );
}


export default App; 