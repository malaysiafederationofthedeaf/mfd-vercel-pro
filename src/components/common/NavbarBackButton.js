import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavbarBackButton = () => {
    const navigate = useNavigate();
    return (
        <button className="navbar-back-button" onClick={() => navigate(-1)}>
            <i className="material-icons">arrow_back</i>    
        </button>
    );
}

export default NavbarBackButton;
