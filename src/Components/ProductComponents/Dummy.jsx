import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';

const Dummy = () => {
            let navigate = useNavigate();

            useEffect(() => {
                        navigate('/products-entry');
            }, []);
};
export default Dummy;
