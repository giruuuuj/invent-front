import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerNewUser } from '../../Services/LoginService';

import '../../DisplayView.css';
import '../../Desgin/Register.css';

const RegisterUser = () => {
    let navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [inventoryUser, setInventoryUser] = useState({
        username: "",
        password: "",
        personalName: "",
        email: "",
        role: "",
    });
    const [confirmPassword, setConfirmPassword] = useState("");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const createNewUser = (event) => {
        event.preventDefault();
        if (inventoryUser.password === confirmPassword) {
            registerNewUser(inventoryUser).then((response) => {
                alert("User is registered successfully...Go For Login");
                navigate('/');
            }).catch((error) => {
                console.error("Registration failed:", error);
                alert("Registration failed: " + (error.response?.data?.message || error.message));
            });
        }
    };

    // FIXED: Changed function name to match what you're using in JSX
    const onChangeHandler = (event) => {
        event.persist();
        const name = event.target.name;
        const value = event.target.value;
        setInventoryUser(values => ({ ...values, [name]: value }));
    };

    const handleValidation = (event) => {
        event.preventDefault();
        let tempErrors = {};
        let isValid = true;

        if (!inventoryUser.username.trim()) {
            tempErrors.username = "User Name is required";
            isValid = false;
        }

        if (!inventoryUser.password.trim()) {
            tempErrors.password = "Password is required";
            isValid = false;
        }
        // FIXED: Corrected the typo - passwordlength to password.length
        else if (inventoryUser.password.length < 5 || inventoryUser.password.length > 10) {
            tempErrors.password = "Password must be 5-10 characters long";
            isValid = false;
        }

        if (!inventoryUser.personalName.trim()) {
            tempErrors.personalName = "Personal Name is required";
            isValid = false;
        }

        if (!inventoryUser.email.trim()) {
            tempErrors.email = "Email is required";
            isValid = false;
        }
        else if (!emailPattern.test(inventoryUser.email)) {
            tempErrors.email = "Invalid Email Format";
            isValid = false;
        }

        if (!inventoryUser.role.trim()) {
            tempErrors.role = "Role is required";
            isValid = false;
        }

        if (!confirmPassword.trim()) {
            tempErrors.confirmPassword = "Confirm Password is required";
            isValid = false;
        }

        // FIXED: Moved password match validation to the correct place
        if (inventoryUser.password !== confirmPassword) {
            tempErrors.confirmPassword = "Both the passwords are not matched";
            isValid = false;
        }

        setErrors(tempErrors);
        if (isValid) {
            createNewUser(event);
        }
    };

    return (
        <div className="app-page register-page">
            <div className="container">
                <div className="row justify-content-center align-items-center min-vh-100">
                    <div className="col-lg-8 col-md-10">
                        <div className="card register-card">
                            <div className="row g-0">
                                {/* Left side - Form */}
                                <div className="col-md-6 d-flex align-items-center">
                                    <div className="card-body p-4 p-lg-5">
                                        <div className="text-center mb-4">
                                            <h2 className="register-title">Create Account</h2>
                                            <p className="text-muted">Fill in your details to register</p>
                                        </div>
                                        <form method="post">
                                            <div className="form-group">
                                                <label>User Name: </label>
                                                <input 
                                                    placeholder="username" 
                                                    name="username" 
                                                    className="form-control" 
                                                    value={inventoryUser.username} 
                                                    onChange={onChangeHandler} 
                                                />
                                                {errors.username && <p style={{ color: "red" }}>{errors.username}</p>}
                                            </div>
                                            <div className="form-group">
                                                <label>Password: </label>
                                                <input 
                                                    type="password"   
                                                    name="password" 
                                                    className="form-control" 
                                                    value={inventoryUser.password} 
                                                    onChange={onChangeHandler}
                                                />
                                                {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}
                                            </div>
                                            <div className="form-group">
                                                <label>Retype your Password: </label>
                                                <input 
                                                    type="password"   
                                                    name="confirmPassword" 
                                                    className="form-control" 
                                                    value={confirmPassword} 
                                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                                />
                                                {errors.confirmPassword && <p style={{ color: "red" }}>{errors.confirmPassword}</p>}
                                            </div>
                                            <div className="form-group">
                                                <label>User's Personal Name: </label>
                                                <input 
                                                    placeholder="personal name" 
                                                    name="personalName" 
                                                    className="form-control" 
                                                    value={inventoryUser.personalName} 
                                                    onChange={onChangeHandler} 
                                                />
                                                {errors.personalName && <p style={{ color: "red" }}>{errors.personalName}</p>}
                                            </div>
                                            <div className="form-group">
                                                <label>User Email: </label>
                                                <input 
                                                    placeholder="email" 
                                                    name="email" 
                                                    className="form-control" 
                                                    value={inventoryUser.email} 
                                                    onChange={onChangeHandler} 
                                                />
                                                {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
                                            </div>
                                            <div className="form-group">
                                                <label>Select Role : </label>
                                                <input 
                                                    list="types"  
                                                    name="role" 
                                                    className="form-control" 
                                                    value={inventoryUser.role} 
                                                    onChange={onChangeHandler} 
                                                    placeholder="Select or type role"
                                                />
                                                <datalist id="types">
                                                    <option value="Manager"/>
                                                    <option value="Vendor"/>
                                                    <option value="Admin"/>
                                                </datalist>
                                                {errors.role && <p style={{ color: "red" }}>{errors.role}</p>}
                                            </div>
                                            <div className="d-grid gap-3 mt-4">
                                                <button 
                                                    className="btn btn-primary btn-block" 
                                                    onClick={handleValidation}
                                                >
                                                    Register Now
                                                </button>
                                                <div className="text-center mt-3">
                                                    <span className="text-muted">Already have an account? </span>
                                                    <a href="/" className="text-primary">Sign In</a>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                
                                {/* Right side - Image */}
                                <div className="col-md-6 d-none d-md-block register-image">
                                    <div className="register-image-overlay">
                                        <h3>Welcome!</h3>
                                        <p>Join our community and start your journey with us.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterUser;