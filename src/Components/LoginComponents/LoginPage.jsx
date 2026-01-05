import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { validateUser } from "../../Services/LoginService";
import "../../Desgin/Login.css";  // <-- Make sure folder matches spelling "Desgin"

const LoginPage = () => {
    let navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [loginData, setLoginData] = useState({
        username: "",
        password: "",
    });

    const validateLogin = (e) => {
        e.preventDefault();
        console.log('Attempting login with:', loginData.username);
        
        validateUser(loginData.username, loginData.password)
            .then((response) => {
                console.log('Login response:', response);
                let role = String(response.data);
                if (role === "Admin") {
                    navigate("/AdminMenu");
                } else if (role === "Manager") {
                    navigate("/ManagerMenu");
                } else if (role === "Vendor") {
                    navigate("/VendorMenu");
                } else {
                    alert("Invalid role received: " + role);
                }
                
            })
            .catch((error) => {
                console.error('Login error details:', error);
                if (error.response?.status === 404) {
                    alert("User not found. Please check your username.");
                } else if (error.response?.status === 401) {
                    alert("Incorrect password. Please try again.");
                } else if (error.response?.status === 403) {
                    alert("Access denied. Your account may be locked.");
                } else if (error.code === 'ERR_NETWORK') {
                    alert("Network error. Please check if the server is running.");
                } else {
                    alert("Login failed. Please try again. Error: " + (error.message || 'Unknown error'));
                }
            });
    };

    const handleValidation = (event) => {
        event.preventDefault();
        let tempErrors = {};
        let isValid = true;

        if (!loginData.username.trim()) {
            tempErrors.username = "User Name is required";
            isValid = false;
        }

        if (!loginData.password.trim()) {
            tempErrors.password = "Password is required";
            isValid = false;
        }

        setErrors(tempErrors);
        if (isValid) {
            validateLogin(event);
        }
    };

    return (
        <div className="login-background">
            <div className="login-container">
                <div className="login-box-ui app-card">
                    <h2 className="title">Inventory Login</h2>

                    <form onSubmit={handleValidation}>
                        <label>Username</label>
                        <input
                            placeholder="Enter username"
                            name="username"
                            value={loginData.username}
                            onChange={(e) =>
                                setLoginData({ ...loginData, username: e.target.value })
                            }
                        />
                        {errors.username && <p className="error">{errors.username}</p>}

                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            name="password"
                            value={loginData.password}
                            onChange={(e) =>
                                setLoginData({ ...loginData, password: e.target.value })
                            }
                        />
                        {errors.password && <p className="error">{errors.password}</p>}



                        <br/>
            

                        <button className="btn-login" type="submit">
                            Login
                        </button>

                        <p className="signup-text">
                            Don't have an account?
                            <span
                                className="signup-link"
                                onClick={() => navigate("/Register")}
                            >
                                Sign up
                            </span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;